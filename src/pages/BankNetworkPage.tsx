import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Send,
  Zap,
  HelpCircle,
  X,
} from 'lucide-react';
import { fetchBanks, reportBankIssue } from '../services/apiClient';
import { BankItem, BankSummary, BankReportInput } from '../types';
import { SourceBadge } from '../components/SourceBadge';

interface BankNetworkPageProps {
  onOpenUssd?: () => void;
}

export const BankNetworkPage: React.FC<BankNetworkPageProps> = ({ onOpenUssd }) => {
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [summary, setSummary] = useState<BankSummary>({
    total: 0,
    operationalCount: 0,
    degradedCount: 0,
    downCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingBankId, setReportingBankId] = useState<number>(1);
  const [reportIssueType, setReportIssueType] = useState<BankReportInput['issue_type']>('failed_transfer');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPhoneNumber, setReportPhoneNumber] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');

  const loadBanks = async () => {
    setLoading(true);
    try {
      const data = await fetchBanks({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setBanks(data.banks);
      setSummary(data.summary);
    } catch (e) {
      console.error('Failed to load banks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, [selectedCategory, selectedStatus]);

  const filteredBanks = banks.filter(bank => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      bank.name.toLowerCase().includes(term) ||
      bank.code.toLowerCase().includes(term) ||
      bank.ussd_code.includes(term)
    );
  });

  const openReportForBank = (bankId: number) => {
    setReportingBankId(bankId);
    setReportSuccessMsg('');
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await reportBankIssue({
        bank_id: reportingBankId,
        issue_type: reportIssueType,
        description: reportDescription,
        phone_number: reportPhoneNumber || undefined,
      });
      setReportSuccessMsg('Report submitted successfully! Thank you for helping traders and citizens.');
      setReportDescription('');
      setReportPhoneNumber('');
      // Reload updated bank list
      await loadBanks();
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      alert('Failed to submit bank report: ' + err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bank Network Status
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> Live Switch Monitor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check which Nigerian banks have active network for instant transfers, USSD banking, and POS merchant terminals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadBanks}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
            title="Refresh bank network status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onOpenUssd && (
            <button
              onClick={onOpenUssd}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">USSD Dial (*384*20220#)</span>
              <span className="sm:hidden">*384*20220#</span>
            </button>
          )}

          <button
            onClick={() => {
              setReportSuccessMsg('');
              setIsReportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Report Bank Network Down</span>
            <span className="sm:hidden">Report Down</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Networks Working</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {summary.operationalCount} <span className="text-xs font-normal text-slate-400">/ {summary.total} Banks</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Instant transfers &amp; POS active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Slow / Delays</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {summary.degradedCount} <span className="text-xs font-normal text-slate-400">Banks</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Intermittent NIP transfer queues</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Major Outages</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {summary.downCount} <span className="text-xs font-normal text-slate-400">Banks</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High decline rates &amp; timeouts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Settlement</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            2.1s <span className="text-xs font-normal text-emerald-600">Sub-second NIP</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time switch latency</div>
        </div>
      </div>

      {/* POS Operator & Citizen Advisory Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 mt-0.5">
          <CreditCard className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="text-xs sm:text-sm text-emerald-950">
          <div className="font-bold text-emerald-900 mb-0.5">
            Advisory for POS Operators, Market Traders &amp; Citizens
          </div>
          <p className="text-slate-700 leading-relaxed">
            Before sending large transfers or swiping customer ATM cards, confirm that both the sender and recipient banks show <strong>Network Working (Green)</strong>.
            If a bank is in <strong>Slow / Delays (Yellow)</strong>, transactions may be debited but take 1–2 hours to reflect. Dial <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">*384*20220#</code> or SMS <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">BANK</code> to <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">22220</code> on any phone to check bank network offline!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search bank name or USSD code (e.g. GTB, *737#, Access, OPay, Zenith)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
            >
              <option value="all">All Institutions</option>
              <option value="commercial">Commercial Banks</option>
              <option value="fintech">FinTech / POS Networks</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
            >
              <option value="all">All Network Statuses</option>
              <option value="operational">🟢 Working (Instant)</option>
              <option value="degraded">🟡 Slow / Delays Reported</option>
              <option value="down">🔴 Outage / High Declines</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanks.map(bank => {
          const isOperational = bank.status === 'operational';
          const isDegraded = bank.status === 'degraded';
          const isDown = bank.status === 'down';

          return (
            <div
              key={bank.id}
              className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isOperational
                  ? 'border-slate-200'
                  : isDegraded
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-rose-300 bg-rose-50/10'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header: Name, USSD, and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {bank.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {bank.ussd_code}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {bank.category === 'fintech' ? 'FinTech / POS' : 'Commercial Bank'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shrink-0 ${
                      isOperational
                        ? 'bg-emerald-100 text-emerald-800'
                        : isDegraded
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOperational
                          ? 'bg-emerald-500 animate-pulse'
                          : isDegraded
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span>
                      {isOperational
                        ? 'Working'
                        : isDegraded
                        ? 'Slow / Delays'
                        : 'Down'}
                    </span>
                  </div>
                </div>

                {/* Success Rate Telemetry Progress Bars */}
                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span className="font-medium">Instant Transfer Success:</span>
                      <span className="font-bold font-mono">{bank.transfer_success_rate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bank.transfer_success_rate >= 90
                            ? 'bg-emerald-600'
                            : bank.transfer_success_rate >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${bank.transfer_success_rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400">USSD Code ({bank.ussd_code})</div>
                      <div className="font-bold text-slate-800 mt-0.5">{bank.ussd_success_rate}% Success</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400">POS Terminals</div>
                      <div className="font-bold text-slate-800 mt-0.5">{bank.pos_success_rate}% Success</div>
                    </div>
                  </div>
                </div>

                {/* Notes and Active Issues */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                    <span>Switch Telemetry:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {bank.notes}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Updated {bank.last_updated}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openReportForBank(bank.id)}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                  >
                    Report Issue
                  </button>

                  <a
                    href={`tel:${encodeURIComponent(bank.ussd_code)}`}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    title={`Dial ${bank.ussd_code} on phone`}
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Dial USSD</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBanks.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <Landmark className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700">No banks match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
        </div>
      )}

      {/* Report Bank Network Problem Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">Report Bank Network Down</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-8 text-center space-y-3 overflow-y-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-lg">Thank You!</h4>
                <p className="text-xs text-slate-600">{reportSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Bank with Issue:
                  </label>
                  <select
                    value={reportingBankId}
                    onChange={e => setReportingBankId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 font-semibold"
                  >
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.ussd_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specific Network Problem:
                  </label>
                  <select
                    value={reportIssueType}
                    onChange={e => setReportIssueType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600"
                  >
                    <option value="failed_transfer">Transfer Debited But Not Received (NIP Delay)</option>
                    <option value="pos_declined_with_debit">POS Declined But Account Was Debited</option>
                    <option value="ussd_banking_down">USSD Banking Code Timeout (e.g. *737# / *901#)</option>
                    <option value="mobile_app_slow">Mobile App Network Timeout / Login Failed</option>
                    <option value="delayed_alert">SMS Transaction Alert Not Delivering</option>
                    <option value="other">Other Network Problem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Additional Details (Optional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Transfer to Zenith Bank from Kaduna North failed around 10:30am..."
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Phone Number (Optional - for SMS notification):
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 08031234567"
                    value={reportPhoneNumber}
                    onChange={e => setReportPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Protected by NDPR privacy hashing. Your number will never be publicly exposed.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReport ? 'Submitting...' : 'Submit Bank Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
