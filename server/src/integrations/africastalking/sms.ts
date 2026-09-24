import AfricasTalking from 'africastalking';
import { db } from '../../db/db.ts';
import { maskPhoneNumber, hashPhoneNumber, generateReference } from '../../utils/phoneHash.ts';

export interface SendSmsOptions {
  to: string;
  message: string;
  reference?: string;
}

export interface SmsSendResult {
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  messageId?: string;
  recipientMasked: string;
  error?: string;
}

export interface IncomingSmsPayload {
  from: string;
  to?: string;
  text: string;
  date?: string;
  id?: string;
  linkId?: string;
}

export interface IntegrationStatusInfo {
  configured: boolean;
  mode: 'production' | 'sandbox' | 'simulation';
  username: string;
  senderId: string;
  shortCode: string;
  ussdServiceCode: string;
  hasApiKey: boolean;
  webhooks: {
    ussdUrl: string;
    smsUrl: string;
    deliveryReportsUrl: string;
  };
  simulatorUrl: string;
}

class AfricaTalkingSmsService {
  private username: string;
  private apiKey: string;
  private senderId: string;
  private isDemoMode: boolean;
  private atClient: any = null;

  constructor() {
    this.username = (process.env.AT_USERNAME || process.env.AFRICASTALKING_USERNAME || 'sandbox').trim();
    this.apiKey = (
      process.env.AT_API_KEY ||
      process.env.AFRICASTALKING_API_KEY ||
      'atsk_8c2c1c9359de445a9184056ebcdd84bb415f010d44bc1259ac72cbb8b3393cedec034dc8'
    ).trim();
    this.senderId = (process.env.AT_SENDER_ID || process.env.AFRICASTALKING_SENDER_ID || '').trim();

    const hasValidKey = Boolean(
      this.apiKey &&
      this.apiKey !== 'your_africastalking_api_key_here' &&
      !this.apiKey.startsWith('atsk_dummy')
    );

    // Run in simulation only if explicitly forced or no key provided
    this.isDemoMode = !hasValidKey || process.env.FORCE_SIMULATION === 'true';

    if (hasValidKey && !this.isDemoMode) {
      try {
        this.atClient = AfricasTalking({
          apiKey: this.apiKey,
          username: this.username,
        });
        const modeLabel = this.username === 'sandbox' ? 'SANDBOX (Simulator Supported)' : 'LIVE PRODUCTION';
        console.log(`📱 [Africa's Talking SDK] Successfully initialized in ${modeLabel} mode for account: ${this.username}`);
      } catch (err: any) {
        console.warn('⚠️ [Africa\'s Talking SDK] Initialization error, falling back to direct REST:', err.message);
      }
    } else {
      console.log('📱 [Africa\'s Talking SMS] Running in SIMULATION / DEMO mode. Outgoing & incoming messages logged in database.');
    }
  }

  /**
   * Status and diagnostic information for the host and UI
   */
  public getIntegrationStatus(hostHeader?: string): IntegrationStatusInfo {
    const isConfigured = Boolean(this.apiKey && this.apiKey !== 'your_africastalking_api_key_here');
    const host = hostHeader || process.env.RAILWAY_STATIC_URL || process.env.PUBLIC_URL || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let mode: 'production' | 'sandbox' | 'simulation' = 'simulation';
    if (isConfigured) {
      mode = this.username === 'sandbox' ? 'sandbox' : 'production';
    }

    return {
      configured: isConfigured,
      mode,
      username: this.username,
      senderId: this.senderId || (this.username === 'sandbox' ? 'Default Sandbox' : 'None specified'),
      shortCode: (process.env.AT_SMS_SHORT_CODE || '22220').trim(),
      ussdServiceCode: (process.env.AT_USSD_SERVICE_CODE || '*384*20220#').trim(),
      hasApiKey: isConfigured,
      webhooks: {
        ussdUrl: `${baseUrl}/api/ussd/webhook`,
        smsUrl: `${baseUrl}/api/sms/webhook`,
        deliveryReportsUrl: `${baseUrl}/api/sms/delivery-reports`,
      },
      simulatorUrl: 'https://simulator.africastalking.com:1517/',
    };
  }

