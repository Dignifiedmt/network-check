import assert from 'assert';
import bcrypt from 'bcryptjs';
import { db } from '../db/db.ts';
import { handleUssdRequest } from '../integrations/africastalking/ussd.ts';
import { geminiService } from '../integrations/gemini/geminiService.ts';
import { validateBaselineCsv } from '../utils/csvValidator.ts';
import { generateToken } from '../middleware/auth.ts';
import { smsService } from '../integrations/africastalking/sms.ts';
import { hashPhoneNumber, maskPhoneNumber, generateReference } from '../utils/phoneHash.ts';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 Starting NetworkCheck Hackathon Automated Test Suite');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. States & LGAs Lookup
  await test('States and LGAs lookup', async () => {
    const states = await db.getStates();
    assert(states.length >= 5, 'Should have multiple Nigerian states seeded');
    const kaduna = states.find(s => s.name === 'Kaduna');
    assert(kaduna, 'Kaduna State must be present');

    const kadunaLgas = await db.getLgas(kaduna.id);
    assert(kadunaLgas.length >= 5, 'Kaduna should have at least 5 LGAs seeded');
    const chikun = kadunaLgas.find(l => l.name === 'Chikun');
    assert(chikun, 'Chikun LGA must be present');
  });

  // 2. Network Comparison Logic
  await test('Network baseline comparison for Chikun LGA', async () => {
    const comparison = await db.getBaselineComparison(1, 1);
    assert(comparison.state?.name === 'Kaduna', 'State should be Kaduna');
    assert(comparison.lga?.name === 'Chikun', 'LGA should be Chikun');
    assert(comparison.operators.length >= 3, 'Should compare multiple operators (MTN, Airtel, Glo)');
    assert(comparison.primarySource.name.length > 0, 'Source must be attributed');
    assert(comparison.primarySource.type === 'Official' || comparison.primarySource.type === 'Demo', 'Source type must be identified');
  });

  // 3. Community Report Creation & Duplicate Check
  await test('Community report creation with hashing and reference', async () => {
    const ref = generateReference();
    assert(ref.startsWith('NC-'), 'Reference should match NC-XXXXX format');

    const phone = '+2348031234567';
    const hash = hashPhoneNumber(phone);
    const masked = maskPhoneNumber(phone);

    assert(hash.length === 64, 'SHA-256 hash must be 64 characters');
    assert(masked === '+234 803 *** 4567', 'Masked number format check');

    const report = await db.createCommunityReport({
      reference: ref,
      phone_hash: hash,
      phone_masked: masked,
      state_id: 1,
      lga_id: 1,
      operator_id: 1,
      issue_type: 'slow_data',
      description: 'Test automated report',
      source: 'Demo',
    });

    assert(report.id > 0, 'Report ID should be assigned');
    assert(report.reference === ref, 'Report reference should match');

    // Duplicate flag check
    const dupRef = generateReference();
    const dupReport = await db.createCommunityReport({
      reference: dupRef,
      phone_hash: hash,
      state_id: 1,
      lga_id: 1,
      operator_id: 1,
      issue_type: 'slow_data',
      description: 'Second report from same phone within window',
      source: 'Demo',
    });
    assert(dupReport.duplicate_flag === true, 'Rapid duplicate from same phone must set duplicate_flag = true');
  });

  // 4. Multilingual AI Classification (Hausa, Pidgin, English)
  await test('AI Multilingual Classification (Hausa, Pidgin, English)', async () => {
    // Hausa test
    const hausaResult = await geminiService.classifyReport('Internet baya aiki sosai tun safe a Sabon Tasha.');
    assert(hausaResult.language === 'Hausa', `Expected Hausa language, got ${hausaResult.language}`);
    assert(hausaResult.category === 'mobile_data', `Expected mobile_data category, got ${hausaResult.category}`);

    // Pidgin test
    const pidginResult = await geminiService.classifyReport('The MTN network for Barnawa dey drop call every 2 minutes.');
    assert(pidginResult.language === 'Nigerian Pidgin', `Expected Nigerian Pidgin, got ${pidginResult.language}`);
    assert(pidginResult.category === 'voice', `Expected voice category, got ${pidginResult.category}`);

    // English Outage test
    const englishResult = await geminiService.classifyReport('Total blackout on cell tower, no network signal at all.');
    assert(englishResult.category === 'no_network', `Expected no_network category, got ${englishResult.category}`);
    assert(englishResult.severity === 'high', 'Total blackout should be marked high severity');
  });

  // 5. USSD Menu Interaction Flows
  await test('USSD Menu Navigation (Dial -> Check Area -> Chikun -> SMS)', async () => {
    // Step 0: Dial
    const res0 = await handleUssdRequest({
      sessionId: 'test-sess-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348031112233',
      text: '',
    });
    assert(res0.startsWith('CON Welcome to NetworkCheck'), 'Initial dial must return welcome menu');
    assert(res0.includes('1. Check my area'), 'Must have Check my area');

    // Step 1: Select 1 (Check Area)
    const res1 = await handleUssdRequest({
      sessionId: 'test-sess-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348031112233',
      text: '1',
    });
    assert(res1.startsWith('CON Select State:'), 'Should ask for State selection');
    assert(res1.includes('Kaduna'), 'Kaduna must be an option');

    // Step 2: Select 1 (Kaduna)
    const res2 = await handleUssdRequest({
      sessionId: 'test-sess-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348031112233',
      text: '1*1',
    });
    assert(res2.startsWith('CON Kaduna State: Select LGA:'), 'Should ask for LGA selection in Kaduna');
    assert(res2.includes('Chikun'), 'Chikun must be an option');

    // Step 3: Select 1 (Chikun LGA)
    const res3 = await handleUssdRequest({
      sessionId: 'test-sess-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348031112233',
      text: '1*1*1',
    });
    assert(res3.startsWith('CON CHIKUN LGA'), 'Should show Chikun LGA title');
    assert(res3.includes('Voice') && res3.includes('Data'), 'Should show Voice and Data ratings');
    assert(res3.includes('Source:'), 'Must show data source attribution');
    assert(res3.includes('1. Send by SMS'), 'Must offer SMS option');

    // Step 4: Select 1 (Send SMS)
    const res4 = await handleUssdRequest({
      sessionId: 'test-sess-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348031112233',
      text: '1*1*1*1',
    });
    assert(res4.startsWith('END NetworkCheck result sent to your phone via SMS'), 'Should terminate session with END');
  });

  // 6. USSD Problem Reporting Flow
  await test('USSD Report Problem Flow', async () => {
    // text: "3*1*2*1*1*1" -> 3 (Report problem) * 1 (MTN) * 2 (Slow Data) * 1 (Now) * 1 (Kaduna) * 1 (Chikun)
    const res = await handleUssdRequest({
      sessionId: 'test-sess-report',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348039998877',
      text: '3*1*2*1*1*1',
    });
    assert(res.startsWith('END Report received.'), 'Should confirm report creation');
    assert(res.includes('Reference: NC-'), 'Should include reference number');
  });

  // 7. CSV Validation Logic
  await test('CSV Baseline Import Validation and Error Detection', async () => {
    // Valid CSV
    const validCsv = `state,lga,operator,voice_rating,data_rating,sms_rating,source_name,source_type,source_url,dataset_version,last_updated
Kaduna,Chikun,MTN,Good,Good,Good,NCC Q1 Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-01`;

    const validResult = await validateBaselineCsv(validCsv);
    assert(validResult.canImport === true, 'Valid CSV should pass validation');
    assert(validResult.validRowsCount === 1, 'Should have 1 valid row');

    // Invalid CSV (unknown state, invalid rating)
    const invalidCsv = `state,lga,operator,voice_rating,data_rating,sms_rating,source_name,source_type,source_url,dataset_version,last_updated
InvalidState,Chikun,MTN,SuperAwesome,Good,Good,NCC Q1,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-01`;

    const invalidResult = await validateBaselineCsv(invalidCsv);
    assert(invalidResult.canImport === false, 'Invalid CSV should fail');
    assert(invalidResult.errorRowsCount === 1, 'Should flag row errors');
    assert(invalidResult.rows[0].errors.some(e => e.includes('Unknown state')), 'Must detect unknown state');
    assert(invalidResult.rows[0].errors.some(e => e.includes('voice_rating')), 'Must detect invalid rating');
  });

  // 8. Admin Authentication & Token Verification
  await test('Admin Authentication & JWT Generation', async () => {
    const admin = await db.getAdminByEmail('admin@networkcheck.ng');
    assert(admin, 'Default admin user must exist');

    const validPassword = bcrypt.compareSync('admin_secure_password_2026', admin.password_hash);
    assert(validPassword === true, 'Default password should verify correctly');

    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });
    assert(token && token.split('.').length === 3, 'Should generate valid 3-part JWT');

    const overview = await db.getAnalyticsOverview();
    assert(overview && typeof overview.totalReports === 'number', 'Analytics overview metrics accessible to admin');
  });

  // 9. SMS Service Simulation & Masking
  await test('SMS Simulation Dispatch', async () => {
    const result = await smsService.sendSms({
      to: '+2348035551234',
      message: 'NetworkCheck Test SMS',
      reference: 'TEST-SMS-01',
    });
    assert(result.success === true, 'SMS send should succeed');
    assert(result.recipientMasked === '+234 803 *** 1234', 'Masked phone number in result');

    const outbox = await db.getSmsLogs();
    const logged = outbox.find(l => l.reference === 'TEST-SMS-01');
    assert(logged, 'SMS should be logged into database');
  });

  // 10. Nigerian Bank Network Telemetry & USSD Inspection
  await test('Nigerian Bank Networks lookup & USSD flow (*384*20220# -> 4)', async () => {
    // 10a. DB lookup
    const banks = await db.getBanks();
    assert(banks.length >= 10, 'Should have multiple Nigerian commercial and fintech banks seeded');
    const gtb = banks.find(b => b.code === 'GTB');
    assert(gtb, 'GTBank must exist');
    assert(gtb.ussd_code === '*737#', 'GTBank USSD must be *737#');
    assert(gtb.status === 'operational', 'GTBank should be operational initially');

    // 10b. USSD Option 4 (Check Bank Networks menu)
    const ussdRes = await handleUssdRequest({
      sessionId: 'test-sess-bank-1',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348039991122',
      text: '4',
    });
    assert(ussdRes.startsWith('CON Bank Network Status:'), 'Should present bank network options');
    assert(ussdRes.includes('GTBank'), 'Should list GTBank');

    // 10c. USSD Option 4*2 (GTBank inspection)
    const ussdGtbRes = await handleUssdRequest({
      sessionId: 'test-sess-bank-2',
      serviceCode: '*384*20220#',
      phoneNumber: '+2348039991122',
      text: '4*2',
    });
    assert(ussdGtbRes.includes('GTBank'), 'Should show GTBank name');
    assert(ussdGtbRes.includes('*737#'), 'Should show GTBank USSD code');
    assert(ussdGtbRes.includes('Transfers:'), 'Should include transfer performance');

    // 10d. Bank issue reporting
    const reportRes = await db.createBankReport({
      bank_id: gtb.id,
      issue_type: 'failed_transfer',
      description: 'Transfer took over 4 hours during evening peak',
      phone_hash: hashPhoneNumber('+2348039991122'),
      phone_masked: maskPhoneNumber('+2348039991122'),
    });
    assert(reportRes.success === true, 'Bank issue reporting should succeed');
    assert(reportRes.bank.active_reports_count > 0, 'Active report count should increment');
  });

  // 11. Africa's Talking Two-Way SMS Processing & Auto-Reply Engine
  await test('Africa\'s Talking Two-Way Incoming SMS (BANK, LGA, HELP)', async () => {
    // 11a. Test "BANK" SMS query
    const bankSmsResult = await smsService.processIncomingSms({
      from: '+2348021112233',
      text: 'BANK',
      id: 'at-msg-bank-01',
    });
    assert(bankSmsResult.processed === true, 'Incoming SMS should be processed');
    assert(bankSmsResult.action === 'bank_status', 'Should route to bank status action');
    assert(bankSmsResult.replyText.includes('WORKING'), 'Should return active working banks');
    assert(bankSmsResult.replyText.includes('*384*20220#'), 'Should reference USSD code');

    // 11b. Test "CHIKUN" LGA lookup SMS query
    const lgaSmsResult = await smsService.processIncomingSms({
      from: '+2348021112233',
      text: 'CHIKUN',
      id: 'at-msg-lga-01',
    });
    assert(lgaSmsResult.action === 'area_lookup', 'Should route to area lookup');
    assert(lgaSmsResult.replyText.includes('Chikun'), 'Should include Chikun LGA name');
    assert(lgaSmsResult.replyText.includes('MTN'), 'Should include MTN operator rating');

    // 11c. Test "REPORT" via SMS
    const reportSmsResult = await smsService.processIncomingSms({
      from: '+2348021112233',
      text: 'REPORT AIRTEL CHIKUN NO NETWORK',
      id: 'at-msg-rep-01',
    });
    assert(reportSmsResult.action === 'community_report', 'Should register community report');
    assert(reportSmsResult.replyText.includes('Tracking Ref:'), 'Should return tracking reference');

    // 11d. Verify outbox log has incoming messages recorded
    const logs = await db.getSmsLogs();
    const incomingLog = logs.find(l => l.direction === 'incoming' && l.message === 'BANK');
    assert(incomingLog, 'Incoming SMS must be logged with direction="incoming"');
    assert(incomingLog.phone_masked === '+234 802 *** 2233', 'Sender phone masked under NDPR');
  });

  // 12. Africa's Talking Gateway Status & Delivery Reports
  await test('Africa\'s Talking Status Diagnostics & Delivery Report Updates', async () => {
    const status = smsService.getIntegrationStatus('test.railway.app');
    assert(status.webhooks.ussdUrl.includes('/api/ussd/webhook'), 'USSD webhook URL generated');
    assert(status.webhooks.smsUrl.includes('/api/sms/webhook'), 'SMS webhook URL generated');
    assert(status.webhooks.deliveryReportsUrl.includes('/api/sms/delivery-reports'), 'DLR webhook URL generated');
    assert(status.simulatorUrl === 'https://simulator.africastalking.com:1517/', 'AT Simulator URL provided');

    // Test delivery status update
    const sendRes = await smsService.sendSms({
      to: '+2348099887766',
      message: 'Testing delivery report callback',
      reference: 'DLR-REF-99',
    });
    assert(sendRes.success === true, 'Initial send should succeed');

    const updated = await db.updateSmsLogStatus('DLR-REF-99', 'delivered');
    assert(updated === true, 'Delivery report should update log status in DB');

    const logs = await db.getSmsLogs();
    const deliveredLog = logs.find(l => l.reference === 'DLR-REF-99');
    assert(deliveredLog?.status === 'delivered', 'Status should be delivered');
  });

  console.log('\n========================================================');
  console.log(`Test Suite Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
