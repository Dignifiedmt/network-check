import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/db.ts';
import { handleUssdRequest } from '../integrations/africastalking/ussd.ts';
import { smsService } from '../integrations/africastalking/sms.ts';
import { geminiService } from '../integrations/gemini/geminiService.ts';
import { hashPhoneNumber, maskPhoneNumber, generateReference } from '../utils/phoneHash.ts';
import { validateBaselineCsv } from '../utils/csvValidator.ts';
import { requireAdminAuth, generateToken, AuthRequest } from '../middleware/auth.ts';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC REFERENCE DATA (States, LGAs, Operators)
// ==========================================

apiRouter.get('/states', async (req: Request, res: Response) => {
  try {
    const states = await db.getStates();
    res.json({ states });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch states', details: error.message });
  }
});

apiRouter.get('/states/:id/lgas', async (req: Request, res: Response) => {
  try {
    const stateId = parseInt(req.params.id, 10);
    if (isNaN(stateId)) return res.status(400).json({ error: 'Invalid state ID' });
    const lgas = await db.getLgas(stateId);
    res.json({ stateId, lgas });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch LGAs', details: error.message });
  }
});

apiRouter.get('/operators', async (req: Request, res: Response) => {
  try {
    const operators = await db.getOperators();
    res.json({ operators });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch operators', details: error.message });
  }
});

// ==========================================
// 2. NETWORK BASELINES & COMPARISONS
// ==========================================

apiRouter.get('/network-baseline', async (req: Request, res: Response) => {
  try {
    const stateId = req.query.stateId ? parseInt(req.query.stateId as string, 10) : undefined;
    const lgaId = req.query.lgaId ? parseInt(req.query.lgaId as string, 10) : undefined;
    const operatorId = req.query.operatorId ? parseInt(req.query.operatorId as string, 10) : undefined;
    const datasetVersion = req.query.datasetVersion as string | undefined;

    const baselines = await db.getBaselines({ stateId, lgaId, operatorId, datasetVersion });
    res.json({ baselines });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query baselines', details: error.message });
  }
});

apiRouter.get('/network-baseline/compare', async (req: Request, res: Response) => {
  try {
    const stateId = parseInt(req.query.stateId as string, 10) || 1;
    const lgaId = parseInt(req.query.lgaId as string, 10) || 1;

    const comparison = await db.getBaselineComparison(stateId, lgaId);
    res.json({ comparison });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate comparison', details: error.message });
  }
});

// ==========================================
// 3. COMMUNITY REPORTS
// ==========================================

apiRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const {
      state_id,
      lga_id,
      operator_id,
      issue_type,
      description,
      reported_time,
      phone_number,
      source,
    } = req.body;

    if (!state_id || !lga_id || !operator_id || !issue_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'state_id, lga_id, operator_id, and issue_type are required.',
      });
    }

    const reference = generateReference();
    const phoneHash = phone_number ? hashPhoneNumber(phone_number) : 'anon_' + Math.random().toString(36).substring(7);
    const phoneMasked = maskPhoneNumber(phone_number);

    // AI Classification of free-text description (Hausa, Pidgin, or English)
    const aiResult = await geminiService.classifyReport(description || '');

    const newReport = await db.createCommunityReport({
      reference,
      phone_hash: phoneHash,
      phone_masked: phoneMasked,
      state_id: Number(state_id),
      lga_id: Number(lga_id),
      operator_id: Number(operator_id),
      issue_type,
      description: description || '',
      reported_time: reported_time || 'Now',
      language: aiResult.language,
      ai_category: aiResult.category,
      ai_severity: aiResult.severity,
      source: source === 'Demo' ? 'Demo' : 'Community',
    });

    // Create AI analysis record
    await db.createAiAnalysis({
      report_id: newReport.id,
      model: 'gemini-3.8-flash',
      category: aiResult.category,
      language: aiResult.language,
      severity: aiResult.severity,
      summary: aiResult.notes || `Classified ${aiResult.category} issue reported in ${aiResult.language}.`,
    });

    // If citizen provided phone, dispatch SMS receipt
    if (phone_number && phone_number.length >= 8) {
      const lga = await db.getLgaById(Number(lga_id));
      const op = await db.getOperatorById(Number(operator_id));
      const confirmationSms = smsService.formatReportConfirmationSms(
        lga?.name || 'Local Area',
        op?.name || 'Mobile Network',
        issue_type.replace('_', ' '),
        reference
      );
      await smsService.sendSms({
        to: phone_number,
        message: confirmationSms,
        reference,
      });
    }

    res.status(201).json({
      success: true,
      report: newReport,
      aiClassification: aiResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record report', details: error.message });
  }
});

apiRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const stateId = req.query.stateId ? parseInt(req.query.stateId as string, 10) : undefined;
    const lgaId = req.query.lgaId ? parseInt(req.query.lgaId as string, 10) : undefined;
    const operatorId = req.query.operatorId ? parseInt(req.query.operatorId as string, 10) : undefined;
    const issueType = req.query.issueType as string | undefined;
    const aiSeverity = req.query.aiSeverity as string | undefined;
    const source = req.query.source as string | undefined;
    const status = req.query.status as string | undefined;

    const reports = await db.getCommunityReports({
      stateId,
      lgaId,
      operatorId,
      issueType,
      aiSeverity,
      source,
      status,
    });

    const states = await db.getStates();
    const lgas = await db.getLgas();
    const operators = await db.getOperators();

    // Enrich reports with names for clean display
    const enriched = reports.map(r => ({
      ...r,
      state_name: states.find(s => s.id === r.state_id)?.name || 'Unknown',
      lga_name: lgas.find(l => l.id === r.lga_id)?.name || 'Unknown',
      operator_name: operators.find(o => o.id === r.operator_id)?.name || 'Unknown',
      operator_code: operators.find(o => o.id === r.operator_id)?.code || 'UNK',
    }));

    res.json({ reports: enriched });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

apiRouter.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const report = await db.getCommunityReportById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const state = await db.getStateById(report.state_id);
    const lga = await db.getLgaById(report.lga_id);
    const operator = await db.getOperatorById(report.operator_id);
    const aiAnalyses = await db.getAiAnalyses();
    const reportAi = aiAnalyses.find(a => a.report_id === report.id);

    res.json({
      report: {
        ...report,
        state_name: state?.name,
        lga_name: lga?.name,
        operator_name: operator?.name,
        operator_code: operator?.code,
      },
      aiAnalysis: reportAi,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch report details', details: error.message });
  }
});

// ==========================================
// 4. ANALYTICS & AI INSIGHTS
// ==========================================

apiRouter.get('/analytics/overview', requireAdminAuth as any, async (req: Request, res: Response) => {
  try {
    const overview = await db.getAnalyticsOverview();
    res.json({ overview });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch overview metrics', details: error.message });
  }
});

apiRouter.get('/analytics/areas', async (req: Request, res: Response) => {
  try {
    const areas = await db.getAreaAnalytics();
    res.json({ areas });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch area analytics', details: error.message });
  }
});

apiRouter.get('/ai/insights', async (req: Request, res: Response) => {
  try {
    const reports = await db.getCommunityReports();
    const lgas = await db.getLgas();
    const operators = await db.getOperators();

    const formatted = reports.map(r => ({
      lgaName: lgas.find(l => l.id === r.lga_id)?.name || 'Unknown',
      operatorName: operators.find(o => o.id === r.operator_id)?.name || 'Unknown',
      issue: r.issue_type,
      severity: r.ai_severity,
      time: r.created_at,
      description: r.description,
    }));

    const insights = await geminiService.generateAdminSummary(formatted);
    res.json({
      insights: {
        ...insights,
        attributionNote: 'AI-generated analysis based strictly on submitted community reports. Does not imply root physical causation.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate insights', details: error.message });
  }
});

apiRouter.post('/ai/analyze-report', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text prompt required' });
    const classification = await geminiService.classifyReport(text);
    res.json({ classification });
  } catch (error: any) {
    res.status(500).json({ error: 'Classification failed', details: error.message });
  }
});

// ==========================================
// 5. DATA SOURCES METADATA
// ==========================================

