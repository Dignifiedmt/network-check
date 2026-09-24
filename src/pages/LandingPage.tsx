import React, { useState, useEffect } from 'react';
import {
  Phone,
  Signal,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Users,
  Search,
  MessageSquare,
  Sparkles,
  BarChart2,
  Lock,
} from 'lucide-react';
import { fetchStates, fetchLgas, fetchBaselineComparison, submitReport } from '../services/apiClient';
import { StateItem, LgaItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';

interface LandingPageProps {
  onExploreDashboard: () => void;
  onOpenUssd: () => void;
  onOpenSms: () => void;
  isAdmin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreDashboard,
  onOpenUssd,
  onOpenSms,
  isAdmin = false,
}) => {
  // Quick Area Checker State
  const [states, setStates] = useState<StateItem[]>([]);
  const [lgas, setLgas] = useState<LgaItem[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number>(1); // Kaduna default
  const [selectedLgaId, setSelectedLgaId] = useState<number>(1); // Chikun default
  const [comparison, setComparison] = useState<any>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Quick Web Report Form State
  const [reportingNetwork, setReportingNetwork] = useState('1'); // MTN
  const [reportingIssue, setReportingIssue] = useState('slow_data');
  const [reportingTime, setReportingTime] = useState('Now');
  const [reportingDesc, setReportingDesc] = useState('');
  const [reportingPhone, setReportingPhone] = useState('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    loadStatesAndLgas();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      loadLgasForState(selectedStateId);
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

  const loadLgasForState = async (stateId: number) => {
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

  const handleQuickReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportSuccessMsg(null);
    try {
      const res = await submitReport({
        state_id: selectedStateId,
        lga_id: selectedLgaId,
        operator_id: parseInt(reportingNetwork, 10),
        issue_type: reportingIssue,
        description: reportingDesc,
        reported_time: reportingTime,
        phone_number: reportingPhone,
        source: 'Community',
      });
      if (res.success) {
        setReportSuccessMsg(`Report submitted successfully! Ref: ${res.report?.reference}. Classified as: ${res.aiClassification?.category} (${res.aiClassification?.language}).`);
        setReportingDesc('');
      }
    } catch (err: any) {
      alert('Report submission error: ' + err.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-18 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Africa's Talking USSD &amp; Two-Way SMS Enabled • Railway Ready</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Connectivity information <br className="hidden sm:block" />
              <span className="text-emerald-700 underline decoration-emerald-400 decoration-wavy decoration-2">
                for every phone.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Check telecom coverage and live bank network status, report connectivity blackouts, and receive updates through USSD and SMS — without needing mobile internet or smartphones.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenUssd}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5 text-sm"
              >
                <Phone className="w-4 h-4 text-emerald-200" />
                <span>Launch Simulator (*384*20220# &amp; SMS 22220)</span>
              </button>

              <button
                onClick={onExploreDashboard}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2 text-sm"
              >
                {isAdmin ? (
                  <>
                    <BarChart2 className="w-4 h-4 text-emerald-700" />
                    <span>View Admin Overview</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                      Admin
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Admin Overview (Sign In)</span>
                  </>
                )}
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-5 py-3.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition text-center"
              >
                How It Works &darr;
              </a>
            </div>

            {/* Regulatory Disclaimer Pill */}
            <div className="pt-3 max-w-xl mx-auto">
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 text-xs text-slate-500 text-center leading-relaxed">
                <span className="font-semibold text-slate-700">Notice:</span> Network performance information comes from identified data sources (Official NCC bulletins) and community reports. Results are not guaranteed measurements of your exact location.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Process */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">
            Zero Internet Needed
          </h2>
          <h3 className="text-2xl font-bold text-slate-900">
            How NetworkCheck Works in 3 Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Dial *384*20220# or SMS 22220</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Dial the toll-free USSD code on any phone or send an SMS to shortcode 22220 — basic feature phone (torchlight phone) or smartphone. Works even when you have 0.00 data balance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Smartphone className="w-4 h-4" />
              <span>Works on MTN, Airtel, Glo, 9mobile</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Check or Report</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Navigate the lightweight text menu. Select your State (e.g., Kaduna) and LGA (e.g., Chikun). Check ratings or report dropped calls, slow internet, or network blackouts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>Supports Hausa, Pidgin &amp; English</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Receive Information</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                View instant on-screen operator comparisons for Voice and Data, and optionally receive a structured SMS receipt with reference code for follow-up.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-purple-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Free SMS dispatch via Africa's Talking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Area Checker & Live Comparison Tool */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Live Connectivity Inspector</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Check Network Performance by Area
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your State and LGA to view audited voice &amp; data performance side by side.
              </p>
            </div>

            {/* Dropdown Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <select
                  value={selectedStateId}
                  onChange={e => setSelectedStateId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-emerald-600"
                >
                  {states.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">LGA</label>
                <select
                  value={selectedLgaId}
                  onChange={e => setSelectedLgaId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-emerald-600"
                >
                  {lgas.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => loadComparison(selectedStateId, selectedLgaId)}
                  disabled={loadingComparison}
                  className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center"
                >
                  {loadingComparison ? 'Loading...' : 'Refresh Area'}
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Cards & Source Attribution */}
          <div className="pt-6 space-y-6">
            {comparison ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {comparison.lga?.name.toUpperCase()} LGA, {comparison.state?.name} State
                    </h4>
                    <p className="text-xs text-slate-500">
                      Operator quality metrics based on verified technical audit reports.
                    </p>
                  </div>
                  <SourceBadge
                    sourceType={comparison.primarySource?.type}
                    sourceName={comparison.primarySource?.name}
                    lastUpdated={comparison.primarySource?.lastUpdated}
                  />
                </div>

                {/* Operator Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparison.operators?.map((opData: any) => {
                    const voice = opData.baseline?.voice_rating || 'Fair';
                    const data = opData.baseline?.data_rating || 'Fair';
                    const sms = opData.baseline?.sms_rating || 'Good';

                    const getRatingColor = (r: string) => {
                      if (r === 'Good') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
                      if (r === 'Fair') return 'text-blue-700 bg-blue-50 border-blue-200';
                      if (r === 'Poor') return 'text-amber-700 bg-amber-50 border-amber-200';
                      return 'text-red-700 bg-red-50 border-red-200';
                    };

                    return (
                      <div
                        key={opData.operator.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <span className="font-extrabold text-base text-slate-900">
                              {opData.operator.name}
                            </span>
                            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {opData.operator.code}
                            </span>
                          </div>

                          <div className="py-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Voice Calls:</span>
                              <span className={`px-2 py-0.5 rounded-md font-semibold border ${getRatingColor(voice)}`}>
                                {voice}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Mobile Data:</span>
                              <span className={`px-2 py-0.5 rounded-md font-semibold border ${getRatingColor(data)}`}>
                                {data}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">SMS / OTP:</span>
                              <span className={`px-2 py-0.5 rounded-md font-semibold border ${getRatingColor(sms)}`}>
                                {sms}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Citizen Reports: <strong>{opData.communityStats?.totalReports || 0}</strong></span>
                          {opData.communityStats?.topIssue && (
                            <span className="text-amber-700 capitalize">
                              {opData.communityStats.topIssue.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-400">Loading baseline comparison...</div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Community Report Form */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Submission Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Voice Your Experience</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Report a Network Problem
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Help your local community and field teams document network drops. Even if you use USSD on a basic phone, you can also submit your experience here.
            </p>

            {reportSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reportSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickReport} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Network</label>
                  <select
                    value={reportingNetwork}
                    onChange={e => setReportingNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                  >
                    <option value="1">MTN Nigeria</option>
                    <option value="2">Airtel Nigeria</option>
                    <option value="3">Globacom (Glo)</option>
                    <option value="4">9mobile / T2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">What is the problem?</label>
                  <select
                    value={reportingIssue}
                    onChange={e => setReportingIssue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                  >
                    <option value="slow_data">Internet Slow / Crawling</option>
                    <option value="no_network">No Network / Total Blackout</option>
                    <option value="dropped_calls">Calls Dropping Frequently</option>
                    <option value="call_connect_fail">Calls Not Connecting</option>
                    <option value="sms_problem">SMS / OTP Not Delivering</option>
                    <option value="other">Other Connectivity Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description (Hausa, Nigerian Pidgin, or English)
                </label>
                <textarea
                  value={reportingDesc}
                  onChange={e => setReportingDesc(e.target.value)}
                  placeholder="e.g. 'Internet baya aiki sosai tun safe' or 'The network dey drop call every 2 mins'"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                />
                <span className="text-[11px] text-slate-400">
                  Multilingual AI automatically classifies Hausa, Pidgin, and English descriptions.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">When did this happen?</label>
                  <select
                    value={reportingTime}
                    onChange={e => setReportingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                  >
                    <option value="Now">Right now</option>
                    <option value="Today">Earlier today</option>
                    <option value="Yesterday">Yesterday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone (Optional for SMS receipt)
                  </label>
                  <input
                    type="text"
                    value={reportingPhone}
                    onChange={e => setReportingPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReport}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition text-xs sm:text-sm"
              >
                {isSubmittingReport ? 'Submitting & Classifying...' : 'Submit Community Report'}
              </button>
            </form>
          </div>

          {/* Multilingual AI Intelligence Showcase */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Multilingual AI Triage</span>
              </div>
              <h3 className="text-xl font-bold mb-3">
                Built for Real Nigerian Telecom Context
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                Our Gemini-powered classification engine parses citizen feedback in native dialects without requiring manual data-entry staff:
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-emerald-400 font-semibold mb-1">Hausa Example:</div>
                  <div className="text-slate-200">"Internet baya aiki sosai tun safe."</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    &rarr; Category: <span className="text-emerald-300">mobile_data</span> | Language: <span className="text-emerald-300">Hausa</span> | Severity: <span className="text-amber-300">moderate</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-blue-400 font-semibold mb-1">Nigerian Pidgin Example:</div>
                  <div className="text-slate-200">"The network dey drop call every 2 mins."</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    &rarr; Category: <span className="text-blue-300">voice</span> | Language: <span className="text-blue-300">Pidgin</span> | Severity: <span className="text-amber-300">moderate</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                <span>Model: Google Gemini 3.8 Flash</span>
                <span className="text-emerald-400 font-semibold">100% Server-Side</span>
              </div>
            </div>

            {/* Privacy Shield Info Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>NDPR &amp; Citizen Privacy Protection</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                NetworkCheck never stores or exposes raw citizen phone numbers. Numbers are converted via irreversible salted SHA-256 hashes to prevent unauthorized surveillance while enabling rapid duplicate outage detection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
