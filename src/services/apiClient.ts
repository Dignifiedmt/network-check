import {
  StateItem,
  LgaItem,
  OperatorItem,
  BaselineItem,
  CommunityReport,
  AnalyticsOverview,
  AreaAnalyticItem,
  AiInsightsData,
  DataSourceItem,
  SmsLogItem,
  BankItem,
  BankSummary,
  BankReportInput,
} from '../types';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('networkcheck_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('networkcheck_admin_token', token);
}

export function clearAdminToken() {
  localStorage.removeItem('networkcheck_admin_token');
}

export async function fetchStates(): Promise<StateItem[]> {
  const res = await fetch(`${API_BASE}/states`);
  const data = await res.json();
  return data.states || [];
}

export async function fetchLgas(stateId: number): Promise<LgaItem[]> {
  const res = await fetch(`${API_BASE}/states/${stateId}/lgas`);
  const data = await res.json();
  return data.lgas || [];
}

export async function fetchOperators(): Promise<OperatorItem[]> {
  const res = await fetch(`${API_BASE}/operators`);
  const data = await res.json();
  return data.operators || [];
}

export async function fetchBaselines(params?: {
  stateId?: number;
  lgaId?: number;
  operatorId?: number;
  datasetVersion?: string;
}): Promise<BaselineItem[]> {
  const query = new URLSearchParams();
  if (params?.stateId) query.set('stateId', params.stateId.toString());
  if (params?.lgaId) query.set('lgaId', params.lgaId.toString());
  if (params?.operatorId) query.set('operatorId', params.operatorId.toString());
  if (params?.datasetVersion) query.set('datasetVersion', params.datasetVersion);

  const res = await fetch(`${API_BASE}/network-baseline?${query.toString()}`);
  const data = await res.json();
  return data.baselines || [];
}

export async function fetchBaselineComparison(stateId: number, lgaId: number) {
  const res = await fetch(`${API_BASE}/network-baseline/compare?stateId=${stateId}&lgaId=${lgaId}`);
  const data = await res.json();
  return data.comparison;
}

export async function submitReport(reportData: {
  state_id: number;
  lga_id: number;
  operator_id: number;
  issue_type: string;
  description?: string;
  reported_time?: string;
  phone_number?: string;
  source?: string;
}) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  return res.json();
}

export async function fetchReports(filters?: {
  stateId?: number;
  lgaId?: number;
  operatorId?: number;
  issueType?: string;
  aiSeverity?: string;
  source?: string;
  status?: string;
}): Promise<CommunityReport[]> {
  const query = new URLSearchParams();
  if (filters?.stateId) query.set('stateId', filters.stateId.toString());
  if (filters?.lgaId) query.set('lgaId', filters.lgaId.toString());
  if (filters?.operatorId) query.set('operatorId', filters.operatorId.toString());
  if (filters?.issueType) query.set('issueType', filters.issueType);
  if (filters?.aiSeverity) query.set('aiSeverity', filters.aiSeverity);
  if (filters?.source) query.set('source', filters.source);
  if (filters?.status) query.set('status', filters.status);

  const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
  const data = await res.json();
  return data.reports || [];
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/analytics/overview`, { headers });
  if (res.status === 401 || res.status === 403) {
    throw new Error('ADMIN_AUTH_REQUIRED');
  }
  const data = await res.json();
  return data.overview;
}

export async function fetchAreaAnalytics(): Promise<AreaAnalyticItem[]> {
  const res = await fetch(`${API_BASE}/analytics/areas`);
  const data = await res.json();
  return data.areas || [];
}

export async function fetchAiInsights(): Promise<AiInsightsData> {
  const res = await fetch(`${API_BASE}/ai/insights`);
  const data = await res.json();
  return data.insights;
}

export async function testAiClassification(text: string) {
  const res = await fetch(`${API_BASE}/ai/analyze-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function fetchSources(): Promise<DataSourceItem[]> {
  const res = await fetch(`${API_BASE}/sources`);
  const data = await res.json();
  return data.sources || [];
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function validateCsvContent(csvContent: string) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/baselines/validate-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ csvContent }),
  });
  return res.json();
}

export async function importCsvContent(csvContent: string) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/baselines/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ csvContent }),
  });
  return res.json();
}

export async function sendUssdSessionInput(sessionId: string, phoneNumber: string, text: string): Promise<string> {
  const res = await fetch(`${API_BASE}/ussd/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      serviceCode: '*384*20220#',
      phoneNumber,
      text,
    }),
  });
  return res.text();
}

export async function fetchSmsLogs(): Promise<SmsLogItem[]> {
  const res = await fetch(`${API_BASE}/sms/outbox`);
  const data = await res.json();
  return data.logs || [];
}

export async function fetchBanks(params?: {
  status?: string;
  category?: string;
}): Promise<{ banks: BankItem[]; summary: BankSummary }> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.category) query.append('category', params.category);

  const res = await fetch(`${API_BASE}/banks?${query.toString()}`);
  const data = await res.json();
  return {
    banks: data.banks || [],
    summary: data.summary || { total: 0, operationalCount: 0, degradedCount: 0, downCount: 0 },
  };
}

export async function reportBankIssue(input: BankReportInput) {
  const res = await fetch(`${API_BASE}/banks/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
}

export interface AfricaTalkingStatusData {
  configured: boolean;
  mode: 'production' | 'sandbox' | 'simulation';
  username: string;
  senderId: string;
  hasApiKey: boolean;
  webhooks: {
    ussdUrl: string;
    smsUrl: string;
    deliveryReportsUrl: string;
  };
  simulatorUrl: string;
}

export async function fetchAfricaTalkingStatus(): Promise<AfricaTalkingStatusData> {
  const res = await fetch(`${API_BASE}/africastalking/status`);
  const data = await res.json();
  return data.status;
}

export async function simulateIncomingSms(from: string, text: string): Promise<{
  success: boolean;
  senderMasked: string;
  reply: string;
  action: string;
}> {
  const res = await fetch(`${API_BASE}/africastalking/simulate-incoming-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, text }),
  });
  return res.json();
}

export async function requestAreaSmsSummary(stateId: number, lgaId: number, phoneNumber: string): Promise<{
  success: boolean;
  smsRef?: string;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/sms/request-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stateId, lgaId, phoneNumber }),
  });
  return res.json();
}