apiRouter.get('/sources', async (req: Request, res: Response) => {
  try {
    const sources = [
      {
        id: 'ncc-q1-2026',
        name: 'Nigerian Communications Commission (NCC) QoS Bulletin',
        type: 'Official',
        url: 'https://ncc.gov.ng/technical-standards/qos-reports',
        datasetVersion: 'NCC-QOS-2026-Q1',
        lastUpdated: '2026-02-15',
        recordsCount: 15,
        status: 'Active Verified',
        notes: 'Official drive-test & network operator QoS submissions across major urban centers.',
      },
      {
        id: 'community-crowdsourced',
        name: 'NetworkCheck Citizen USSD & SMS Reports',
        type: 'Community',
        url: 'https://networkcheck.ng/reports',
        datasetVersion: 'LIVE-COMMUNITY',
        lastUpdated: new Date().toISOString().split('T')[0],
        recordsCount: (await db.getCommunityReports()).length,
        status: 'Real-Time Streaming',
        notes: 'Citizens reporting dropped calls, slow data, and blackouts without needing mobile internet.',
      },
      {
        id: 'demo-test-dataset',
        name: 'DEMO DATA — not real network measurements',
        type: 'Demo',
        url: '',
        datasetVersion: 'DEMO-AUDIT-2026',
        lastUpdated: '2026-03-01',
        recordsCount: 2,
        status: 'Test Fixture',
        notes: 'Synthetic data used solely to validate UI and test scenarios during development and hackathon demos.',
      },
    ];
    res.json({ sources });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sources', details: error.message });
  }
});

// ==========================================
// 6. ADMIN AUTHENTICATION
// ==========================================

apiRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = await db.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

apiRouter.get('/admin/me', requireAdminAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ==========================================
// 7. CSV VALIDATION & IMPORT (Admin Only)
// ==========================================

apiRouter.post('/admin/baselines/validate-csv', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) {
      return res.status(400).json({ error: 'csvContent string is required' });
    }

    const validation = await validateBaselineCsv(csvContent);
    res.json({ validation });
  } catch (error: any) {
    res.status(500).json({ error: 'Validation failed', details: error.message });
  }
});

apiRouter.post('/admin/baselines/import', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) {
      return res.status(400).json({ error: 'csvContent string is required' });
    }

    const validation = await validateBaselineCsv(csvContent);
    if (!validation.canImport) {
      return res.status(400).json({
        error: 'Cannot import invalid CSV',
        errorCount: validation.errorRowsCount,
        details: validation.rows.filter(r => !r.isValid),
      });
    }

    const rowsToImport = validation.rows
      .filter(r => r.isValid && r.parsed)
      .map(r => ({
        ...r.parsed!,
        notes: r.parsed!.notes || '',
      }));

    const result = await db.batchImportBaselines(rowsToImport);

    res.json({
      success: true,
      importedCount: result.importedCount,
      updatedCount: result.updatedCount,
      totalProcessed: rowsToImport.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
});

// ==========================================
// 8. AFRICA'S TALKING USSD & SMS INTEGRATION
// ==========================================

apiRouter.all(['/ussd/webhook', '/ussd'], async (req: Request, res: Response) => {
  try {
    const body = { ...req.query, ...req.body };
    const sessionId = body.sessionId || `session-${Date.now()}`;
    const serviceCode = body.serviceCode || process.env.AT_USSD_SERVICE_CODE || '*384*20220#';
    const phoneNumber = body.phoneNumber || '+2348030000000';
    const text = body.text !== undefined ? String(body.text) : '';

    console.log(`📱 [USSD Inbound] Method: ${req.method} | Phone: ${maskPhoneNumber(phoneNumber)} | Code: ${serviceCode} | Text: "${text}"`);

    const responseText = await handleUssdRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(responseText);
  } catch (error: any) {
    console.error('USSD Webhook execution failed:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send('END Sorry, NetworkCheck service is momentarily unavailable. Please try again.');
  }
});

apiRouter.all(['/sms/webhook', '/sms'], async (req: Request, res: Response) => {
  try {
    const body = { ...req.query, ...req.body };
    const { from, text, id, to, date, linkId } = body;

    console.log(`📩 [SMS Inbound] Method: ${req.method} | From: ${maskPhoneNumber(from || '')} | Text: "${text || ''}"`);

    if (!from || !text) {
      return res.status(200).json({ error: 'Missing from or text parameter', hint: 'Provide from and text in POST or GET body' });
    }

    const result = await smsService.processIncomingSms({
      from,
      text,
      id,
      to,
      date,
      linkId,
    });

    res.status(200).json({
      status: 'success',
      processed: result.processed,
      action: result.action,
    });
  } catch (error: any) {
    console.error('SMS webhook processing failed:', error);
    res.status(200).json({ error: 'SMS webhook processing failed', details: error.message });
  }
});

apiRouter.all(['/sms/delivery-reports', '/delivery-reports'], async (req: Request, res: Response) => {
  try {
    const body = { ...req.query, ...req.body };
    const { id, status, phoneNumber } = body;

    console.log(`📨 [SMS Delivery Report] ID: ${id}, Status: ${status}, Phone: ${maskPhoneNumber(phoneNumber || '')}`);

    let normalizedStatus: 'sent' | 'delivered' | 'failed' = 'sent';
    if (status === 'Success' || status === 'Delivered') {
      normalizedStatus = 'delivered';
    } else if (status === 'Failed' || status === 'Rejected') {
      normalizedStatus = 'failed';
    }

    if (id) {
      await db.updateSmsLogStatus(id, normalizedStatus);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Delivery report webhook error:', error);
    res.status(200).json({ error: 'Failed to process delivery report' });
  }
});

apiRouter.get('/africastalking/status', (req: Request, res: Response) => {
  try {
    const status = smsService.getIntegrationStatus(req.headers.host);
    res.json({
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve Africa\'s Talking status', details: error.message });
  }
});

apiRouter.post('/africastalking/simulate-incoming-sms', async (req: Request, res: Response) => {
  try {
    const { from, text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text message is required' });
    }

    const result = await smsService.processIncomingSms({
      from: from || '+2348031234567',
      text,
    });

    res.json({
      success: true,
      senderMasked: maskPhoneNumber(from || '+2348031234567'),
      reply: result.replyText,
      action: result.action,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to simulate incoming SMS', details: error.message });
  }
});

apiRouter.post('/sms/send', async (req: Request, res: Response) => {
  try {
    const { to, message, reference } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'to and message fields required' });
    }

    const result = await smsService.sendSms({ to, message, reference });
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: 'SMS dispatch failed', details: error.message });
  }
});

