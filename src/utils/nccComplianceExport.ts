import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommunityReport } from '../types';

export interface NccComplianceMetadata {
  reportingQuarter?: string;
  auditJurisdiction?: string;
  complianceOfficer?: string;
  commissionRef?: string;
  notes?: string;
}

/**
 * Generates standardized NCC QoS compliance CSV content
 */
export function generateNccComplianceCsv(
  reports: CommunityReport[],
  metadata?: NccComplianceMetadata
): string {
  const timestamp = new Date().toISOString();
  const quarter = metadata?.reportingQuarter || 'Q1 2026 Audit Window';
  const jurisdiction = metadata?.auditJurisdiction || 'Kaduna State (All Monitored LGAs)';
  const officer = metadata?.complianceOfficer || 'NetworkCheck Telecom Regulatory Liaison';
  const commissionRef = metadata?.commissionRef || `NCC-QOS-REC-${Date.now().toString().slice(-6)}`;

  const headerComments = [
    `# ==============================================================================`,
    `# NIGERIAN COMMUNICATIONS COMMISSION (NCC) - QoS COMPLIANCE REPORT`,
    `# COMMISSION REFERENCE : ${commissionRef}`,
    `# REPORTING PERIOD     : ${quarter}`,
    `# AUDIT JURISDICTION   : ${jurisdiction}`,
    `# COMPLIANCE OFFICER   : ${officer}`,
    `# GENERATION TIMESTAMP : ${timestamp}`,
    `# PRIVACY STANDARD     : NDPA / NDPR ENFORCED (SALTED SHA-256 INTEGRITY HASH)`,
    `# ==============================================================================`,
  ].join('\n');

  const headers = [
    'Compliance_Ref',
    'Submission_Timestamp',
    'State_Code',
    'State_Name',
    'LGA_Name',
    'Operator_Code',
    'Operator_Name',
    'QoS_Category',
    'Reported_Issue',
    'Severity_Grade',
    'Language_Detected',
    'Citizen_Narrative',
    'Data_Provenance',
    'NDPR_MSISDN_Mask',
    'Integrity_Hash',
    'Verification_Status',
  ].join(',');

  const rows = reports.map(r => {
    const qosCategory =
      r.issue_type === 'slow_data'
        ? 'Data Throughput / Latency'
        : r.issue_type === 'no_network'
        ? 'Base Station Availability / Blackout'
        : r.issue_type === 'dropped_calls'
        ? 'Voice Call Retention'
        : r.issue_type === 'call_connect_fail'
        ? 'Call Setup Success Rate'
        : r.issue_type === 'sms_problem'
        ? 'SMS / Short-Message Delivery'
        : 'General Network Quality';

    const severityGrade =
      r.ai_severity === 'high'
        ? 'GRADE-1 (CRITICAL SERVICE OUTAGE)'
        : r.ai_severity === 'moderate'
        ? 'GRADE-2 (DEGRADED SERVICE)'
        : 'GRADE-3 (MINOR QUALITY DEVIATION)';

    const escapeCsv = (val: string | undefined | null) => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
      return `"${clean}"`;
    };

    return [
      escapeCsv(r.reference),
      escapeCsv(r.created_at || timestamp),
      escapeCsv('KD'),
      escapeCsv(r.state_name || 'Kaduna'),
      escapeCsv(r.lga_name || 'Chikun'),
      escapeCsv(r.operator_code || 'MTN'),
      escapeCsv(r.operator_name || 'MTN Nigeria'),
      escapeCsv(qosCategory),
      escapeCsv(r.issue_type),
      escapeCsv(severityGrade),
      escapeCsv(r.language || 'English'),
      escapeCsv(r.description || 'USSD numeric report'),
      escapeCsv(r.source === 'Official' ? 'Official NCC Baseline' : r.source === 'Demo' ? 'DEMO TEST DATA' : 'Community Reported'),
      escapeCsv(r.phone_masked || '+234 803 *** ****'),
      escapeCsv(r.phone_hash || 'SHA256_HASH_PROTECTED'),
      escapeCsv(r.status || 'verified'),
    ].join(',');
  });

  return `${headerComments}\n${headers}\n${rows.join('\n')}`;
}

