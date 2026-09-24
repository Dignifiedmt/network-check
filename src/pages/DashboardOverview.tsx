import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Phone,
  Signal,
  CheckCircle2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Home,
} from 'lucide-react';
import {
  fetchAnalyticsOverview,
  getAdminToken,
  setAdminToken,
  adminLogin,
} from '../services/apiClient';
import { AnalyticsOverview } from '../types';
import { SourceBadge } from '../components/SourceBadge';

interface DashboardOverviewProps {
  onNavigateReports: () => void;
  onOpenUssd: () => void;
  isAdmin?: boolean;
  onAdminLoginSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateReports,
  onOpenUssd,
  isAdmin = false,
  onAdminLoginSuccess,
  onNavigateHome,
}) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Quick inline admin login form
  const [email, setEmail] = useState('admin@networkcheck.ng');
  const [password, setPassword] = useState('admin_secure_password_2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const loadData = async () => {
    const token = getAdminToken();
    if (!token && !isAdmin) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(false);
    try {
      const overview = await fetchAnalyticsOverview();
      setData(overview);
    } catch (e: any) {
      if (e.message === 'ADMIN_AUTH_REQUIRED') {
        setAuthError(true);
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await adminLogin(email, password);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setAuthError(false);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
        await loadData();
      } else {
        setLoginError(res.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setLoginError('Authentication failed: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // If not authenticated, render restricted access screen
  const token = getAdminToken();
  if (authError || (!token && !isAdmin)) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
              <ShieldAlert className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase tracking-wider mb-2">
                Restricted Access
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Administrator Overview
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Only authorized administrators and regulators have access to view the Community Connectivity Intelligence overview, live outage failure rates, and incident telemetry.
            </p>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Default Admin Credentials
              </span>
              <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-mono">
                Auto-fill
              </span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-emerald-200/80 font-mono text-[11px] text-slate-800 space-y-0.5">
              <div>Email: <strong className="text-emerald-950 font-bold">admin@networkcheck.ng</strong></div>
              <div>Pass: <strong className="text-emerald-950 font-bold">admin_secure_password_2026</strong></div>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleInlineLogin} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'Authenticating...' : 'Sign In to Unlock Overview'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {onNavigateHome && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Public Homepage</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-medium">Loading telemetry overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Connectivity Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
              Live Stream
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated real-time citizen reports collected via USSD (*384*20220#) and SMS (22220).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenUssd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Simulate New Report</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Reports</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.totalReports || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Citizen USSD &amp; SMS logs
          </div>
        </div>

        {/* Reports Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.reportsToday || 0}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Active monitoring window</span>
          </div>
        </div>

        {/* Reports This Week */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">This Week</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.reportsThisWeek || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Last 7 rolling days
          </div>
        </div>

        {/* Affected LGAs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Affected LGAs</span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.affectedLgasCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Kaduna &amp; regional areas
          </div>
        </div>

        {/* Top Issue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Leading Issue</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 capitalize truncate">
            {data?.topIssue?.replace('_', ' ') || 'None'}
          </div>
          <div className="mt-1 text-[11px] text-red-600 font-medium">
            Most frequent complaint
          </div>
        </div>
      </div>

      {/* Issue Breakdown & Operator Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Report Category Distribution</span>
            <span className="text-xs font-normal text-slate-400">By Issue Type</span>
          </h3>

          <div className="space-y-3">
            {data?.issueBreakdown?.map(item => {
              const pct = data.totalReports > 0 ? Math.round((item.count / data.totalReports) * 100) : 0;
              return (
                <div key={item.issue} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 capitalize">{item.issue.replace('_', ' ')}</span>
                    <span className="text-slate-500 font-mono">{item.count} reports ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operator Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Reports by Mobile Operator</span>
            <span className="text-xs font-normal text-slate-400">Distribution %</span>
          </h3>

          <div className="space-y-4">
            {data?.operatorsShare?.map(op => {
              const getBarColor = (name: string) => {
                if (name.includes('MTN')) return 'bg-amber-500';
                if (name.includes('Airtel')) return 'bg-red-500';
                if (name.includes('Glo')) return 'bg-emerald-600';
                return 'bg-purple-600';
              };

              return (
                <div key={op.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{op.name}</span>
                    <span className="text-slate-500 font-mono">{op.count} reports ({op.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(op.name)}`}
                      style={{ width: `${op.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Live Reports Stream: Mobile Cards (<md) & Desktop Table (>=md) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Recent Community Submissions</h3>
            <p className="text-xs text-slate-500">Live incoming stream with AI triage and source attribution</p>
          </div>
          <button
            onClick={onNavigateReports}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline self-start sm:self-auto"
          >
            View All Reports &rarr;
          </button>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {(!data?.recentReports || data.recentReports.length === 0) ? (
            <div className="p-6 text-center text-slate-400 text-xs">No recent reports recorded yet.</div>
          ) : (
            data.recentReports.map(report => (
              <div key={report.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{report.reference}</span>
                  <SourceBadge sourceType={report.source} compact />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{report.lga_name || 'Chikun'}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({report.state_name || 'Kaduna'})</span>
                  </div>
                  <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                    {report.operator_name || 'MTN'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-slate-700">
                    {report.issue_type.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      report.ai_severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : report.ai_severity === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {report.ai_severity}
                  </span>
                </div>
                {report.description && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                    "{report.description}"
                  </p>
                )}
                <div className="text-[10px] text-slate-400 font-mono pt-1 text-right">
                  {report.reported_time || 'Just now'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-6 py-3">Reference</th>
                <th className="px-4 py-3">LGA / State</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Issue Reported</th>
                <th className="px-4 py-3">AI Severity</th>
                <th className="px-4 py-3">Data Source</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentReports?.map(report => (
                <tr key={report.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-800">
                    {report.reference}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-900">{report.lga_name || 'Chikun'}</span>
                    <span className="text-slate-400 block text-[10px]">{report.state_name || 'Kaduna'}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {report.operator_name || 'MTN'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize font-medium text-slate-700">
                      {report.issue_type.replace('_', ' ')}
                    </span>
                    {report.description && (
                      <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                        "{report.description}"
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.ai_severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : report.ai_severity === 'moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {report.ai_severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <SourceBadge sourceType={report.source} compact />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                    {report.reported_time || 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
