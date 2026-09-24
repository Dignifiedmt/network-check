import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Phone,
  MessageSquare,
  Landmark,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';
import {
  fetchStates,
  fetchLgas,
  fetchBaselineComparison,
  fetchBanks,
  submitReport,
  requestAreaSmsSummary,
} from '../services/apiClient';
import { StateItem, LgaItem, BankItem } from '../types';

interface MobileHubPageProps {
  onOpenUssd: () => void;
  onOpenSms: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MobileHubPage: React.FC<MobileHubPageProps> = ({
  onOpenUssd,
  onOpenSms,
  onNavigateTab,
}) => {
  // Area Checker State
  const [states, setStates] = useState<StateItem[]>([]);
  const [lgas, setLgas] = useState<LgaItem[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number>(1); // Kaduna
  const [selectedLgaId, setSelectedLgaId] = useState<number>(1); // Chikun
  const [comparison, setComparison] = useState<any>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Bank Telemetry State
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Quick Mobile Report Form State
  const [reportOperator, setReportOperator] = useState('1'); // MTN
  const [reportIssue, setReportIssue] = useState('slow_data');
  const [reportPhone, setReportPhone] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // SMS Dispatch State
  const [smsPhoneInput, setSmsPhoneInput] = useState('');
  const [dispatchingSms, setDispatchingSms] = useState(false);
  const [smsDispatchNotice, setSmsDispatchNotice] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadStatesAndLgas();
    loadBankData();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      loadLgas(selectedStateId);
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedStateId && selectedLgaId) {
      loadComparison(selectedStateId, selectedLgaId);
    }
  }, [selectedStateId, selectedLgaId]);

  const loadStatesAndLgas = async () => {
    try {
      const stateList = await fetchStates();
      setStates(stateList);
      if (stateList.length > 0) {
        const defaultState = stateList.find(s => s.name === 'Kaduna') || stateList[0];
        setSelectedStateId(defaultState.id);
        const lgaList = await fetchLgas(defaultState.id);
        setLgas(lgaList);
        if (lgaList.length > 0) {
          const defaultLga = lgaList.find(l => l.name === 'Chikun') || lgaList[0];
          setSelectedLgaId(defaultLga.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadLgas = async (stateId: number) => {
    try {
      const lgaList = await fetchLgas(stateId);
      setLgas(lgaList);
      if (lgaList.length > 0) {
        setSelectedLgaId(lgaList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadComparison = async (stateId: number, lgaId: number) => {
    setLoadingComparison(true);
    try {
      const comp = await fetchBaselineComparison(stateId, lgaId);
      setComparison(comp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComparison(false);
    }
  };

  const loadBankData = async () => {
    setLoadingBanks(true);
    try {
      const data = await fetchBanks();
      setBanks(data.banks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleQuickReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setReportSuccess(null);
    try {
      const res = await submitReport({
        state_id: selectedStateId,
        lga_id: selectedLgaId,
        operator_id: parseInt(reportOperator, 10),
        issue_type: reportIssue,
        reported_time: 'Now',
        description: `Mobile Hub quick report from phone user.`,
        phone_number: reportPhone || undefined,
      });

      if (res.success) {
        setReportSuccess(
          `Report received! Reference: ${res.report.reference_code}. Hashed phone: ${res.report.phone_hash ? res.report.phone_hash.substring(0, 10) + '...' : 'Anonymous'}`
        );
        setReportPhone('');
        setTimeout(() => setReportSuccess(null), 8000);
      }
    } catch (err: any) {
      console.error(err);
      setReportSuccess('Submission error. Please verify network and try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDispatchSms = async () => {
    if (!smsPhoneInput) return;
    setDispatchingSms(true);
    setSmsDispatchNotice(null);
    try {
      const res = await requestAreaSmsSummary(selectedStateId, selectedLgaId, smsPhoneInput);
      if (res.success) {
        setSmsDispatchNotice(`SMS queued to ${smsPhoneInput}! Message Ref: ${res.smsRef}`);
        setSmsPhoneInput('');
        setTimeout(() => setSmsDispatchNotice(null), 6000);
      }
    } catch (e) {
      setSmsDispatchNotice('Failed to dispatch SMS. Please try again.');
    } finally {
      setDispatchingSms(false);
    }
  };

  const quickSmsCommands = [
    { cmd: 'CHECK KADUNA', desc: 'Checks full Kaduna State baseline ratings' },
    { cmd: 'CHECK CHIKUN', desc: 'Checks Chikun LGA network performance' },
    { cmd: 'CHECK ZARIA', desc: 'Checks Zaria LGA network performance' },
    { cmd: 'BANK', desc: 'Live NIP transfer & POS status for all banks' },
    { cmd: 'REPORT MTN NO SIGNAL', desc: 'Logs instant community outage' },
    { cmd: 'HELP', desc: 'Displays complete command manual via SMS' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header for Mobile Users */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Smartphone className="w-3.5 h-3.5" />
              Mobile &amp; Feature Phone Hub
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              Zero Data Balance &bull; Free USSD &bull; SMS 22020
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Nigerian Mobile Phone Quick Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Designed specifically for smartphone and basic "torchlight" phone users across Nigeria.
            Check telecom coverage, verify bank transfer health, dial toll-free USSD, or report local network issues with 1 tap.
          </p>

          {/* Quick Device Compatibility Pill Strip */}
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
            <span className="px-2 py-1 bg-white/10 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Smartphones (Android &amp; iOS)
            </span>
            <span className="px-2 py-1 bg-white/10 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Torchlight Feature Phones (Nokia/Itel)
            </span>
            <span className="px-2 py-1 bg-white/10 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              POS Terminals &amp; Mobile Money
            </span>
          </div>
        </div>
      </div>

      {/* 1-Tap Quick Action Buttons (Touch-Friendly CTAs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tap to Dial USSD */}
        <div className="bg-emerald-700 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Toll-Free USSD
              </span>
              <span className="text-[11px] bg-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
                Works Offline
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight">
                *384*22020#
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Dial directly on your phone dialer for live interactive telecom and bank menus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="tel:*384*22020%23"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-50 transition shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Tap to Dial</span>
            </a>

            <button
              onClick={onOpenUssd}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs transition border border-emerald-600/50"
            >
              <Smartphone className="w-4 h-4" />
              <span>Test Simulator</span>
            </button>
          </div>
        </div>

        {/* Tap to Send SMS */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3 border border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Two-Way SMS Shortcode
              </span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-300">
                Africa's Talking
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-white">
                SMS to 22020
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Send SMS inquiries without data. Instant automated replies for Kaduna LGAs and bank status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="sms:22020?body=CHECK%20KADUNA"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS "CHECK KADUNA"</span>
            </a>

            <a
              href="sms:22020?body=BANK"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition border border-slate-700"
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>SMS "BANK"</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Quick Network Checker Widget */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Signal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Mobile Telecom Quick Check
              </h2>
              <p className="text-xs text-slate-500">
                Compare MTN, Airtel, Glo, and 9mobile in your local area.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Official NCC Verified
          </span>
        </div>

        {/* State & LGA Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select State</label>
            <select
              value={selectedStateId}
              onChange={e => setSelectedStateId(parseInt(e.target.value, 10))}
              className="w-full text-xs sm:text-sm font-semibold p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select LGA (Local Government)
            </label>
            <select
              value={selectedLgaId}
              onChange={e => setSelectedLgaId(parseInt(e.target.value, 10))}
              className="w-full text-xs sm:text-sm font-semibold p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
            >
              {lgas.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Cards for Mobile */}
        {loadingComparison ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Fetching carrier baseline telemetry...</span>
          </div>
        ) : comparison && comparison.operators ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {comparison.operators.map((item: any) => {
              const voiceRating = item.baseline?.voice_rating || 'Fair';
              const dataRating = item.baseline?.data_rating || 'Fair';

              const isGood = voiceRating === 'Good' || voiceRating === 'Excellent';
              const isPoor = voiceRating === 'Poor';

              return (
                <div
                  key={item.operator.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      {item.operator.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isGood
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPoor
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {voiceRating}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Voice Calls:</span>
                      <span className="font-bold text-slate-800">{voiceRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data / 4G:</span>
                      <span className="font-bold text-slate-800">{dataRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Citizen Reports:</span>
                      <span className="font-medium text-slate-700">
                        {item.communityStats?.totalReports || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Send Result via SMS to Phone */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="tel"
            placeholder="Enter phone (+234...)"
            value={smsPhoneInput}
            onChange={e => setSmsPhoneInput(e.target.value)}
            className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleDispatchSms}
            disabled={dispatchingSms || !smsPhoneInput}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{dispatchingSms ? 'Dispatching...' : 'SMS Result to My Phone'}</span>
          </button>
        </div>

        {smsDispatchNotice && (
          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            {smsDispatchNotice}
          </p>
        )}
      </div>

      {/* Live Bank Network Status for Mobile Users */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Nigerian Banks &amp; POS Network Watch
              </h2>
              <p className="text-xs text-slate-500">
                Check transfer success rates and direct USSD banking codes before paying.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('banks')}
            className="text-xs text-emerald-700 font-bold hover:underline self-start sm:self-auto"
          >
            View Full Bank Board &rarr;
          </button>
        </div>

        {/* Mobile Bank Cards with Tap-to-Dial USSD Banking Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {banks.slice(0, 6).map(bank => {
            const isWorking = bank.status === 'operational';
            const isSlow = bank.status === 'degraded';

            return (
              <div
                key={bank.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{bank.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isWorking
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSlow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isWorking ? 'NIP Working' : isSlow ? 'Delays' : 'Outage'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instant Transfer (NIP):</span>
                      <span className="font-bold text-slate-800">{bank.transfer_success_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">POS Reliability:</span>
                      <span className="font-bold text-slate-800">{bank.pos_success_rate}%</span>
                    </div>
                  </div>
                </div>

                {bank.ussd_code && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Code: <strong className="text-slate-800">{bank.ussd_code}</strong>
                    </span>
                    <a
                      href={`tel:${bank.ussd_code.replace('#', '%23')}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Dial {bank.ussd_code}</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Hand Fast Community Outage Reporter */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Fast 30-Second Network Issue Report
            </h2>
            <p className="text-xs text-slate-500">
              Report poor connectivity or failed bank transfers from your phone.
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickReport} className="space-y-3.5">
          {/* Operator Select Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Select Affected Mobile Operator
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '1', name: 'MTN Nigeria' },
                { id: '2', name: 'Airtel Nigeria' },
                { id: '3', name: 'Globacom (Glo)' },
                { id: '4', name: '9mobile' },
              ].map(op => (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => setReportOperator(op.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    reportOperator === op.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {op.name}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Select Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. Select Connectivity Problem
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'no_signal', label: 'No Signal / Blackout' },
                { id: 'slow_data', label: 'Slow Data / 4G Stalled' },
                { id: 'dropped_calls', label: 'Call Drops / Failed' },
                { id: 'ussd_timeout', label: 'Bank / USSD Timeout' },
              ].map(iss => (
                <button
                  type="button"
                  key={iss.id}
                  onClick={() => setReportIssue(iss.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    reportIssue === iss.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {iss.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Input with Privacy Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+234 803 000 0000"
                value={reportPhone}
                onChange={e => setReportPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 sm:pt-6">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cryptographically salted SHA-256 hash under Nigeria Data Protection Regulation (NDPR).</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingReport}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submittingReport ? 'Submitting Report...' : 'Submit Mobile Outage Report'}</span>
          </button>

          {reportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
              {reportSuccess}
            </div>
          )}
        </form>
      </div>

      {/* Feature Phone ("Torchlight Phone") Offline SMS Cheatsheet */}
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Feature Phone (Zero Balance) SMS Guide
              </h3>
              <p className="text-xs text-slate-400">
                Text these keywords to shortcode <strong>22020</strong> on any phone
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
            22020
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickSmsCommands.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-mono font-extrabold text-xs text-emerald-300">
                  {item.cmd}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => handleCopy(item.cmd, `sms-${idx}`)}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition shrink-0"
                title="Copy SMS Command"
              >
                {copiedKey === `sms-${idx}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
