import pg from 'pg';
import {
  initialStates,
  initialLgas,
  initialOperators,
  initialBaselines,
  initialCommunityReports,
  initialAdminUsers,
  initialAiAnalyses,
  initialSmsLogs,
  initialBanks,
  StateRecord,
  LgaRecord,
  OperatorRecord,
  BaselineRecord,
  CommunityReportRecord,
  AdminUserRecord,
  AiAnalysisRecord,
  SmsLogRecord,
  BankRecord,
  BankReportRecord,
} from './seedData.ts';

const { Pool } = pg;

export interface UssdSessionRecord {
  session_id: string;
  phone_number: string;
  service_code?: string;
  step: string;
  state_id?: number;
  lga_id?: number;
  operator_id?: number;
  issue_type?: string;
  reported_time?: string;
  temp_data?: any;
  updated_at: string;
}

class DatabaseManager {
  private pool: pg.Pool | null = null;
  private isPostgresActive = false;
  private connectionAttempted = false;

  // In-memory store (active in fallback and demo mode)
  private states: StateRecord[] = [...initialStates];
  private lgas: LgaRecord[] = [...initialLgas];
  private operators: OperatorRecord[] = [...initialOperators];
  private baselines: BaselineRecord[] = [...initialBaselines];
  private communityReports: CommunityReportRecord[] = [...initialCommunityReports];
  private adminUsers: AdminUserRecord[] = [...initialAdminUsers];
  private aiAnalyses: AiAnalysisRecord[] = [...initialAiAnalyses];
  private smsLogs: SmsLogRecord[] = [...initialSmsLogs];
  private banks: BankRecord[] = [...initialBanks];
  private bankReports: BankReportRecord[] = [];
  private ussdSessions: Map<string, UssdSessionRecord> = new Map();

  constructor() {
    this.initPostgres();
  }

