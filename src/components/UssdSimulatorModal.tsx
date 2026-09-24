import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  RotateCcw,
  X,
  Smartphone,
  Mail,
  CheckCircle2,
  Send,
  ExternalLink,
  Copy,
  Check,
  Server,
  Zap,
  Radio,
  Building2,
} from 'lucide-react';
import {
  sendUssdSessionInput,
  fetchAfricaTalkingStatus,
  simulateIncomingSms,
  AfricaTalkingStatusData,
} from '../services/apiClient';

interface UssdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted?: () => void;
  onOpenSmsOutbox?: () => void;
}

export const UssdSimulatorModal: React.FC<UssdSimulatorModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
  onOpenSmsOutbox,
}) => {
  const [activeTab, setActiveTab] = useState<'ussd' | 'sms' | 'at_guide'>('ussd');

  // USSD Simulator State
  const [phoneNumber, setPhoneNumber] = useState('+2348031234567');
  const [sessionId, setSessionId] = useState(`sess_${Date.now()}`);
  const [sessionTextHistory, setSessionTextHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [screenText, setScreenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [recentSmsNotification, setRecentSmsNotification] = useState<string | null>(null);

  // SMS Simulator State
  const [smsTestNumber, setSmsTestNumber] = useState('+2348031234567');
  const [smsTestInput, setSmsTestInput] = useState('BANK');
  const [smsHistory, setSmsHistory] = useState<
    Array<{ type: 'sent' | 'reply'; text: string; time: string; action?: string }>
  >([
    {
      type: 'reply',
      text: 'NetworkCheck SMS Gateway (Shortcode 22220): Ready. Send "BANK" to 22220 for live bank status or an LGA name (e.g. "CHIKUN") for network ratings.',
      time: 'Just now',
    },
  ]);
  const [sendingSmsTest, setSendingSmsTest] = useState(false);

  // AT Integration Status State
  const [atStatus, setAtStatus] = useState<AfricaTalkingStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (!isSessionActive && activeTab === 'ussd') {
        dialServiceCode();
      }
      loadAtStatus();
    }
  }, [isOpen]);

  const loadAtStatus = async () => {
    try {
      setLoadingStatus(true);
      const data = await fetchAfricaTalkingStatus();
      setAtStatus(data);
    } catch (e) {
      console.error('Failed to load AT status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const dialServiceCode = async () => {
    setIsLoading(true);
    const newSessionId = `ussd_live_${Date.now()}`;
    setSessionId(newSessionId);
    setSessionTextHistory([]);
    setCurrentInput('');
    setRecentSmsNotification(null);

    try {
      const response = await sendUssdSessionInput(newSessionId, phoneNumber, '');
      setScreenText(response.replace(/^(CON|END)\s*/, ''));
      setIsSessionActive(response.startsWith('CON'));
    } catch (e: any) {
      setScreenText('Connection Error.\nCould not reach NetworkCheck USSD gateway.');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInput = async (inputToSend?: string) => {
    const val = (inputToSend !== undefined ? inputToSend : currentInput).trim();
    if (!val && isSessionActive) return;

    setIsLoading(true);
    const updatedHistory = [...sessionTextHistory, val];
    const textParam = updatedHistory.join('*');

    try {
      const response = await sendUssdSessionInput(sessionId, phoneNumber, textParam);
      const isCon = response.startsWith('CON');
      const isEnd = response.startsWith('END');

      setScreenText(response.replace(/^(CON|END)\s*/, ''));
      setSessionTextHistory(updatedHistory);
      setCurrentInput('');
      setIsSessionActive(isCon);

      if (isEnd) {
        if (response.toLowerCase().includes('sms') || response.toLowerCase().includes('report recorded') || response.toLowerCase().includes('problem recorded')) {
          setRecentSmsNotification('New SMS dispatched to phone! Check SMS Console.');
          if (onReportSubmitted) {
            onReportSubmitted();
          }
        }
      }
    } catch (err: any) {
      setScreenText('USSD Network Timeout.\nPlease try dialing *384*20220# again.');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    setCurrentInput(prev => prev + num);
  };

  const handleBackspace = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  const handleSendTestSms = async (customText?: string) => {
    const messageToSend = customText || smsTestInput;
    if (!messageToSend.trim()) return;

    setSendingSmsTest(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSmsHistory(prev => [
      ...prev,
      { type: 'sent', text: messageToSend, time: timeStr },
    ]);

    try {
      const res = await simulateIncomingSms(smsTestNumber, messageToSend);
      setSmsHistory(prev => [
        ...prev,
        {
          type: 'reply',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: res.action,
        },
      ]);
      setSmsTestInput('');
      if (onReportSubmitted && res.action === 'community_report') {
        onReportSubmitted();
      }
    } catch (err: any) {
      setSmsHistory(prev => [
        ...prev,
        {
          type: 'reply',
          text: 'Error processing incoming SMS via Africa\'s Talking gateway.',
          time: timeStr,
        },
      ]);
    } finally {
      setSendingSmsTest(false);
    }
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Telecom &amp; Bank Network Simulator
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Africa's Talking Gateway (*384*20220# &amp; SMS 22220)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] sm:text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('ussd')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition ${
              activeTab === 'ussd'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span><span className="hidden sm:inline">USSD Dial </span>*384*20220#</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition ${
              activeTab === 'sms'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>SMS 22220</span>
          </button>

          <button
            onClick={() => setActiveTab('at_guide')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition ${
              activeTab === 'at_guide'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 shrink-0" />
            <span><span className="hidden sm:inline">Railway &amp; </span>AT Guide</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-slate-100 flex-1">
          {/* TAB 1: USSD HANDSET SIMULATOR */}
          {activeTab === 'ussd' && (
            <div className="flex flex-col items-center">
              {/* Handset Shell */}
              <div className="w-full max-w-[320px] bg-slate-800 rounded-3xl p-4 shadow-xl border-4 border-slate-700">
                {/* Speaker Grille */}
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-1 bg-slate-600 rounded-full" />
                </div>

                {/* LCD Screen */}
                <div className="bg-[#b4c9b1] text-slate-900 font-mono text-xs rounded-lg p-3 min-h-[175px] shadow-inner border-2 border-[#8ca389] flex flex-col justify-between">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between border-b border-[#9eb59b] pb-1 text-[10px] text-slate-700 font-sans font-medium">
                    <span className="flex items-center gap-1 font-bold">
                      📶 MTN NG / 2G
                    </span>
                    <span className="font-bold">*384*20220#</span>
                    <span>🔋 88%</span>
                  </div>

                  {/* Main Screen Content */}
                  <div className="py-2 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[135px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-24 text-slate-700 italic animate-pulse">
                        Connecting to USSD Gateway...
                      </div>
                    ) : (
                      screenText || 'Dial *384*20220# to begin.'
                    )}
                  </div>

                  {/* Response input indicator */}
                  {isSessionActive && (
                    <div className="pt-1.5 border-t border-[#9eb59b] flex items-center justify-between">
                      <span className="text-[11px] text-slate-900 font-bold">
                        Input: {currentInput}
                      </span>
                      <span className="text-[10px] text-slate-700 uppercase font-bold">
                        {isLoading ? 'Wait...' : 'Send'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Handset Action Buttons */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <button
                    onClick={() => handleSendInput()}
                    disabled={isLoading || (!isSessionActive && screenText.length > 0)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 transition flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {isSessionActive ? 'Send' : 'Dial'}
                  </button>

                  <button
                    onClick={dialServiceCode}
                    className="px-2.5 py-1 bg-slate-700 text-slate-200 rounded-md text-xs font-medium hover:bg-slate-600 transition flex items-center gap-1"
                    title="Restart Session"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>

                  <button
                    onClick={handleBackspace}
                    className="px-2.5 py-1 bg-slate-700 text-slate-200 rounded-md text-xs font-medium hover:bg-slate-600 transition"
                  >
                    Del
                  </button>
                </div>

                {/* 12-Key Pad */}
                <div className="grid grid-cols-3 gap-1.5 mt-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        if (isSessionActive) {
                          handleKeyPress(key);
                        } else if (key === '*') {
                          dialServiceCode();
                        }
                      }}
                      className="h-9 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-sm font-bold rounded-lg shadow-sm transition flex items-center justify-center"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Shortcuts */}
              <div className="w-full mt-4 bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick USSD Shortcuts</span>
                  <span className="text-[10px] text-slate-400 font-normal">Direct menu paths</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('1'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-left font-medium transition"
                  >
                    1. Check Area (Kaduna)
                  </button>
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('2'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded-lg text-left font-medium transition"
                  >
                    2. Compare Networks
                  </button>
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('3'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 rounded-lg text-left font-medium transition"
                  >
                    3. Report Issue
                  </button>
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('4'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-left transition flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>4. Bank Networks</span>
                  </button>
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('5'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-800 border border-slate-200 rounded-lg text-left font-medium transition"
                  >
                    5. Get Area by SMS
                  </button>
                  <button
                    onClick={() => {
                      dialServiceCode();
                      setTimeout(() => handleSendInput('6'), 200);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left font-medium transition"
                  >
                    6. Service Help
                  </button>
                </div>
              </div>

              {/* SMS Notification Banner */}
              {recentSmsNotification && (
                <div className="w-full mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{recentSmsNotification}</span>
                  </div>
                  {onOpenSmsOutbox && (
                    <button
                      onClick={onOpenSmsOutbox}
                      className="px-2 py-1 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition shrink-0 ml-2"
                    >
                      View Outbox
                    </button>
                  )}
                </div>
              )}

              {/* Phone MSISDN */}
              <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Handset MSISDN:</span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800 font-mono text-xs w-40 text-right"
                  placeholder="+234..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: TWO-WAY SMS TESTER */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    Simulate Citizen Inbound SMS
                  </span>
                  <span className="text-[11px] text-slate-400">Two-Way Africa's Talking Engine</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Citizens without smartphones can text keywords to NetworkCheck's shortcode to receive instant bank and telecom alerts.
                </p>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Quick text:</span>
                  {[
                    { label: 'BANK', text: 'BANK' },
                    { label: 'CHIKUN', text: 'CHIKUN' },
                    { label: 'ZARIA', text: 'ZARIA' },
                    { label: 'HELP', text: 'HELP' },
                    { label: 'REPORT NO SERVICE', text: 'REPORT MTN KADUNA NO NETWORK' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleSendTestSms(item.text)}
                      className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition"
                    >
                      "{item.label}"
                    </button>
                  ))}
                </div>

                {/* Custom SMS Input Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type SMS command (e.g. BANK, CHIKUN, HELP)..."
                    value={smsTestInput}
                    onChange={e => setSmsTestInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendTestSms();
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                  />
                  <button
                    onClick={() => handleSendTestSms()}
                    disabled={sendingSmsTest || !smsTestInput.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingSmsTest ? 'Sending...' : 'Send SMS'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 max-h-[300px] overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  SMS Message Conversation
                </div>
                {smsHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${item.type === 'sent' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        item.type === 'sent'
                          ? 'bg-emerald-700 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs font-mono whitespace-pre-wrap'
                      }`}
                    >
                      {item.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AFRICA'S TALKING & RAILWAY GUIDE */}
          {activeTab === 'at_guide' && (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Status Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">Africa's Talking Gateway Status</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                      atStatus?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {atStatus?.mode === 'production'
                      ? 'Live Production'
                      : atStatus?.mode === 'sandbox'
                      ? 'Sandbox Mode'
                      : 'Simulation Mode'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">AT Account:</span>
                    <span className="font-semibold text-slate-800">{atStatus?.username || 'sandbox'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sender ID:</span>
                    <span className="font-semibold text-slate-800">{atStatus?.senderId || 'Default'}</span>
                  </div>
                </div>
              </div>

              {/* Railway Webhook URLs Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Your Webhook URLs for Africa's Talking &amp; Railway
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    Production Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Paste these URLs into your Africa's Talking dashboard (or your Railway deployment):
                </p>

                {/* USSD Webhook */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    1. USSD Callback URL (Service Code: *384*20220#)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={atStatus?.webhooks.ussdUrl || `${window.location.origin}/api/ussd/webhook`}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          atStatus?.webhooks.ussdUrl || `${window.location.origin}/api/ussd/webhook`,
                          'ussd'
                        )
                      }
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Copy URL"
                    >
                      {copiedField === 'ussd' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SMS Webhook */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    2. Incoming SMS Callback URL (Shortcode: 22220)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={atStatus?.webhooks.smsUrl || `${window.location.origin}/api/sms/webhook`}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          atStatus?.webhooks.smsUrl || `${window.location.origin}/api/sms/webhook`,
                          'sms'
                        )
                      }
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Copy URL"
                    >
                      {copiedField === 'sms' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Delivery Reports URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    3. SMS Delivery Reports Callback URL
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={atStatus?.webhooks.deliveryReportsUrl || `${window.location.origin}/api/sms/delivery-reports`}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          atStatus?.webhooks.deliveryReportsUrl || `${window.location.origin}/api/sms/delivery-reports`,
                          'dlr'
                        )
                      }
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Copy URL"
                    >
                      {copiedField === 'dlr' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Africa's Talking Official Web Simulator Deep-link */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 text-xs">
                    Official Africa's Talking Web Simulator
                  </div>
                  <a
                    href="https://simulator.africastalking.com:1517/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                  >
                    <span>Open AT Simulator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can also test with Africa's Talking official web phone! Go to{' '}
                  <a
                    href="https://simulator.africastalking.com:1517/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-800 underline"
                  >
                    simulator.africastalking.com:1517
                  </a>
                  , enter your Africa's Talking API key and username, and dial{' '}
                  <code className="bg-emerald-100 px-1 py-0.5 rounded font-bold text-emerald-900">*384*20220#</code>!
                </p>
              </div>

              {/* Render & Railway Environment Variables Card */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Render &amp; Production Hosting Variables</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pre-configured in <code className="text-emerald-400">render.yaml</code> Blueprint for 1-click deploy:
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-1">
                  <div>NODE_ENV=production</div>
                  <div>AT_USERNAME=sandbox</div>
                  <div>AT_API_KEY=atsk_8c2c1c9359de445a9184056ebcdd84bb415f010d44bc1259ac72cbb8b3393cedec034dc8</div>
                  <div>AT_USSD_SERVICE_CODE=*384*20220#</div>
                  <div>AT_SMS_SHORT_CODE=22220</div>
                  <div>ADMIN_DEFAULT_EMAIL=admin@networkcheck.ng</div>
                  <div>ADMIN_DEFAULT_PASSWORD=admin_secure_password_2026</div>
                  <div>DEMO_MODE=true (or false with live PostgreSQL)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>USSD &amp; Two-Way SMS work 100% without mobile data</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