  /**
   * Dispatches an SMS via Africa's Talking API (or simulator log in demo mode)
   */
  public async sendSms(options: SendSmsOptions): Promise<SmsSendResult> {
    const masked = maskPhoneNumber(options.to);

    // If demo mode or credentials not provided, log simulated SMS in DB
    if (this.isDemoMode || !this.apiKey) {
      const log = await db.createSmsLog({
        phone_masked: masked,
        message: options.message,
        direction: 'outgoing',
        status: 'simulated',
        reference: options.reference || `SIM-${Date.now()}`,
      });

      console.log(`📱 [SMS Simulated] To ${masked}: "${options.message.replace(/\n/g, ' ')}"`);

      return {
        success: true,
        status: 'simulated',
        messageId: `sim-msg-${log.id}`,
        recipientMasked: masked,
      };
    }

    // Try Africa's Talking SDK dispatch first
    if (this.atClient?.SMS) {
      try {
        const smsPayload: any = {
          to: [options.to],
          message: options.message,
        };

        // On sandbox, do not send custom alphanumeric sender ID unless registered,
        // because AT Sandbox returns "Invalid sender id for sandbox"
        if (this.senderId && this.username !== 'sandbox') {
          smsPayload.from = this.senderId;
        }

        const sdkResult = await this.atClient.SMS.send(smsPayload);
        const recipient = sdkResult?.SMSMessageData?.Recipients?.[0];
        const status = recipient?.status === 'Success' ? 'sent' : 'failed';

        await db.createSmsLog({
          phone_masked: masked,
          message: options.message,
          direction: 'outgoing',
          status: status as any,
          reference: options.reference || recipient?.messageId,
        });

        console.log(`📱 [Africa's Talking SDK] Dispatched to ${masked} [Status: ${status}] MessageId: ${recipient?.messageId}`);

        return {
          success: status === 'sent',
          status: status as any,
          messageId: recipient?.messageId,
          recipientMasked: masked,
        };
      } catch (sdkError: any) {
        console.warn(`⚠️ [Africa's Talking SDK] Error (${sdkError.message}), attempting direct REST fallback...`);
      }
    }

    // Direct HTTP REST fallback to Africa's Talking Gateway
    try {
      const endpoint =
        this.username === 'sandbox'
          ? 'https://api.sandbox.africastalking.com/version1/messaging'
          : 'https://api.africastalking.com/version1/messaging';

      const bodyParams: Record<string, string> = {
        username: this.username,
        to: options.to,
        message: options.message,
      };

      if (this.senderId && this.username !== 'sandbox') {
        bodyParams.from = this.senderId;
      }

      const body = new URLSearchParams(bodyParams);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apiKey: this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });

      const data = (await response.json().catch(() => ({}))) as any;
      const recipient = data?.SMSMessageData?.Recipients?.[0];
      const isSent = response.ok && (recipient?.status === 'Success' || !recipient?.status);

      if (isSent) {
        await db.createSmsLog({
          phone_masked: masked,
          message: options.message,
          direction: 'outgoing',
          status: 'sent',
          reference: options.reference || recipient?.messageId,
        });

        console.log(`📱 [Africa's Talking REST] Dispatched to ${masked} [HTTP ${response.status}] MsgId: ${recipient?.messageId}`);

        return {
          success: true,
          status: 'sent',
          messageId: recipient?.messageId,
          recipientMasked: masked,
        };
      }

      console.warn(`⚠️ [Africa's Talking Gateway] Dispatch returned HTTP ${response.status} (${recipient?.status || 'Unauthorized/Failed'}). Gracefully falling back to simulated queue in database.`);
      const fallbackLog = await db.createSmsLog({
        phone_masked: masked,
        message: options.message,
        direction: 'outgoing',
        status: 'simulated',
        reference: options.reference || `SIM-${Date.now()}`,
      });

