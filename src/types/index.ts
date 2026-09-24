export interface StateItem {
  id: number;
  name: string;
  code: string;
}

export interface LgaItem {
  id: number;
  state_id: number;
  name: string;
}

export interface OperatorItem {
  id: number;
  name: string;
  code: string;
}

export interface BaselineItem {
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

export interface CommunityReport {
  id: number;
  reference: string;
  phone_hash: string;
  phone_masked: string;
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
  state_name?: string;
  lga_name?: string;
  operator_name?: string;
  operator_code?: string;
}

export interface AnalyticsOverview {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  affectedLgasCount: number;
  topIssue: string;
  issueBreakdown: Array<{ issue: string; count: number }>;
  operatorsShare: Array<{ name: string; count: number; percentage: number }>;
  severityMap: { low: number; moderate: number; high: number };
  recentReports: CommunityReport[];
}

export interface AreaAnalyticItem {
  lgaId: number;
  lgaName: string;
  stateName: string;
  reportCount: number;
  issueBreakdown: Record<string, number>;
  operatorBreakdown: Record<string, number>;
}

export interface AiInsightsData {
  summary: string;
  keyFindings: string[];
  recommendedAction: string;
  model: string;
  generatedAt: string;
  attributionNote: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  type: 'Official' | 'Community' | 'Demo';
  url: string;
  datasetVersion: string;
  lastUpdated: string;
  recordsCount: number;
  status: string;
  notes: string;
}

export interface SmsLogItem {
  id: number;
  phone_masked: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'simulated' | 'failed' | 'received' | 'delivered';
  reference?: string;
  created_at: string;
}

export interface BankItem {
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

export interface BankSummary {
  total: number;
  operationalCount: number;
  degradedCount: number;
  downCount: number;
}

export interface BankReportInput {
  bank_id: number;
  issue_type: 'failed_transfer' | 'pos_declined_with_debit' | 'ussd_banking_down' | 'mobile_app_slow' | 'delayed_alert' | 'other';
  description?: string;
  phone_number?: string;
}