  private async initPostgres() {
    if (this.connectionAttempted) return;
    this.connectionAttempted = true;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('localhost:5432') && process.env.DEMO_MODE === 'true') {
      console.log('⚡ [Database] Using in-memory store (DEMO_MODE / standalone fallback).');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      const client = await this.pool.connect();
      console.log('✅ [Database] Successfully connected to PostgreSQL instance.');
      this.isPostgresActive = true;
      client.release();
      await this.runMigrations();
    } catch (err: any) {
      console.warn('⚠️ [Database] PostgreSQL connection unavailable. Operating on in-memory storage fallback.');
      this.isPostgresActive = false;
      this.pool = null;
    }
  }

  private async runMigrations() {
    if (!this.pool || !this.isPostgresActive) return;
    try {
      // Basic table creation
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS states (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(10) NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS lgas (
          id SERIAL PRIMARY KEY,
          state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          UNIQUE(state_id, name)
        );
        CREATE TABLE IF NOT EXISTS operators (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(20) NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS network_baselines (
          id SERIAL PRIMARY KEY,
          state_id INTEGER NOT NULL REFERENCES states(id),
          lga_id INTEGER NOT NULL REFERENCES lgas(id),
          operator_id INTEGER NOT NULL REFERENCES operators(id),
          voice_rating VARCHAR(20) NOT NULL,
          data_rating VARCHAR(20) NOT NULL,
          sms_rating VARCHAR(20) NOT NULL,
          source_name VARCHAR(150) NOT NULL,
          source_type VARCHAR(50) NOT NULL,
          source_url VARCHAR(255),
          dataset_version VARCHAR(50) NOT NULL,
          last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS community_reports (
          id SERIAL PRIMARY KEY,
          reference VARCHAR(50) NOT NULL UNIQUE,
          phone_hash VARCHAR(64) NOT NULL,
          state_id INTEGER NOT NULL REFERENCES states(id),
          lga_id INTEGER NOT NULL REFERENCES lgas(id),
          operator_id INTEGER NOT NULL REFERENCES operators(id),
          issue_type VARCHAR(50) NOT NULL,
          description TEXT,
          reported_time VARCHAR(50) NOT NULL DEFAULT 'Now',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          language VARCHAR(50) DEFAULT 'English',
          ai_category VARCHAR(50) DEFAULT 'unclassified',
          ai_severity VARCHAR(20) DEFAULT 'moderate',
          duplicate_flag BOOLEAN DEFAULT FALSE,
          status VARCHAR(30) DEFAULT 'received',
          source VARCHAR(30) DEFAULT 'Community'
        );
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(150) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(30) NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS ai_analysis (
          id SERIAL PRIMARY KEY,
          report_id INTEGER REFERENCES community_reports(id) ON DELETE CASCADE,
          model VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          language VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          summary TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ [Database] PostgreSQL migrations verified.');
    } catch (e) {
      console.error('Error running migrations:', e);
    }
  }

  public getDatabaseStatus() {
    return {
      connected: this.isPostgresActive,
      type: this.isPostgresActive ? 'PostgreSQL' : 'In-Memory Fallback Repository',
      stateCount: this.states.length,
      lgaCount: this.lgas.length,
      baselineCount: this.baselines.length,
      reportCount: this.communityReports.length,
    };
  }

  // --- States ---
  public async getStates(): Promise<StateRecord[]> {
    return [...this.states];
  }

  public async getStateById(id: number): Promise<StateRecord | undefined> {
    return this.states.find(s => s.id === id);
  }

  // --- LGAs ---
  public async getLgas(stateId?: number): Promise<LgaRecord[]> {
    if (stateId) {
      return this.lgas.filter(l => l.state_id === stateId);
    }
    return [...this.lgas];
  }

  public async getLgaById(id: number): Promise<LgaRecord | undefined> {
    return this.lgas.find(l => l.id === id);
  }

  // --- Operators ---
  public async getOperators(): Promise<OperatorRecord[]> {
    return [...this.operators];
  }

  public async getOperatorById(id: number): Promise<OperatorRecord | undefined> {
    return this.operators.find(o => o.id === id);
  }

  // --- Baselines ---
  public async getBaselines(filters?: {
    stateId?: number;
    lgaId?: number;
    operatorId?: number;
    datasetVersion?: string;
  }): Promise<BaselineRecord[]> {
    let result = [...this.baselines];
    if (filters?.stateId) {
      result = result.filter(b => b.state_id === filters.stateId);
    }
    if (filters?.lgaId) {
      result = result.filter(b => b.lga_id === filters.lgaId);
    }
    if (filters?.operatorId) {
      result = result.filter(b => b.operator_id === filters.operatorId);
    }
    if (filters?.datasetVersion) {
      result = result.filter(b => b.dataset_version.toLowerCase() === filters.datasetVersion?.toLowerCase());
    }
    return result;
  }

  public async getBaselineComparison(stateId: number, lgaId: number): Promise<{
    state: StateRecord | undefined;
    lga: LgaRecord | undefined;
    operators: Array<{
      operator: OperatorRecord;
      baseline?: BaselineRecord;
      communityStats: {
        totalReports: number;
        topIssue?: string;
        recentReportDate?: string;
      };
    }>;
    primarySource: {
      name: string;
      type: string;
      version: string;
      lastUpdated: string;
    };
  }> {
    const state = await this.getStateById(stateId);
    const lga = await this.getLgaById(lgaId);
    const operators = await this.getOperators();
    const baselines = await this.getBaselines({ stateId, lgaId });
    const reports = await this.getCommunityReports({ stateId, lgaId });

    const operatorResults = operators.map(op => {
      const baseline = baselines.find(b => b.operator_id === op.id);
      const opReports = reports.filter(r => r.operator_id === op.id);

      // determine top issue
      const issueCounts: Record<string, number> = {};
      opReports.forEach(r => {
        issueCounts[r.issue_type] = (issueCounts[r.issue_type] || 0) + 1;
      });
      const topIssue = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const recentReport = opReports[0]?.created_at;

      return {
        operator: op,
        baseline,
        communityStats: {
          totalReports: opReports.length,
          topIssue,
          recentReportDate: recentReport,
        },
      };
    });

    const firstOfficial = baselines.find(b => b.source_type === 'Official');
    const firstDemo = baselines.find(b => b.source_type === 'Demo');
    const primarySource = firstOfficial
      ? {
          name: firstOfficial.source_name,
          type: firstOfficial.source_type,
          version: firstOfficial.dataset_version,
          lastUpdated: firstOfficial.last_updated,
        }
      : firstDemo
      ? {
          name: firstDemo.source_name,
          type: firstDemo.source_type,
          version: firstDemo.dataset_version,
          lastUpdated: firstDemo.last_updated,
        }
      : {
          name: 'Community crowd-sourced data',
          type: 'Community',
          version: 'LIVE-COMMUNITY',
          lastUpdated: new Date().toISOString().split('T')[0],
        };

    return {
      state,
      lga,
      operators: operatorResults,
      primarySource,
    };
  }

  public async createBaseline(item: Omit<BaselineRecord, 'id'>): Promise<BaselineRecord> {
    const id = this.baselines.length > 0 ? Math.max(...this.baselines.map(b => b.id)) + 1 : 1;
    const newRecord: BaselineRecord = { ...item, id };
    this.baselines.unshift(newRecord);
    return newRecord;
  }

  public async batchImportBaselines(rows: Array<Omit<BaselineRecord, 'id'>>): Promise<{
    importedCount: number;
    updatedCount: number;
  }> {
    let imported = 0;
    let updated = 0;

    for (const row of rows) {
      const existingIndex = this.baselines.findIndex(
        b => b.state_id === row.state_id && b.lga_id === row.lga_id && b.operator_id === row.operator_id
      );
      if (existingIndex >= 0) {
        this.baselines[existingIndex] = { ...row, id: this.baselines[existingIndex].id };
        updated++;
      } else {
        await this.createBaseline(row);
        imported++;
      }
    }

    return { importedCount: imported, updatedCount: updated };
  }

  // --- Community Reports ---
  public async getCommunityReports(filters?: {
    stateId?: number;
    lgaId?: number;
    operatorId?: number;
    issueType?: string;
    aiSeverity?: string;
    source?: string;
    status?: string;
  }): Promise<CommunityReportRecord[]> {
    let list = [...this.communityReports];
    if (filters?.stateId) list = list.filter(r => r.state_id === filters.stateId);
    if (filters?.lgaId) list = list.filter(r => r.lga_id === filters.lgaId);
    if (filters?.operatorId) list = list.filter(r => r.operator_id === filters.operatorId);
    if (filters?.issueType) list = list.filter(r => r.issue_type === filters.issueType);
    if (filters?.aiSeverity) list = list.filter(r => r.ai_severity === filters.aiSeverity);
    if (filters?.source) list = list.filter(r => r.source === filters.source);
    if (filters?.status) list = list.filter(r => r.status === filters.status);

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getCommunityReportById(id: number): Promise<CommunityReportRecord | undefined> {
    return this.communityReports.find(r => r.id === id);
  }

  public async createCommunityReport(data: {
    reference: string;
    phone_hash: string;
    phone_masked?: string;
    state_id: number;
    lga_id: number;
    operator_id: number;
    issue_type: CommunityReportRecord['issue_type'];
    description?: string;
    reported_time?: string;
    language?: string;
    ai_category?: string;
    ai_severity?: 'low' | 'moderate' | 'high';
    source?: 'Community' | 'Demo' | 'Official';
  }): Promise<CommunityReportRecord> {
    const id = this.communityReports.length > 0 ? Math.max(...this.communityReports.map(r => r.id)) + 1 : 1;
    
    // Simple duplicate check: same phone hash, same LGA, same issue in last 3 hours
    const duplicate = this.communityReports.some(
      r => r.phone_hash === data.phone_hash &&
           r.lga_id === data.lga_id &&
           r.issue_type === data.issue_type &&
           (Date.now() - new Date(r.created_at).getTime()) < 3 * 3600 * 1000
    );

    const report: CommunityReportRecord = {
      id,
      reference: data.reference,
      phone_hash: data.phone_hash,
      phone_masked: data.phone_masked || '+234 *** *** ****',
      state_id: data.state_id,
      lga_id: data.lga_id,
      operator_id: data.operator_id,
      issue_type: data.issue_type,
      description: data.description || '',
      reported_time: data.reported_time || 'Now',
      created_at: new Date().toISOString(),
      language: data.language || 'English',
      ai_category: data.ai_category || 'unclassified',
      ai_severity: data.ai_severity || 'moderate',
      duplicate_flag: duplicate,
      status: 'received',
      source: data.source || 'Community',
    };

    this.communityReports.unshift(report);
    return report;
  }

  public async updateCommunityReport(id: number, updates: Partial<CommunityReportRecord>): Promise<CommunityReportRecord | undefined> {
    const index = this.communityReports.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.communityReports[index] = { ...this.communityReports[index], ...updates };
    return this.communityReports[index];
  }

  // --- Analytics Overview ---
  public async getAnalyticsOverview() {
    const reports = [...this.communityReports];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const reportsToday = reports.filter(r => r.created_at.startsWith(todayStr)).length;
    const reportsThisWeek = reports.filter(r => new Date(r.created_at) >= oneWeekAgo).length;

    const affectedLgasSet = new Set(reports.map(r => r.lga_id));
    
    // Top issues count
    const issueMap: Record<string, number> = {};
    const operatorMap: Record<string, number> = {};
    const severityMap: Record<string, number> = { low: 0, moderate: 0, high: 0 };

    reports.forEach(r => {
      issueMap[r.issue_type] = (issueMap[r.issue_type] || 0) + 1;
      const op = this.operators.find(o => o.id === r.operator_id)?.name || 'Unknown';
      operatorMap[op] = (operatorMap[op] || 0) + 1;
      if (r.ai_severity) {
        severityMap[r.ai_severity] = (severityMap[r.ai_severity] || 0) + 1;
      }
    });

    const sortedIssues = Object.entries(issueMap).sort((a, b) => b[1] - a[1]);
    const topIssue = sortedIssues[0]?.[0] || 'None';

    const operatorsShare = Object.entries(operatorMap).map(([name, count]) => ({
      name,
      count,
      percentage: reports.length > 0 ? Math.round((count / reports.length) * 100) : 0,
    }));

    return {
      totalReports: reports.length,
      reportsToday,
      reportsThisWeek,
      affectedLgasCount: affectedLgasSet.size,
      topIssue,
      issueBreakdown: Object.entries(issueMap).map(([issue, count]) => ({ issue, count })),
      operatorsShare,
      severityMap,
      recentReports: reports.slice(0, 5),
    };
  }

  // --- Area Analytics ---
  public async getAreaAnalytics() {
    const lgas = [...this.lgas];
    const reports = [...this.communityReports];

    const lgaStats = lgas.map(lga => {
      const lgaReports = reports.filter(r => r.lga_id === lga.id);
      const state = this.states.find(s => s.id === lga.state_id);

      const issueBreakdown: Record<string, number> = {};
      const operatorBreakdown: Record<string, number> = {};

      lgaReports.forEach(r => {
        issueBreakdown[r.issue_type] = (issueBreakdown[r.issue_type] || 0) + 1;
        const op = this.operators.find(o => o.id === r.operator_id)?.name || 'Unknown';
        operatorBreakdown[op] = (operatorBreakdown[op] || 0) + 1;
      });

      return {
        lgaId: lga.id,
        lgaName: lga.name,
        stateName: state?.name || 'Unknown',
        reportCount: lgaReports.length,
        issueBreakdown,
        operatorBreakdown,
      };
    }).sort((a, b) => b.reportCount - a.reportCount);

    return lgaStats;
  }

  // --- AI Analysis ---
  public async getAiAnalyses(): Promise<AiAnalysisRecord[]> {
    return [...this.aiAnalyses];
  }

  public async createAiAnalysis(data: Omit<AiAnalysisRecord, 'id' | 'created_at'>): Promise<AiAnalysisRecord> {
    const id = this.aiAnalyses.length > 0 ? Math.max(...this.aiAnalyses.map(a => a.id)) + 1 : 1;
    const record: AiAnalysisRecord = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.aiAnalyses.unshift(record);
    return record;
  }

  // --- Admin User ---
  public async getAdminByEmail(email: string): Promise<AdminUserRecord | undefined> {
    return this.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- SMS Logs ---
  public async getSmsLogs(): Promise<SmsLogRecord[]> {
    return [...this.smsLogs];
  }

  public async createSmsLog(log: Omit<SmsLogRecord, 'id' | 'created_at'>): Promise<SmsLogRecord> {
    const id = this.smsLogs.length > 0 ? Math.max(...this.smsLogs.map(s => s.id)) + 1 : 1;
    const record: SmsLogRecord = {
      ...log,
      id,
      created_at: new Date().toISOString(),
    };
    this.smsLogs.unshift(record);
    return record;
  }

  public async updateSmsLogStatus(
    referenceOrId: string,
    status: 'sent' | 'delivered' | 'failed' | 'simulated'
  ): Promise<boolean> {
    const log = this.smsLogs.find(
      l => l.reference === referenceOrId || `sim-msg-${l.id}` === referenceOrId || String(l.id) === referenceOrId
    );
    if (log) {
      log.status = status;
      return true;
    }
    return false;
  }

  // --- USSD Sessions ---
  public async getUssdSession(sessionId: string): Promise<UssdSessionRecord | undefined> {
    return this.ussdSessions.get(sessionId);
  }

  public async saveUssdSession(session: UssdSessionRecord): Promise<void> {
    this.ussdSessions.set(session.session_id, {
      ...session,
      updated_at: new Date().toISOString(),
    });
  }

  public async deleteUssdSession(sessionId: string): Promise<void> {
    this.ussdSessions.delete(sessionId);
  }

  // --- Bank Networks ---
  public async getBanks(): Promise<BankRecord[]> {
    return [...this.banks];
  }

  public async getBankById(id: number): Promise<BankRecord | null> {
    const bank = this.banks.find(b => b.id === id);
    return bank ? { ...bank } : null;
  }

  public async createBankReport(
    report: Omit<BankReportRecord, 'id' | 'created_at'>
  ): Promise<{ success: boolean; bank: BankRecord }> {
    const id = this.bankReports.length > 0 ? Math.max(...this.bankReports.map(r => r.id)) + 1 : 1;
    const record: BankReportRecord = {
      ...report,
      id,
      created_at: new Date().toISOString(),
    };
    this.bankReports.unshift(record);

    // Update bank's report count and status dynamically
    const bankIndex = this.banks.findIndex(b => b.id === report.bank_id);
    if (bankIndex !== -1) {
      this.banks[bankIndex].active_reports_count += 1;
      this.banks[bankIndex].last_updated = 'Just now';
      const count = this.banks[bankIndex].active_reports_count;

      if (count >= 15) {
        this.banks[bankIndex].status = 'down';
        this.banks[bankIndex].transfer_success_rate = Math.max(30, this.banks[bankIndex].transfer_success_rate - 15);
      } else if (count >= 5) {
        this.banks[bankIndex].status = 'degraded';
        this.banks[bankIndex].transfer_success_rate = Math.max(65, this.banks[bankIndex].transfer_success_rate - 8);
      }
      return { success: true, bank: { ...this.banks[bankIndex] } };
    }

    return { success: true, bank: this.banks[0] };
  }
}

export const db = new DatabaseManager();
