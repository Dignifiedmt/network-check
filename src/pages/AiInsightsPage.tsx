import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { fetchAiInsights, testAiClassification } from '../services/apiClient';
import { AiInsightsData } from '../types';

export const AiInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<AiInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Live Multilingual Tester State
  const [testText, setTestText] = useState('Internet baya aiki sosai tun safe a Sabon Tasha.');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAiInsights();
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    runLiveTest(testText);
  }, []);

  const runLiveTest = async (text: string) => {
    if (!text.trim()) return;
    setTesting(true);
    try {
      const res = await testAiClassification(text);
      setTestResult(res.classification);
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  const samplePrompts = [
    { label: 'Hausa (Data Issue)', text: 'Internet baya aiki sosai tun safe a Sabon Tasha.' },
    { label: 'Hausa (Dropped Call)', text: 'Kira yana yankewa sosai duk lokacin da na kira Zaria.' },
    { label: 'Pidgin (Data Crawl)', text: 'The MTN internet for Barnawa dey crawl well well since 2pm.' },
    { label: 'Pidgin (Blackout)', text: 'Network no dey at all for our area, total blackout.' },
    { label: 'English (SMS Failure)', text: 'Bank OTP sms are not delivering to my 9mobile SIM card today.' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Telecom Intelligence &amp; AI Analysis
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Gemini 3.8 Flash</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Server-side AI synthesis and multilingual citizen complaint classification.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 self-start bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mandatory AI-Generated Analysis Notice Banner */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        <div className="text-xs text-purple-900 space-y-1">
          <p className="font-bold">AI-Generated Analysis Notice</p>
          <p className="leading-relaxed">
            The administrative summaries below are automatically synthesized by Google Gemini strictly from recorded community submissions. The system does not assert unverified physical causation (such as cut cables) without direct technical verification.
          </p>
        </div>
      </div>

      {/* Executive Summary Card */}
      {insights ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Synthesized Operational Insight
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
              "{insights.summary}"
            </p>
          </div>

          {/* Key Findings */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">Key Observed Patterns:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.keyFindings?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed"
                >
                  <span className="font-bold text-emerald-700 mr-1.5">{idx + 1}.</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              <strong className="text-slate-900 font-semibold">Recommended Civic Action: </strong>
              {insights.recommendedAction}
            </div>
            <div className="text-slate-400 font-mono text-[11px] shrink-0">
              Generated: {new Date(insights.generatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">Loading AI summaries...</div>
      )}

      {/* Interactive Multilingual NLP Test Bench */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Multilingual Complaint Classifier (Hausa &bull; Pidgin &bull; English)
            </h3>
            <p className="text-xs text-slate-500">
              Test how NetworkCheck categorizes citizen expressions into telecom issues without manual triage.
            </p>
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Test Sample Phrases:</label>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setTestText(p.text);
                  runLiveTest(p.text);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testText}
            onChange={e => setTestText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runLiveTest(testText)}
            placeholder="Type a complaint in Hausa, Nigerian Pidgin, or English..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
          />
          <button
            onClick={() => runLiveTest(testText)}
            disabled={testing}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>

        {/* Real-Time Classification Output Box */}
        {testResult && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-800">Classification Inference Result:</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Confidence: {Math.round(testResult.confidence * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Language:</span>
                <strong className="text-slate-900 font-semibold text-sm">{testResult.language}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Telecom Category:</span>
                <strong className="text-slate-900 font-semibold text-sm capitalize">
                  {testResult.category.replace('_', ' ')}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Severity:</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                    testResult.severity === 'high'
                      ? 'bg-red-100 text-red-800'
                      : testResult.severity === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {testResult.severity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Duplicate Outage:</span>
                <strong className="text-slate-900 font-semibold text-sm">
                  {testResult.duplicateIndicator ? 'Potential Duplicate' : 'Unique Incident'}
                </strong>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 font-mono">
              Note: {testResult.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