apiRouter.post('/sms/request-summary', async (req: Request, res: Response) => {
  try {
    const { stateId, lgaId, phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const stateIdNum = parseInt(stateId, 10) || 1;
    const lgaIdNum = parseInt(lgaId, 10) || 1;

    const lgas = await db.getLgas(stateIdNum);
    const lga = lgas.find(l => l.id === lgaIdNum) || lgas[0];

    const comparison = await db.getBaselineComparison(stateIdNum, lgaIdNum);
    const sourceInfo = comparison.primarySource?.name || 'NCC QoS Audit';
    const opData = (comparison.operators || []).map(op => ({
      operatorCode: op.operator.code,
      voice: op.baseline?.voice_rating || 'Fair',
      data: op.baseline?.data_rating || 'Fair',
    }));

    const message = smsService.formatAreaSms(lga ? lga.name : 'Area', opData, sourceInfo);
    const sendResult = await smsService.sendSms({
      to: phoneNumber,
      message,
      reference: `SUM-${Date.now()}`,
    });

    res.json({
      success: sendResult.success,
      smsRef: sendResult.messageId || `SUM-${Date.now()}`,
      message,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to dispatch summary SMS', details: error.message });
  }
});

apiRouter.get('/sms/outbox', async (req: Request, res: Response) => {
  try {
    const logs = await db.getSmsLogs();
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch SMS logs', details: error.message });
  }
});

// ==========================================
// 9. NIGERIAN BANK NETWORKS TELEMETRY & STATUS
// ==========================================

apiRouter.get('/banks', async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    let banks = await db.getBanks();

    if (status && typeof status === 'string') {
      banks = banks.filter(b => b.status === status);
    }
    if (category && typeof category === 'string') {
      banks = banks.filter(b => b.category === category);
    }

    res.json({
      banks,
      summary: {
        total: banks.length,
        operationalCount: banks.filter(b => b.status === 'operational').length,
        degradedCount: banks.filter(b => b.status === 'degraded').length,
        downCount: banks.filter(b => b.status === 'down').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch bank networks', details: error.message });
  }
});

apiRouter.get('/banks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const bank = await db.getBankById(id);
    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json({ bank });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch bank details', details: error.message });
  }
});

apiRouter.post('/banks/report', async (req: Request, res: Response) => {
  try {
    const { bank_id, issue_type, description, phone_number } = req.body;
    if (!bank_id || !issue_type) {
      return res.status(400).json({ error: 'bank_id and issue_type are required' });
    }

    const rawPhone = phone_number || '+2348000000000';
    const phone_hash = hashPhoneNumber(rawPhone);
    const phone_masked = maskPhoneNumber(rawPhone);

    const result = await db.createBankReport({
      bank_id: parseInt(bank_id, 10),
      issue_type,
      description: description || '',
      phone_hash,
      phone_masked,
    });

    res.status(201).json({
      success: true,
      bank: result.bank,
      message: 'Bank issue reported successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record bank report', details: error.message });
  }
});
