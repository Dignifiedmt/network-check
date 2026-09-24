declare module 'africastalking' {
  interface AfricasTalkingCredentials {
    apiKey: string;
    username: string;
  }

  interface SendSmsParams {
    to: string | string[];
    message: string;
    from?: string;
    enqueue?: boolean;
  }

  interface SmsRecipient {
    number: string;
    cost: string;
    status: string;
    messageId: string;
  }

  interface SmsResponseData {
    SMSMessageData: {
      Message: string;
      Recipients: SmsRecipient[];
    };
  }

  interface SmsService {
    send(options: SendSmsParams): Promise<SmsResponseData>;
  }

  interface AfricasTalkingInstance {
    SMS: SmsService;
    [key: string]: any;
  }

  export default function AfricasTalking(credentials: AfricasTalkingCredentials): AfricasTalkingInstance;
}
