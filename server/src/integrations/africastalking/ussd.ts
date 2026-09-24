import { db } from '../../db/db.ts';
import { hashPhoneNumber, maskPhoneNumber, generateReference } from '../../utils/phoneHash.ts';
import { smsService } from './sms.ts';
import { geminiService } from '../gemini/geminiService.ts';

export interface UssdCallbackPayload {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export async function handleUssdRequest(payload: UssdCallbackPayload): Promise<string> {
  const { sessionId, phoneNumber, serviceCode, text } = payload;
  const trimmedText = (text || '').trim();

  // In Africa's Talking USSD:
  // Each user input in a multi-step session is appended with an asterisk (*).
  // e.g., text = "" on first dial
  // text = "1" after user selects 1
  // text = "1*1" after user selects 1 then 1
  const inputs = trimmedText ? trimmedText.split('*') : [];

  try {
    // 1. Initial Dial: Main Menu
    if (inputs.length === 0) {
      return [
        'CON Welcome to NetworkCheck',
        '1. Check my area',
        '2. Compare networks',
        '3. Report network problem',
        '4. Check Bank Networks',
        '5. Get result by SMS',
        '6. Help',
        '0. Exit',
      ].join('\n');
    }

    const rootChoice = inputs[0];

    // EXIT OPTION
    if (rootChoice === '0') {
      return 'END Thank you for using NetworkCheck. Dial *384*22020# anytime or SMS 22020.';
    }

    // -------------------------------------------------------------
    // OPTION 1: CHECK MY AREA
    // Flow: 1 -> Select State -> Select LGA -> Display results -> 1. SMS result
    // -------------------------------------------------------------
    if (rootChoice === '1') {
      // Step 1: Select State
      if (inputs.length === 1) {
        const states = await db.getStates();
        const lines = ['CON Select State:'];
        states.slice(0, 5).forEach((s, idx) => {
          lines.push(`${idx + 1}. ${s.name}`);
        });
        lines.push('0. Back');
        return lines.join('\n');
      }

      const stateIndex = parseInt(inputs[1], 10) - 1;
      if (inputs[1] === '0') {
        return resetToMainMenu();
      }

      const states = await db.getStates();
      const selectedState = states[stateIndex] || states[0]; // fallback to Kaduna

      // Step 2: Select LGA
      if (inputs.length === 2) {
        const lgas = await db.getLgas(selectedState.id);
        const lines = [`CON ${selectedState.name} State: Select LGA:`];
        lgas.slice(0, 6).forEach((l, idx) => {
          lines.push(`${idx + 1}. ${l.name}`);
        });
        lines.push('0. Back');
        return lines.join('\n');
      }

      if (inputs[2] === '0') {
        return resetToMainMenu();
      }

      const lgaIndex = parseInt(inputs[2], 10) - 1;
      const lgas = await db.getLgas(selectedState.id);
      const selectedLga = lgas[lgaIndex] || lgas[0];

      // Step 3: Show area results
      const comparison = await db.getBaselineComparison(selectedState.id, selectedLga.id);

      if (inputs.length === 3) {
        const lines = [
          `CON ${selectedLga.name.toUpperCase()} LGA`,
          '',
        ];

        // List top operators
        comparison.operators.slice(0, 3).forEach(opData => {
          const v = opData.baseline?.voice_rating || 'Fair';
          const d = opData.baseline?.data_rating || 'Fair';
          lines.push(`${opData.operator.code}: Voice ${v} | Data ${d}`);
        });

        lines.push('');
        lines.push(`Source: ${comparison.primarySource.name.slice(0, 32)}`);
        lines.push(`Updated: ${comparison.primarySource.lastUpdated}`);
        lines.push('');
        lines.push('1. Send by SMS');
        lines.push('0. Exit');
        return lines.join('\n');
      }

      // Step 4: Handle 1. SMS result or 0. Exit
      if (inputs.length === 4) {
        if (inputs[3] === '1') {
          // Send SMS
          const smsText = smsService.formatAreaSms(
            selectedLga.name,
            comparison.operators.slice(0, 3).map(o => ({
              operatorCode: o.operator.code,
              voice: o.baseline?.voice_rating || 'Fair',
              data: o.baseline?.data_rating || 'Fair',
            })),
            `${comparison.primarySource.name} (${comparison.primarySource.lastUpdated})`
          );

          await smsService.sendSms({
            to: phoneNumber,
            message: smsText,
            reference: `USSD-${Date.now()}`,
          });

          return 'END NetworkCheck result sent to your phone via SMS.\nThank you for checking.';
        }
        return 'END Thank you for using NetworkCheck.';
      }
    }

    // -------------------------------------------------------------
    // OPTION 2: COMPARE NETWORKS
    // -------------------------------------------------------------
    if (rootChoice === '2') {
      if (inputs.length === 1) {
        const states = await db.getStates();
        const lines = ['CON Compare Networks - Select State:'];
        states.slice(0, 5).forEach((s, idx) => {
          lines.push(`${idx + 1}. ${s.name}`);
        });
        lines.push('0. Back');
        return lines.join('\n');
      }

      if (inputs[1] === '0') return resetToMainMenu();

      const stateIndex = parseInt(inputs[1], 10) - 1;
      const states = await db.getStates();
      const selectedState = states[stateIndex] || states[0];

      if (inputs.length === 2) {
        const lgas = await db.getLgas(selectedState.id);
        const lines = [`CON Select LGA to compare:`];
        lgas.slice(0, 6).forEach((l, idx) => {
          lines.push(`${idx + 1}. ${l.name}`);
        });
        lines.push('0. Back');
        return lines.join('\n');
      }

      if (inputs[2] === '0') return resetToMainMenu();

      const lgaIndex = parseInt(inputs[2], 10) - 1;
      const lgas = await db.getLgas(selectedState.id);
      const selectedLga = lgas[lgaIndex] || lgas[0];

      const comparison = await db.getBaselineComparison(selectedState.id, selectedLga.id);

      if (inputs.length === 3) {
        const lines = [
          `CON ${selectedLga.name.toUpperCase()} COMPARISON:`,
        ];

        comparison.operators.forEach(opData => {
          const v = opData.baseline?.voice_rating || 'N/A';
          const d = opData.baseline?.data_rating || 'N/A';
          lines.push(`${opData.operator.code}: Voice ${v}, Data ${d}`);
        });

        lines.push('Based on available data.');
        lines.push('');
        lines.push('1. Send by SMS');
        lines.push('0. Exit');
        return lines.join('\n');
      }

      if (inputs.length === 4) {
        if (inputs[3] === '1') {
          const smsText = smsService.formatAreaSms(
            selectedLga.name,
            comparison.operators.map(o => ({
              operatorCode: o.operator.code,
              voice: o.baseline?.voice_rating || 'Fair',
              data: o.baseline?.data_rating || 'Fair',
            })),
            'Official & community validated data'
          );

          await smsService.sendSms({
            to: phoneNumber,
            message: smsText,
            reference: `COMP-${Date.now()}`,
          });

          return 'END Comparison report sent to your phone via SMS.\nThank you.';
        }
        return 'END Thank you for using NetworkCheck.';
      }
    }

    // -------------------------------------------------------------
    // OPTION 3: REPORT NETWORK PROBLEM
    // Flow:
    // 1. Select Network: 1. MTN 2. Airtel 3. Glo 4. 9mobile 5. Other
    // 2. Select Issue: 1. No network 2. Internet slow 3. Calls dropping 4. Calls not connecting 5. SMS problem 6. Other
    // 3. When: 1. Now 2. Today 3. Yesterday
    // 4. Select State
    // 5. Select LGA
    // -> Save Report -> END Confirmation + SMS confirmation
    // -------------------------------------------------------------
    if (rootChoice === '3') {
      // Step 1: Select Operator
      if (inputs.length === 1) {
        return [
          'CON Report Network Problem',
          'Select network:',
          '1. MTN',
          '2. Airtel',
          '3. Glo',
          '4. 9mobile/T2',
          '5. Other',
          '0. Back',
        ].join('\n');
      }

      if (inputs[1] === '0') return resetToMainMenu();

      const opMapping: Record<string, { id: number; name: string }> = {
        '1': { id: 1, name: 'MTN Nigeria' },
        '2': { id: 2, name: 'Airtel Nigeria' },
        '3': { id: 3, name: 'Globacom' },
        '4': { id: 4, name: '9mobile' },
        '5': { id: 1, name: 'Other Operator' },
      };
      const chosenOp = opMapping[inputs[1]] || opMapping['1'];

      // Step 2: What is the problem?
      if (inputs.length === 2) {
        return [
          'CON What is the problem?',
          '1. No network',
          '2. Internet slow',
          '3. Calls dropping',
          '4. Calls not connecting',
          '5. SMS problem',
          '6. Other',
        ].join('\n');
      }

      const issueMapping: Record<string, { type: any; label: string }> = {
        '1': { type: 'no_network', label: 'No Network' },
        '2': { type: 'slow_data', label: 'Slow Mobile Data' },
        '3': { type: 'dropped_calls', label: 'Calls Dropping' },
        '4': { type: 'call_connect_fail', label: 'Calls Not Connecting' },
        '5': { type: 'sms_problem', label: 'SMS Problem' },
        '6': { type: 'other', label: 'General Issue' },
      };
      const chosenIssue = issueMapping[inputs[2]] || issueMapping['1'];

      // Step 3: When did this happen?
      if (inputs.length === 3) {
        return [
          'CON When did this happen?',
          '1. Now',
          '2. Today',
          '3. Yesterday',
        ].join('\n');
      }

      const timeMapping: Record<string, string> = {
        '1': 'Now',
        '2': 'Today',
        '3': 'Yesterday',
      };
      const chosenTime = timeMapping[inputs[3]] || 'Now';

      // Step 4: Select State
      if (inputs.length === 4) {
        const states = await db.getStates();
        const lines = ['CON Select State:'];
        states.slice(0, 5).forEach((s, idx) => {
          lines.push(`${idx + 1}. ${s.name}`);
        });
        return lines.join('\n');
      }

      const stateIndex = parseInt(inputs[4], 10) - 1;
      const states = await db.getStates();
      const selectedState = states[stateIndex] || states[0];

      // Step 5: Select LGA
      if (inputs.length === 5) {
        const lgas = await db.getLgas(selectedState.id);
        const lines = [`CON Select LGA:`];
        lgas.slice(0, 6).forEach((l, idx) => {
          lines.push(`${idx + 1}. ${l.name}`);
        });
        return lines.join('\n');
      }

      const lgaIndex = parseInt(inputs[5], 10) - 1;
      const lgas = await db.getLgas(selectedState.id);
      const selectedLga = lgas[lgaIndex] || lgas[0];

      // Step 6: Finalize Report creation
      const reference = generateReference();
      const phoneHash = hashPhoneNumber(phoneNumber);
      const phoneMasked = maskPhoneNumber(phoneNumber);

      // AI Severity estimation
      const aiSeverity = chosenIssue.type === 'no_network' ? 'high' : 'moderate';

      const newReport = await db.createCommunityReport({
        reference,
        phone_hash: phoneHash,
        phone_masked: phoneMasked,
        state_id: selectedState.id,
        lga_id: selectedLga.id,
        operator_id: chosenOp.id,
        issue_type: chosenIssue.type,
        description: `USSD citizen report: ${chosenIssue.label} on ${chosenOp.name} in ${selectedLga.name}.`,
        reported_time: chosenTime,
        language: 'English',
        ai_category: chosenIssue.type === 'slow_data' ? 'mobile_data' : chosenIssue.type === 'no_network' ? 'no_network' : 'voice',
        ai_severity: aiSeverity,
        source: 'Community',
      });

      // Also record AI analysis record
      await db.createAiAnalysis({
        report_id: newReport.id,
        model: 'gemini-3.8-flash',
        category: newReport.ai_category,
        language: 'English',
        severity: aiSeverity,
        summary: `Community issue logged via USSD for ${chosenOp.name} in ${selectedLga.name} LGA (${chosenIssue.label}).`,
      });

      // Send confirmation SMS
      const confirmationSms = smsService.formatReportConfirmationSms(
        selectedLga.name,
        chosenOp.name,
        chosenIssue.label,
        reference
      );

      await smsService.sendSms({
        to: phoneNumber,
        message: confirmationSms,
        reference,
      });

      return [
        'END Report received.',
        `Reference: ${reference}`,
        '',
        'Thank you for helping improve',
        'community connectivity information.',
        'A confirmation SMS has been sent.',
      ].join('\n');
    }

    // -------------------------------------------------------------
    // OPTION 4: CHECK BANK NETWORKS
    // -------------------------------------------------------------
    if (rootChoice === '4') {
      const bankIdMap: Record<string, number> = {
        '2': 1, // GTBank
        '3': 2, // Access
        '4': 3, // Zenith
        '5': 4, // FirstBank
        '6': 6, // Moniepoint
      };

      if (inputs.length === 1) {
        return [
          'CON Bank Network Status:',
          '1. All Banks Overview',
          '2. GTBank (*737#)',
          '3. Access Bank (*901#)',
          '4. Zenith Bank (*966#)',
          '5. First Bank (*894#)',
          '6. Moniepoint / OPay',
          '7. Report Bank Down',
          '0. Exit',
        ].join('\n');
      }

      const bankChoice = inputs[1];

      // Option 4.1: All Banks Overview
      if (bankChoice === '1') {
        if (inputs.length === 2) {
          const banks = await db.getBanks();
          const working = banks.filter(b => b.status === 'operational').map(b => b.code).slice(0, 5).join(', ');
          const slow = banks.filter(b => b.status !== 'operational').map(b => b.code).join(', ');

          return [
            'CON Bank Networks Overview:',
            `WORKING (Instant): ${working}`,
            `SLOW/DELAYS: ${slow || 'None reported'}`,
            'Source: Switch & Community Telemetry',
            '',
            '1. Send summary by SMS',
            '0. Exit',
          ].join('\n');
        }

        if (inputs.length === 3 && inputs[2] === '1') {
          const banks = await db.getBanks();
          const working = banks.filter(b => b.status === 'operational').map(b => b.code).join(', ');
          const slow = banks.filter(b => b.status !== 'operational').map(b => b.code).join(', ');

          const smsText = [
            'NetworkCheck Bank Alert:',
            `WORKING (Instant NIP): ${working}`,
            `SLOW (Delays): ${slow || 'None'}`,
            'Check transfer & POS status before paying.',
            'Dial *384*22020# anytime or SMS BANK to 22020.',
          ].join('\n');

          await smsService.sendSms({
            to: phoneNumber,
            message: smsText,
            reference: `BANK-${Date.now()}`,
          });

          return 'END Bank network summary sent to your phone via SMS.';
        }

        return 'END Thank you for checking bank network status.';
      }

      // Option 4.2-4.6: Specific Bank Inspection
      if (bankIdMap[bankChoice]) {
        const bankId = bankIdMap[bankChoice];
        const bank = await db.getBankById(bankId);

        if (!bank) {
          return 'END Bank information unavailable.';
        }

        if (inputs.length === 2) {
          const statusText = bank.status === 'operational' ? 'WORKING (Good)' : bank.status === 'degraded' ? 'SLOW (Delays)' : 'DOWN (Failed)';
          return [
            `CON ${bank.name}:`,
            `Status: ${statusText}`,
            `Transfers: ${bank.transfer_success_rate}% Success`,
            `USSD ${bank.ussd_code}: ${bank.ussd_success_rate}%`,
            `POS Rate: ${bank.pos_success_rate}%`,
            `Source: ${bank.source} Telemetry`,
            '',
            '1. Send to phone by SMS',
            '0. Exit',
          ].join('\n');
        }

        if (inputs.length === 3 && inputs[2] === '1') {
          const smsText = [
            `NetworkCheck Bank Alert:`,
            `${bank.name} (${bank.ussd_code})`,
            `Status: ${bank.status.toUpperCase()} (${bank.transfer_success_rate}% transfer success rate).`,
            `Notes: ${bank.notes}`,
            `Source: ${bank.source} Telemetry`,
          ].join('\n');

          await smsService.sendSms({
            to: phoneNumber,
            message: smsText,
            reference: `BANK-${bank.code}-${Date.now()}`,
          });

          return `END ${bank.name} network status sent to your phone via SMS.`;
        }

        return 'END Thank you for using NetworkCheck.';
      }

      // Option 4.7: Report Bank Down
      if (bankChoice === '7') {
        if (inputs.length === 2) {
          return [
            'CON Which bank has network issue?',
            '1. GTBank',
            '2. Access Bank',
            '3. Zenith Bank',
            '4. First Bank',
            '5. Moniepoint / OPay',
            '0. Back',
          ].join('\n');
        }

        if (inputs.length === 3) {
          return [
            'CON Select Bank Problem:',
            '1. Transfer debited not received',
            '2. POS declined with debit',
            '3. USSD banking code timeout',
            '4. Mobile app login down',
            '0. Back',
          ].join('\n');
        }

        if (inputs.length === 4) {
          const bankMapReport: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 6 };
          const problemMap: Record<string, any> = {
            '1': 'failed_transfer',
            '2': 'pos_declined_with_debit',
            '3': 'ussd_banking_down',
            '4': 'mobile_app_slow',
          };

          const targetBankId = bankMapReport[inputs[2]] || 1;
          const targetIssue = problemMap[inputs[3]] || 'failed_transfer';

          await db.createBankReport({
            bank_id: targetBankId,
            issue_type: targetIssue,
            description: `USSD community report: ${targetIssue} on bank #${targetBankId}.`,
            phone_hash: hashPhoneNumber(phoneNumber),
            phone_masked: maskPhoneNumber(phoneNumber),
          });

          return [
            'END Bank network problem recorded.',
            '',
            'Thank you for reporting!',
            'Your report helps traders, POS agents,',
            'and citizens avoid failed transfers.',
          ].join('\n');
        }
      }

      return 'END Option completed.';
    }

