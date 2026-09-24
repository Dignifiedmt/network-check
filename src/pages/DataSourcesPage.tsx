import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, ExternalLink, RefreshCw, Lock, AlertTriangle } from 'lucide-react';
import { fetchSources } from '../services/apiClient';
import { DataSourceItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await fetchSources();
      setSources(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Sources &amp; Transparency Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explicit provenance, methodology, limitations, and privacy architecture for NetworkCheck.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 self-start bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sources List */}
      <div className="grid grid-cols-1 gap-6">
        {sources.map(src => (
          <div
            key={src.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">{src.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Version: <strong className="font-mono text-slate-700">{src.datasetVersion}</strong></span>
                    <span>&bull;</span>
                    <span>Status: <strong className="text-emerald-700">{src.status}</strong></span>
                  </div>
                </div>
              </div>
              <SourceBadge sourceType={src.type} />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {src.notes}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Last Updated: <strong className="text-slate-700">{src.lastUpdated}</strong></span>
                <span>Active Records: <strong className="text-slate-700">{src.recordsCount}</strong></span>
              </div>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                >
                  <span>Official Publication Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Integrity & Anti-Fabrication Constitution */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Core Data Integrity Rule</span>
        </div>
        <h3 className="text-xl font-bold">
          Strict Separation Between Official, Community, and Demo Data
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          NetworkCheck never manufactures or invents synthetic network metrics disguised as real readings. Every result delivered to a citizen over USSD, SMS, or this dashboard is labeled with its exact provenance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <div className="font-bold text-emerald-400 mb-1">1. Official Baseline Data</div>
            <p className="text-slate-400">
              Imported by verified administrators directly from audited regulatory publications (NCC QoS Bulletins).
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <div className="font-bold text-blue-400 mb-1">2. Community Reports</div>
            <p className="text-slate-400">
              Direct crowdsourced submissions from citizens over USSD, SMS, or web, accompanied by report volume counters.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <div className="font-bold text-amber-400 mb-1">3. Demo / Test Data</div>
            <p className="text-slate-400">
              Synthetic data strictly flagged with <strong className="text-amber-300">DEMO DATA — not real network measurements</strong> during tests.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Architecture Notice */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-2 text-xs sm:text-sm">
          <h4 className="font-extrabold text-slate-900 text-base">
            Citizen Privacy &amp; Phone Number Hashing (NDPR Standard)
          </h4>
          <p className="text-slate-600 leading-relaxed">
            In compliance with the Nigeria Data Protection Act (NDPA) and NDPR, raw phone numbers dialed on USSD (*384*22020#) or received via SMS (22020) are never persisted in cleartext. Each incoming MSISDN is passed through a cryptographically salted HMAC SHA-256 pipeline, yielding a deterministic hash that lets the system detect duplicate spam without maintaining a surveillance log of citizen identities.
          </p>
        </div>
      </div>
    </div>
  );
};
