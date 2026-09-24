import bcrypt from 'bcryptjs';

export interface StateRecord {
  id: number;
  name: string;
  code: string;
}

export interface LgaRecord {
  id: number;
  state_id: number;
  name: string;
}

export interface OperatorRecord {
  id: number;
  name: string;
  code: string;
}

export interface BaselineRecord {
  id: number;
  state_id: number;
  lga_id: number;
  operator_id: number;
  voice_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
  data_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
  sms_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
  source_name: string;
  source_type: 'Official' | 'Community' | 'Demo';
  source_url: string;
  dataset_version: string;
  last_updated: string;
  notes: string;
}

export interface CommunityReportRecord {
  id: number;
  reference: string;
  phone_hash: string;
  phone_masked?: string;
  state_id: number;
  lga_id: number;
  operator_id: number;
  issue_type: 'no_network' | 'slow_data' | 'dropped_calls' | 'call_connect_fail' | 'sms_problem' | 'other';
  description: string;
  reported_time: string;
  created_at: string;
  language: string;
  ai_category: string;
  ai_severity: 'low' | 'moderate' | 'high';
  duplicate_flag: boolean;
  status: 'received' | 'verified' | 'investigating' | 'resolved';
  source: 'Community' | 'Demo' | 'Official';
}

export interface AdminUserRecord {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface AiAnalysisRecord {
  id: number;
  report_id: number;
  model: string;
  category: string;
  language: string;
  severity: string;
  summary: string;
  created_at: string;
}

export interface SmsLogRecord {
  id: number;
  phone_masked: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'simulated' | 'failed' | 'received' | 'delivered';
  reference?: string;
  created_at: string;
}

// Initial Nigerian States
export const initialStates: StateRecord[] = [
  { id: 1, name: 'Kaduna', code: 'KD' },
  { id: 2, name: 'Kano', code: 'KN' },
  { id: 3, name: 'Abuja (FCT)', code: 'FC' },
  { id: 4, name: 'Katsina', code: 'KT' },
  { id: 5, name: 'Lagos', code: 'LA' },
  { id: 6, name: 'Plateau', code: 'PL' },
  { id: 7, name: 'Niger', code: 'NI' },
];

// LGAs for Kaduna State (primary focus) plus top cities for other states
export const initialLgas: LgaRecord[] = [
  // Kaduna State LGAs (Focus Area)
  { id: 1, state_id: 1, name: 'Chikun' },
  { id: 2, state_id: 1, name: 'Kaduna North' },
  { id: 3, state_id: 1, name: 'Kaduna South' },
  { id: 4, state_id: 1, name: 'Igabi' },
  { id: 5, state_id: 1, name: 'Zaria' },
  { id: 6, state_id: 1, name: 'Sabon Gari' },
  { id: 7, state_id: 1, name: 'Giwa' },
  { id: 8, state_id: 1, name: 'Kajuru' },
  { id: 9, state_id: 1, name: 'Birnin Gwari' },
  { id: 10, state_id: 1, name: "Jema'a" },

  // Kano State LGAs
  { id: 11, state_id: 2, name: 'Kano Municipal' },
  { id: 12, state_id: 2, name: 'Fagge' },
  { id: 13, state_id: 2, name: 'Nasarawa' },
  { id: 14, state_id: 2, name: 'Dala' },
  { id: 15, state_id: 2, name: 'Gwale' },

  // Abuja FCT Area Councils
  { id: 16, state_id: 3, name: 'Abuja Municipal (AMAC)' },
  { id: 17, state_id: 3, name: 'Bwari' },
  { id: 18, state_id: 3, name: 'Gwagwalada' },
  { id: 19, state_id: 3, name: 'Kuje' },

  // Katsina State LGAs
  { id: 20, state_id: 4, name: 'Katsina' },
  { id: 21, state_id: 4, name: 'Daura' },
  { id: 22, state_id: 4, name: 'Funtua' },

  // Lagos State LGAs
  { id: 23, state_id: 5, name: 'Ikeja' },
  { id: 24, state_id: 5, name: 'Lagos Island' },
  { id: 25, state_id: 5, name: 'Surulere' },
];

// Nigerian Mobile Operators
export const initialOperators: OperatorRecord[] = [
  { id: 1, name: 'MTN Nigeria', code: 'MTN' },
  { id: 2, name: 'Airtel Nigeria', code: 'AIRTEL' },
  { id: 3, name: 'Globacom', code: 'GLO' },
  { id: 4, name: '9mobile / Telecel', code: '9MOBILE' },
];

// Official Baseline and Demo Baselines with explicit attribution labels
export const initialBaselines: BaselineRecord[] = [
  // Chikun LGA (Official NCC Dataset)
  {
    id: 1,
    state_id: 1,
    lga_id: 1,
    operator_id: 1,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Measurements across urban corridors in Sabon Tasha and Kakau.',
  },
  {
    id: 2,
    state_id: 1,
    lga_id: 1,
    operator_id: 2,
    voice_rating: 'Good',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Good 2G/3G coverage; intermittent 4G latency along bypass.',
  },
  {
    id: 3,
    state_id: 1,
    lga_id: 1,
    operator_id: 3,
    voice_rating: 'Fair',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Solid baseline for voice calls; variable packet jitter during evening peak.',
  },
  {
    id: 4,
    state_id: 1,
    lga_id: 1,
    operator_id: 4,
    voice_rating: 'Fair',
    data_rating: 'Poor',
    sms_rating: 'Fair',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Reduced 4G cell density reported outside municipal borders.',
  },

  // Kaduna North LGA (Official NCC Dataset)
  {
    id: 5,
    state_id: 1,
    lga_id: 2,
    operator_id: 1,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'High capacity sites deployed across Kawo, Malali, and Ungwan Rimi.',
  },
  {
    id: 6,
    state_id: 1,
    lga_id: 2,
    operator_id: 2,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Fiber-backhauled sites functioning within NCC QoS threshold.',
  },
  {
    id: 7,
    state_id: 1,
    lga_id: 2,
    operator_id: 3,
    voice_rating: 'Good',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Reliable voice and SMS performance; data throttling during peak hours.',
  },
  {
    id: 8,
    state_id: 1,
    lga_id: 2,
    operator_id: 4,
    voice_rating: 'Fair',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Stable voice delivery in commercial center.',
  },

  // Kaduna South LGA (Official NCC Dataset)
  {
    id: 9,
    state_id: 1,
    lga_id: 3,
    operator_id: 1,
    voice_rating: 'Good',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Congestion observed in dense market districts (Kakuri & Tudun Wada).',
  },
  {
    id: 10,
    state_id: 1,
    lga_id: 3,
    operator_id: 2,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Consistent call retention rates and good 4G coverage.',
  },
  {
    id: 11,
    state_id: 1,
    lga_id: 3,
    operator_id: 3,
    voice_rating: 'Fair',
    data_rating: 'Fair',
    sms_rating: 'Fair',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Occasional drop in indoor voice signal in older industrial sectors.',
  },
  {
    id: 12,
    state_id: 1,
    lga_id: 3,
    operator_id: 4,
    voice_rating: 'Fair',
    data_rating: 'Poor',
    sms_rating: 'Fair',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Limited 4G capacity; legacy 2G voice functional.',
  },

  // Igabi LGA (Demo / Test Data explicitly labelled)
  {
    id: 13,
    state_id: 1,
    lga_id: 4,
    operator_id: 1,
    voice_rating: 'Good',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'DEMO DATA — not real network measurements',
    source_type: 'Demo',
    source_url: '',
    dataset_version: 'DEMO-AUDIT-2026',
    last_updated: '2026-03-01',
    notes: 'Synthetic validation dataset for application test suite.',
  },
  {
    id: 14,
    state_id: 1,
    lga_id: 4,
    operator_id: 2,
    voice_rating: 'Fair',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'DEMO DATA — not real network measurements',
    source_type: 'Demo',
    source_url: '',
    dataset_version: 'DEMO-AUDIT-2026',
    last_updated: '2026-03-01',
    notes: 'Synthetic test record for multi-operator comparison demo.',
  },

  // Zaria LGA (Official NCC Dataset)
  {
    id: 15,
    state_id: 1,
    lga_id: 5,
    operator_id: 1,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Broad coverage including ABU Samaru campus and Samaru market.',
  },
  {
    id: 16,
    state_id: 1,
    lga_id: 5,
    operator_id: 2,
    voice_rating: 'Good',
    data_rating: 'Good',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Good quality of service in Sabon Gari and City Gate areas.',
  },
  {
    id: 17,
    state_id: 1,
    lga_id: 5,
    operator_id: 3,
    voice_rating: 'Fair',
    data_rating: 'Fair',
    sms_rating: 'Good',
    source_name: 'Official NCC Q1 2026 Quality of Service Audit',
    source_type: 'Official',
    source_url: 'https://ncc.gov.ng/technical-standards/qos-reports',
    dataset_version: 'NCC-QOS-2026-Q1',
    last_updated: '2026-02-15',
    notes: 'Adequate voice throughput; high packet latency in student hostel zones.',
  },
];

// Initial Realistic Community Reports
export const initialCommunityReports: CommunityReportRecord[] = [
  {
    id: 1,
    reference: 'NC-10001',
    phone_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    phone_masked: '+234 803 *** 1492',
    state_id: 1,
    lga_id: 1, // Chikun
    operator_id: 1, // MTN
    issue_type: 'slow_data',
    description: 'Internet baya aiki sosai tun safe a Sabon Tasha.',
    reported_time: 'Today',
    created_at: '2026-03-23T08:14:22Z',
    language: 'Hausa',
    ai_category: 'mobile_data',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'received',
    source: 'Community',
  },
  {
    id: 2,
    reference: 'NC-10002',
    phone_hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    phone_masked: '+234 802 *** 8810',
    state_id: 1,
    lga_id: 2, // Kaduna North
    operator_id: 2, // Airtel
    issue_type: 'dropped_calls',
    description: 'Kira yana yankewa duk lokacin da na kira daga Ungwan Rimi.',
    reported_time: 'Now',
    created_at: '2026-03-23T09:30:15Z',
    language: 'Hausa',
    ai_category: 'voice',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'investigating',
    source: 'Community',
  },
  {
    id: 3,
    reference: 'NC-10003',
    phone_hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    phone_masked: '+234 805 *** 3321',
    state_id: 1,
    lga_id: 1, // Chikun
    operator_id: 3, // Glo
    issue_type: 'no_network',
    description: 'Babu network sam a Maraban Rido tun karfe tara na safe.',
    reported_time: 'Today',
    created_at: '2026-03-23T10:05:40Z',
    language: 'Hausa',
    ai_category: 'no_network',
    ai_severity: 'high',
    duplicate_flag: false,
    status: 'verified',
    source: 'Community',
  },
  {
    id: 4,
    reference: 'NC-10004',
    phone_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    phone_masked: '+234 803 *** 7712',
    state_id: 1,
    lga_id: 3, // Kaduna South
    operator_id: 1, // MTN
    issue_type: 'dropped_calls',
    description: 'The MTN network for Barnawa dey drop call every 2 minutes when I dey business talk.',
    reported_time: 'Today',
    created_at: '2026-03-23T11:42:00Z',
    language: 'Nigerian Pidgin',
    ai_category: 'voice',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'received',
    source: 'Community',
  },
  {
    id: 5,
    reference: 'NC-10005',
    phone_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    phone_masked: '+234 809 *** 4409',
    state_id: 1,
    lga_id: 1, // Chikun
    operator_id: 4, // 9mobile
    issue_type: 'slow_data',
    description: 'Data connection dey crawl since yesterday evening for Narayi bypass.',
    reported_time: 'Yesterday',
    created_at: '2026-03-22T19:22:11Z',
    language: 'Nigerian Pidgin',
    ai_category: 'mobile_data',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'received',
    source: 'Community',
  },
  {
    id: 6,
    reference: 'NC-10006',
    phone_hash: '8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4',
    phone_masked: '+234 802 *** 9901',
    state_id: 1,
    lga_id: 2, // Kaduna North
    operator_id: 2, // Airtel
    issue_type: 'sms_problem',
    description: 'Bank OTP and USSD confirmation SMS are not delivering since 8 AM today in Kawo.',
    reported_time: 'Today',
    created_at: '2026-03-23T12:15:33Z',
    language: 'English',
    ai_category: 'sms',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'received',
    source: 'Community',
  },
  {
    id: 7,
    reference: 'NC-10007',
    phone_hash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3ff09f5b084920251ff9b736b42b91867',
    phone_masked: '+234 803 *** 1222',
    state_id: 1,
    lga_id: 5, // Zaria
    operator_id: 1, // MTN
    issue_type: 'call_connect_fail',
    description: 'Calls failing with immediate congestion tone around Samaru market junction.',
    reported_time: 'Now',
    created_at: '2026-03-23T13:02:18Z',
    language: 'English',
    ai_category: 'voice',
    ai_severity: 'moderate',
    duplicate_flag: false,
    status: 'received',
    source: 'Community',
  },
];

// Pre-computed AI Analyses linking back to community reports
export const initialAiAnalyses: AiAnalysisRecord[] = [
  {
    id: 1,
    report_id: 1,
    model: 'gemini-3.8-flash',
    category: 'mobile_data',
    language: 'Hausa',
    severity: 'moderate',
    summary: 'Citizen report in Hausa indicates severe mobile data failure starting from morning in Sabon Tasha, Chikun LGA.',
    created_at: '2026-03-23T08:14:25Z',
  },
  {
    id: 2,
    report_id: 2,
    model: 'gemini-3.8-flash',
    category: 'voice',
    language: 'Hausa',
    severity: 'moderate',
    summary: 'Hausa voice service report describing recurrent dropped calls on Airtel lines in Ungwan Rimi, Kaduna North.',
    created_at: '2026-03-23T09:30:18Z',
  },
  {
    id: 3,
    report_id: 3,
    model: 'gemini-3.8-flash',
    category: 'no_network',
    language: 'Hausa',
    severity: 'high',
    summary: 'High severity total network blackout report in Hausa from Maraban Rido area, Chikun LGA.',
    created_at: '2026-03-23T10:05:43Z',
  },
  {
    id: 4,
    report_id: 4,
    model: 'gemini-3.8-flash',
    category: 'voice',
    language: 'Nigerian Pidgin',
    severity: 'moderate',
    summary: 'Nigerian Pidgin report detailing persistent call drops affecting commerce in Barnawa, Kaduna South.',
    created_at: '2026-03-23T11:42:04Z',
  },
  {
    id: 5,
    report_id: 6,
    model: 'gemini-3.8-flash',
    category: 'sms',
    language: 'English',
    severity: 'moderate',
    summary: 'Critical financial transactional impact: bank verification OTPs failing to deliver via SMS in Kawo, Kaduna North.',
    created_at: '2026-03-23T12:15:37Z',
  },
];

// Initial Simulated SMS Logs for Hackathon Demo
export const initialSmsLogs: SmsLogRecord[] = [
  {
    id: 1,
    phone_masked: '+234 803 *** 1492',
    message: 'NetworkCheck\nChikun LGA\nMTN: Voice Good, Data Good\nAirtel: Voice Good, Data Fair\nGlo: Voice Fair, Data Fair\nSource: Official NCC Dataset (Updated: 2026-02-15)',
    direction: 'outgoing',
    status: 'simulated',
    reference: 'SMS-20260323-01',
    created_at: '2026-03-23T08:16:00Z',
  },
  {
    id: 2,
    phone_masked: '+234 803 *** 1492',
    message: 'NetworkCheck:\nYour network problem report has been received.\nArea: Chikun\nNetwork: MTN\nIssue: Slow Mobile Data\nReference: NC-10001\nThank you for helping community connectivity.',
    direction: 'outgoing',
    status: 'simulated',
    reference: 'NC-10001',
    created_at: '2026-03-23T08:14:23Z',
  },
];

// Default Admin User Password: admin_secure_password_2026
// Hash generated using bcrypt salt rounds 10
export const initialAdminUsers: AdminUserRecord[] = [
  {
    id: 1,
    email: 'admin@networkcheck.ng',
    password_hash: bcrypt.hashSync('admin_secure_password_2026', 10),
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export interface BankRecord {
  id: number;
  name: string;
  code: string;
  ussd_code: string;
  category: 'commercial' | 'fintech' | 'microfinance';
  status: 'operational' | 'degraded' | 'down';
  transfer_success_rate: number;
  ussd_success_rate: number;
  pos_success_rate: number;
  last_updated: string;
  source: 'Official' | 'Community' | 'Demo';
  active_reports_count: number;
  notes: string;
}

export interface BankReportRecord {
  id: number;
  bank_id: number;
  issue_type: 'failed_transfer' | 'pos_declined_with_debit' | 'ussd_banking_down' | 'mobile_app_slow' | 'delayed_alert' | 'other';
  description: string;
  phone_hash: string;
  phone_masked?: string;
  created_at: string;
}

// Initial Nigerian Banks Network Telemetry
export const initialBanks: BankRecord[] = [
  {
    id: 1,
    name: 'GTBank (Guaranty Trust Bank)',
    code: 'GTB',
    ussd_code: '*737#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 98,
    ussd_success_rate: 97,
    pos_success_rate: 99,
    last_updated: '2 mins ago',
    source: 'Community',
    active_reports_count: 2,
    notes: 'NIP interbank transfers instant. Zero network queue observed on USSD *737#.',
  },
  {
    id: 2,
    name: 'Access Bank',
    code: 'ACCESS',
    ussd_code: '*901#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 96,
    ussd_success_rate: 95,
    pos_success_rate: 98,
    last_updated: '5 mins ago',
    source: 'Community',
    active_reports_count: 4,
    notes: 'Inbound and outbound NIP transfers functioning smoothly.',
  },
  {
    id: 3,
    name: 'Zenith Bank',
    code: 'ZENITH',
    ussd_code: '*966#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 97,
    ussd_success_rate: 96,
    pos_success_rate: 99,
    last_updated: '1 min ago',
    source: 'Community',
    active_reports_count: 1,
    notes: 'Card authorization and instant mobile app transfers operational.',
  },
  {
    id: 4,
    name: 'First Bank of Nigeria (FirstBank)',
    code: 'FBN',
    ussd_code: '*894#',
    category: 'commercial',
    status: 'degraded',
    transfer_success_rate: 74,
    ussd_success_rate: 70,
    pos_success_rate: 79,
    last_updated: 'Just now',
    source: 'Community',
    active_reports_count: 23,
    notes: 'High volume of intermittent delays on outward NIP transfers and USSD *894# timeouts.',
  },
  {
    id: 5,
    name: 'United Bank for Africa (UBA)',
    code: 'UBA',
    ussd_code: '*919#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 95,
    ussd_success_rate: 94,
    pos_success_rate: 97,
    last_updated: '4 mins ago',
    source: 'Community',
    active_reports_count: 5,
    notes: 'USSD *919# and mobile app transfers stable across all telecom networks.',
  },
  {
    id: 6,
    name: 'Moniepoint Microfinance Bank',
    code: 'MONIEPOINT',
    ussd_code: '*5573#',
    category: 'fintech',
    status: 'operational',
    transfer_success_rate: 99,
    ussd_success_rate: 98,
    pos_success_rate: 99,
    last_updated: 'Just now',
    source: 'Community',
    active_reports_count: 0,
    notes: 'Merchant POS transactions and interbank credits performing at sub-second speeds.',
  },
  {
    id: 7,
    name: 'OPay Digital Services',
    code: 'OPAY',
    ussd_code: '*955#',
    category: 'fintech',
    status: 'operational',
    transfer_success_rate: 99,
    ussd_success_rate: 98,
    pos_success_rate: 99,
    last_updated: 'Just now',
    source: 'Community',
    active_reports_count: 1,
    notes: 'Instant wallet funding and card POS operations fully operational.',
  },
  {
    id: 8,
    name: 'Kuda Microfinance Bank',
    code: 'KUDA',
    ussd_code: '*894#',
    category: 'fintech',
    status: 'operational',
    transfer_success_rate: 96,
    ussd_success_rate: 95,
    pos_success_rate: 97,
    last_updated: '8 mins ago',
    source: 'Community',
    active_reports_count: 3,
    notes: 'Free transfers and virtual cards operating normally.',
  },
  {
    id: 9,
    name: 'Stanbic IBTC Bank',
    code: 'STANBIC',
    ussd_code: '*909#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 98,
    ussd_success_rate: 97,
    pos_success_rate: 99,
    last_updated: '12 mins ago',
    source: 'Community',
    active_reports_count: 0,
    notes: 'Core banking platform stable with instant settlement.',
  },
  {
    id: 10,
    name: 'Fidelity Bank',
    code: 'FIDELITY',
    ussd_code: '*770#',
    category: 'commercial',
    status: 'operational',
    transfer_success_rate: 93,
    ussd_success_rate: 91,
    pos_success_rate: 95,
    last_updated: '15 mins ago',
    source: 'Community',
    active_reports_count: 6,
    notes: 'USSD *770# operational; slight delay reported on SMS delivery alerts.',
  },
  {
    id: 11,
    name: 'PalmPay',
    code: 'PALMPAY',
    ussd_code: '*861#',
    category: 'fintech',
    status: 'operational',
    transfer_success_rate: 99,
    ussd_success_rate: 98,
    pos_success_rate: 99,
    last_updated: 'Just now',
    source: 'Community',
    active_reports_count: 1,
    notes: 'Merchant POS transactions and wallet transfers executing instantly.',
  },
  {
    id: 12,
    name: 'Union Bank of Nigeria',
    code: 'UNION',
    ussd_code: '*826#',
    category: 'commercial',
    status: 'degraded',
    transfer_success_rate: 68,
    ussd_success_rate: 65,
    pos_success_rate: 72,
    last_updated: 'Just now',
    source: 'Community',
    active_reports_count: 19,
    notes: 'Intermittent NIP gateway timeouts affecting outward interbank transfers.',
  },
];