    // -------------------------------------------------------------
    // OPTION 5: GET RESULT BY SMS DIRECTLY
    // -------------------------------------------------------------
    if (rootChoice === '5') {
      if (inputs.length === 1) {
        const states = await db.getStates();
        const lines = ['CON Get SMS - Select State:'];
        states.slice(0, 5).forEach((s, idx) => {
          lines.push(`${idx + 1}. ${s.name}`);
        });
        return lines.join('\n');
      }

      const stateIndex = parseInt(inputs[1], 10) - 1;
      const states = await db.getStates();
      const selectedState = states[stateIndex] || states[0];

      if (inputs.length === 2) {
        const lgas = await db.getLgas(selectedState.id);
        const lines = ['CON Select LGA:'];
        lgas.slice(0, 6).forEach((l, idx) => {
          lines.push(`${idx + 1}. ${l.name}`);
        });
        return lines.join('\n');
      }

      const lgaIndex = parseInt(inputs[2], 10) - 1;
      const lgas = await db.getLgas(selectedState.id);
      const selectedLga = lgas[lgaIndex] || lgas[0];

      const comparison = await db.getBaselineComparison(selectedState.id, selectedLga.id);

      const smsText = smsService.formatAreaSms(
        selectedLga.name,
        comparison.operators.map(o => ({
          operatorCode: o.operator.code,
          voice: o.baseline?.voice_rating || 'Fair',
          data: o.baseline?.data_rating || 'Fair',
        })),
        `${comparison.primarySource.name} (${comparison.primarySource.lastUpdated})`
      );

      await smsService.sendSms({
        to: phoneNumber,
        message: smsText,
        reference: `REQ-${Date.now()}`,
      });

      return `END NetworkCheck results for ${selectedLga.name} have been sent to your phone via SMS.`;
    }

    // -------------------------------------------------------------
    // OPTION 6: HELP
    // -------------------------------------------------------------
    if (rootChoice === '6') {
      return [
        'END NetworkCheck Help:',
        'Dial *384*22020# or SMS 22020 to check mobile & bank connectivity without internet.',
        'Data comes from NCC official bulletins, switch monitors & community reports.',
        'No smartphone needed. Free USSD.',
      ].join('\n');
    }

    // Unrecognized input fallback
    return [
      'CON Invalid option selected.',
      '1. Check my area',
      '2. Compare networks',
      '3. Report network problem',
      '4. Check Bank Networks',
      '0. Exit',
    ].join('\n');
  } catch (err: any) {
    console.error('USSD processing error:', err);
    return 'END Sorry, network information is currently unavailable.\nPlease try again later.\n0. Exit';
  }
}

function resetToMainMenu(): string {
  return [
    'CON Welcome to NetworkCheck',
    '1. Check my area',
    '2. Compare networks',
    '3. Report network problem',
    '4. Check Bank Networks',
    '5. Get result by SMS',
    '6. Help',
    '0. Exit',
  ].join('\n');
}