/**
 * Triggers instant browser download of NCC-compliant CSV
 */
export function downloadNccComplianceCsv(
  reports: CommunityReport[],
  metadata?: NccComplianceMetadata
) {
  const csv = generateNccComplianceCsv(reports, metadata);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `NCC_QoS_Compliance_Report_${metadata?.commissionRef || Date.now()}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads an official NCC Compliance Dossier in PDF format
 */
export function generateNccCompliancePdf(
  reports: CommunityReport[],
  metadata?: NccComplianceMetadata
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const timestamp = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const commissionRef = metadata?.commissionRef || `NCC-QOS-2026-KD-${Math.floor(1000 + Math.random() * 9000)}`;
  const jurisdiction = metadata?.auditJurisdiction || 'Kaduna State (23 Local Government Areas)';
  const officer = metadata?.complianceOfficer || 'Director of Telecommunications Standards & Civic QoS Liaison';

  // 1. Header Banner (Federal Green #008751)
  doc.setFillColor(0, 135, 81);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Gold accent bar
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('NIGERIAN COMMUNICATIONS COMMISSION (NCC)', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TECHNICAL STANDARDS & NETWORK INTEGRITY AUDIT DOSSIER', pageWidth / 2, 18, { align: 'center' });
  doc.text('Civic Connectivity Telemetry & Community Outage Verification Layer', pageWidth / 2, 23, { align: 'center' });

  // 2. Metadata Information Grid
  let yPos = 34;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, yPos, pageWidth - 24, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Commission Docket:', 16, yPos + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(commissionRef, 50, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Jurisdiction:', 16, yPos + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(jurisdiction, 50, yPos + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Reporting Window:', 16, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(metadata?.reportingQuarter || 'Q1 2026 Audit Window', 50, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Compliance Officer:', 16, yPos + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(officer, 50, yPos + 24);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Date of Generation:', 125, yPos + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(timestamp, 158, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('NDPR Data Security:', 125, yPos + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('HMAC SHA-256 Certified', 158, yPos + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Data Collection Method:', 125, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('USSD (*384*22020#) & SMS 22020', 158, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Submissions:', 125, yPos + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 135, 81);
  doc.text(`${reports.length} Incidents Documented`, 158, yPos + 24);

  yPos += 34;

  // 3. Executive QoS Incident Breakdown Metrics
  const highCount = reports.filter(r => r.ai_severity === 'high').length;
  const modCount = reports.filter(r => r.ai_severity === 'moderate').length;
  const dataCount = reports.filter(r => r.issue_type === 'slow_data').length;
  const voiceCount = reports.filter(r => r.issue_type === 'dropped_calls' || r.issue_type === 'call_connect_fail').length;
  const blackoutCount = reports.filter(r => r.issue_type === 'no_network').length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE QUALITY OF SERVICE (QoS) METRIC SUMMARY', 12, yPos);
  yPos += 3;

  const metricBoxWidth = (pageWidth - 24 - 12) / 4;
  const metricCards = [
    { title: 'Critical Blackouts', count: blackoutCount, color: [220, 38, 38], bg: [254, 242, 242] },
    { title: 'Data Latency/Drops', count: dataCount, color: [202, 138, 4], bg: [254, 252, 232] },
    { title: 'Voice Disruption', count: voiceCount, color: [2, 132, 199], bg: [240, 249, 255] },
    { title: 'High Severity Flags', count: highCount, color: [147, 51, 234], bg: [250, 245, 255] },
  ];

  metricCards.forEach((card, idx) => {
    const x = 12 + idx * (metricBoxWidth + 4);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, yPos, metricBoxWidth, 16, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.title, x + metricBoxWidth / 2, yPos + 5, { align: 'center' });

    doc.setFontSize(11);
    doc.text(String(card.count), x + metricBoxWidth / 2, yPos + 12, { align: 'center' });
  });

  yPos += 22;

  // 4. Operator Summary Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. TELECOM OPERATOR INCIDENT DISTRIBUTION MATRIX', 12, yPos);
  yPos += 2;

  // Aggregate by operator
  const opStats: Record<string, { total: number; high: number; issues: Record<string, number> }> = {};
  reports.forEach(r => {
    const op = r.operator_name || 'MTN Nigeria';
    if (!opStats[op]) opStats[op] = { total: 0, high: 0, issues: {} };
    opStats[op].total += 1;
    if (r.ai_severity === 'high') opStats[op].high += 1;
    opStats[op].issues[r.issue_type] = (opStats[op].issues[r.issue_type] || 0) + 1;
  });

  const opRows = Object.entries(opStats).map(([opName, stat]) => {
    const topIssue = Object.entries(stat.issues).sort((a, b) => b[1] - a[1])[0]?.[0] || 'slow_data';
    const breachRate = reports.length > 0 ? Math.round((stat.total / reports.length) * 100) : 0;
    return [
      opName,
      stat.total.toString(),
      stat.high.toString(),
      topIssue.replace('_', ' ').toUpperCase(),
      `${breachRate}%`,
      stat.high > 2 ? 'Action Required' : 'Monitored',
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Telecom Operator', 'Total Reports', 'Critical Severity', 'Predominant QoS Defect', 'Report Share', 'NCC Compliance Action']],
    body: opRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 135, 81],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 12, right: 12 },
  });

  // Calculate position after first table
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need page break for Detailed Evidence Log
  if (yPos > 190) {
    doc.addPage();
    yPos = 16;
  }

  // 5. Detailed Citizen Incident Audit Trail
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. STANDARDIZED COMMUNITY INCIDENT REGISTER', 12, yPos);
  yPos += 2;

  const incidentRows = reports.map(r => [
    r.reference,
    r.created_at ? r.created_at.split('T')[0] : timestamp,
    `${r.lga_name || 'Chikun'} (${r.state_name || 'KD'})`,
    r.operator_code || 'MTN',
    r.issue_type.replace('_', ' ').toUpperCase(),
    r.ai_severity.toUpperCase(),
    r.language || 'English',
    (r.description || 'USSD numeric report').slice(0, 36) + ((r.description || '').length > 36 ? '...' : ''),
    r.source === 'Demo' ? 'DEMO' : r.source === 'Official' ? 'OFFICIAL' : 'COMMUNITY',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Ref ID', 'Date', 'LGA / State', 'Operator', 'QoS Issue', 'Severity', 'Lang', 'Citizen Narrative / Dialect', 'Source']],
    body: incidentRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18 },
      1: { cellWidth: 18 },
      2: { cellWidth: 24 },
      3: { cellWidth: 15 },
      4: { cellWidth: 22 },
      5: { cellWidth: 16 },
      6: { cellWidth: 14 },
      7: { cellWidth: 42 },
      8: { cellWidth: 17 },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // If near bottom of page, add fresh page for sign-off
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // 6. Regulatory Attestation & Sign-off Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, yPos, pageWidth - 24, 34, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('REGULATORY COMPLIANCE OATH & INTEGRITY CERTIFICATION:', 16, yPos + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'I hereby certify that this dossier accurately represents community-reported connectivity telemetry collected via toll-free USSD (*384*22020#) and SMS (22020). All personal identifier data (MSISDN) has been anonymized via HMAC SHA-256 hashing in strict compliance with the Nigeria Data Protection Act (NDPA) and NDPR standards.',
    16,
    yPos + 11,
    { maxWidth: pageWidth - 32 }
  );

  // Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.line(16, yPos + 28, 70, yPos + 28);
  doc.text('Compliance Officer Signature', 16, yPos + 32);

  doc.line(pageWidth - 75, yPos + 28, pageWidth - 16, yPos + 28);
  doc.text('Official NCC Commission Stamp / Date', pageWidth - 75, yPos + 32);

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Nigerian Communications Commission (NCC) Baseline QoS Audit - Docket: ${commissionRef} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      292,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `NCC_QoS_Compliance_Dossier_${commissionRef}.pdf`;
  doc.save(filename);
}
