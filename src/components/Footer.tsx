import React from 'react';
import { ShieldCheck, Signal, PhoneCall, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Signal className="w-4 h-4 text-white" />
              </div>
              <span>NetworkCheck Nigeria</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A low-bandwidth connectivity information and community reporting layer that brings verified mobile-network performance data to citizens through USSD (*384*22020#) and SMS (22020) — without needing mobile internet or smartphones.
            </p>
            <div className="flex items-center gap-2 pt-1 text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Nigerian Data Protection Act (NDPA) &amp; NDPR Compliant Privacy Shield</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Platform Channels
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-mono">*384*22020# (USSD)</span>
              </li>
              <li>SMS Shortcode: <strong className="text-slate-300 font-mono">22020</strong></li>
              <li>Target Focus: <span className="text-slate-300">Kaduna State (23 LGAs)</span></li>
              <li>National Scope: <span className="text-slate-300">All 36 States + FCT</span></li>
            </ul>
          </div>

          {/* Regulatory Data Sources */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Verified Baselines
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ncc.gov.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  NCC Quality of Service Bulletins <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>Africa's Talking Telecom APIs</li>
              <li>Crowdsourced Citizen Reports</li>
              <li>Multilingual AI Intelligence (Gemini)</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Data Integrity & Privacy Disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="leading-relaxed text-center md:text-left">
            <strong>Important Data Notice:</strong> Network performance information comes from identified official data sources and community reports. Results reflect aggregated regional and LGA indications and are not guaranteed measurements of your exact instantaneous handset location. Citizen phone numbers are never stored in raw form or exposed publicly.
          </p>
          <div className="shrink-0 text-slate-400">
            &copy; 2026 NetworkCheck Nigeria. Built for the Telecom Solutions Hackathon.
          </div>
        </div>
      </div>
    </footer>
  );
};