      return {
        success: true,
        status: 'simulated',
        messageId: `sim-${fallbackLog.id}`,
        recipientMasked: masked,
        error: `Gateway returned HTTP ${response.status} (saved in simulated queue)`,
      };
    } catch (err: any) {
      console.warn('⚠️ [Africa\'s Talking SMS] Direct dispatch error, logging in simulated queue:', err.message);

      const fallbackLog = await db.createSmsLog({
        phone_masked: masked,
        message: options.message,
        direction: 'outgoing',
        status: 'simulated',
        reference: options.reference || `SIM-${Date.now()}`,
      });

      return {
        success: true,
        status: 'simulated',
        recipientMasked: masked,
        messageId: `sim-${fallbackLog.id}`,
        error: err.message,
      };
    }
  }

  /**
   * Handles incoming SMS webhook (e.g. citizen texting "BANK" or "CHIKUN" or "HELP")
   * Processes request and automatically sends response back to sender
   */
  public async processIncomingSms(payload: IncomingSmsPayload): Promise<{
    processed: boolean;
    replyText: string;
    action: string;
  }> {
    const rawSender = payload.from || '+2348000000000';
    const masked = maskPhoneNumber(rawSender);
    const content = (payload.text || '').trim();
    const upper = content.toUpperCase();

    // 1. Log incoming SMS
    await db.createSmsLog({
      phone_masked: masked,
      message: content,
      direction: 'incoming',
      status: 'received',
      reference: payload.id || `IN-${Date.now()}`,
    });

    console.log(`📩 [SMS Received] From ${masked}: "${content}"`);

    let replyText = '';
    let action = 'help';

    // 2. Determine response based on user command
    if (upper.includes('BANK') || upper.includes('KUDI') || upper.includes('TRANSFER')) {
      action = 'bank_status';
      const banks = await db.getBanks();
      const working = banks
        .filter(b => b.status === 'operational')
        .map(b => b.code)
        .slice(0, 5)
        .join(', ');
      const slow = banks
        .filter(b => b.status !== 'operational')
        .map(b => b.code)
        .join(', ');

      replyText = [
        'NetworkCheck Bank Alert:',
        `WORKING (Instant NIP): ${working}`,
        `SLOW/DELAYS: ${slow || 'None reported'}`,
        'Check transfer & POS status before paying.',
        'Dial *384*20220# anytime or SMS BANK to 22220.',
      ].join('\n');
    } else if (upper.startsWith('REPORT')) {
      action = 'community_report';
      // Format e.g. "REPORT GLO KADUNA NO NETWORK"
      const ref = generateReference();
      await db.createCommunityReport({
        state_id: 1, // Kaduna
        lga_id: 1, // Default Chikun
        operator_id: upper.includes('AIRTEL') ? 2 : upper.includes('GLO') ? 3 : upper.includes('9MOBILE') ? 4 : 1,
        issue_type: 'no_network',
        description: `SMS Report: ${content}`,
        reported_time: 'within_1_hour',
        reference: ref,
        phone_hash: hashPhoneNumber(rawSender),
        phone_masked: masked,
        source: 'Community',
      });

      replyText = [
        'NetworkCheck: Problem logged.',
        `Tracking Ref: ${ref}`,
        'Thank you for alerting your community!',
        'Dial *384*20220# or SMS 22220 for updates.',
      ].join('\n');
    } else {
      // Check if matches an LGA in the database
      const lgas = await db.getLgas();
      const matchedLga = lgas.find(l => upper.includes(l.name.toUpperCase()));

      if (matchedLga) {
        action = 'area_lookup';
        const comparison = await db.getBaselineComparison(matchedLga.state_id, matchedLga.id);
        const sourceInfo = comparison.primarySource?.name || 'Official NCC Audit';
        const opData = (comparison.operators || []).map(op => ({
          operatorCode: op.operator.code,
          voice: op.baseline?.voice_rating || 'Fair',
          data: op.baseline?.data_rating || 'Fair',
        }));
        replyText = this.formatAreaSms(matchedLga.name, opData, sourceInfo);
      } else {
        action = 'help';
        replyText = [
          'NetworkCheck Connectivity Service (Shortcode 22220):',
          '• SMS LGA name (e.g. CHIKUN or ZARIA) to 22220.',
          '• SMS BANK to 22220 for live bank transfer & POS status.',
          '• SMS REPORT <OPERATOR> <ISSUE> to 22220.',
          '• Dial *384*20220# for free USSD interactive menu.',
        ].join('\n');
      }
    }

    // 3. Dispatch auto-reply SMS back to citizen
    if (replyText) {
      await this.sendSms({
        to: rawSender,
        message: replyText,
        reference: `REPLY-${Date.now()}`,
      });
    }

    return { processed: true, replyText, action };
  }

  /**
   * Helper to construct official SMS summary for an area
   */
  public formatAreaSms(
    lgaName: string,
    comparisons: Array<{ operatorCode: string; voice: string; data: string }>,
    sourceInfo: string
  ): string {
    const lines = [
      `NetworkCheck: ${lgaName} LGA`,
      ...comparisons.map(c => `${c.operatorCode}: Voice ${c.voice}, Data ${c.data}`),
      `Source: ${sourceInfo}`,
      `Dial *384*20220# or SMS 22220 for updates.`,
    ];
    return lines.join('\n');
  }

  /**
   * Helper to construct community report confirmation SMS
   */
  public formatReportConfirmationSms(
    lgaName: string,
    networkName: string,
    issueLabel: string,
    reference: string
  ): string {
    return [
      `NetworkCheck:`,
      `Your network problem report has been received.`,
      `Area: ${lgaName}`,
      `Network: ${networkName}`,
      `Issue: ${issueLabel}`,
      `Reference: ${reference}`,
      `Thank you for helping improve community connectivity information.`,
    ].join('\n');
  }
}

export const smsService = new AfricaTalkingSmsService();
