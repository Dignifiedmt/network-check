import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Lock,
  Calendar,
  Layers,
} from 'lucide-react';
import { CommunityReport } from '../types';
import {
  downloadNccComplianceCsv,
  generateNccCompliancePdf,
  NccComplianceMetadata,
} from '../utils/nccComplianceExport';

interface NccComplianceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredReports: CommunityReport[];
  allReports: CommunityReport[];
  currentLgaName?: string;
}

export const NccComplianceExportModal: React.FC<NccComplianceExportModalProps> = ({
  isOpen,
  onClose,
  filteredReports,
  allReports,
  currentLgaName,
}) => {
  const [useAllReports, setUseAllReports] = useState(false);
  const [reportingQuarter, setReportingQuarter] = useState('Q1 2026 Audit Window');
  const [auditJurisdiction, setAuditJurisdiction] = useState(
    currentLgaName ? `${currentLgaName} LGA, Kaduna State` : 'Kaduna State (All Monitored LGAs)'
  );
  const [complianceOfficer, setComplianceOfficer] = useState(
    'Director of Telecommunications Standards & Civic QoS Liaison'
  );
  const [commissionRef, setCommissionRef] = useState(
    `NCC-QOS-2026-KD-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetReports = useAllReports ? allReports : filteredReports;

  const handleDownloadCsv = () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      downloadNccComplianceCsv(targetReports, {
        reportingQuarter,
        auditJurisdiction,
        complianceOfficer,
        commissionRef,
      });
      setExportSuccess(`NCC Standardized CSV downloaded successfully (${targetReports.length} records).`);
    } catch (err: any) {
      alert('CSV Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      generateNccCompliancePdf(targetReports, {
        reportingQuarter,
        auditJurisdiction,
        complianceOfficer,
        commissionRef,
      });
      setExportSuccess(`Official NCC Compliance PDF Dossier downloaded successfully (${targetReports.length} records).`);
    } catch (err: any) {
      alert('PDF Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white border border-emerald-500/40 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  NCC Compliance Regulatory Export
                </h3>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] bg-emerald-800 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-700">
                  STANDARD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-300 line-clamp-1">
                Generate audit-ready community connectivity reports for the Nigerian Communications Commission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition shrink-0 ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Options vs Document Preview */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-2.5 pb-2 bg-slate-100 border-b border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'options'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Export Configuration
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dossier Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs sm:text-sm flex-1 bg-slate-50/50">
          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}

          {activeTab === 'options' ? (
            <div className="space-y-4">
              {/* Compliance Scope Selector */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  1. Report Dataset Scope
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setUseAllReports(false)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      !useAllReports
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      checked={!useAllReports}
                      onChange={() => setUseAllReports(false)}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-bold">Filtered Reports Only</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        Export current table view ({filteredReports.length} records)
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setUseAllReports(true)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      useAllReports
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      checked={useAllReports}
                      onChange={() => setUseAllReports(true)}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-bold">Entire Community Archive</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        All state records ({allReports.length} records)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Regulatory Metadata Configuration */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  2. Official NCC Regulatory Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Commission Reference Docket
                    </label>
                    <input
                      type="text"
                      value={commissionRef}
                      onChange={e => setCommissionRef(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reporting Cycle / Window
                    </label>
                    <select
                      value={reportingQuarter}
                      onChange={e => setReportingQuarter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                    >
                      <option value="Q1 2026 Audit Window">Q1 2026 Technical Audit Window</option>
                      <option value="Q2 2026 Compliance Cycle">Q2 2026 Compliance Cycle</option>
                      <option value="March 2026 Monthly Summary">March 2026 Monthly Summary</option>
                      <option value="Urgent Outage Investigation">Special Outage Investigation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Audit Jurisdiction Area
                    </label>
                    <input
                      type="text"
                      value={auditJurisdiction}
                      onChange={e => setAuditJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Authorized Compliance Officer
                    </label>
                    <input
                      type="text"
                      value={complianceOfficer}
                      onChange={e => setComplianceOfficer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Data Integrity & NDPR Certificate Pill */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <span className="font-bold">Standardized NCC Baseline Compliance Guarantee:</span>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    Export files automatically map citizen incident telemetry into official NCC Quality of Service parameter categories (Voice Call Retention, Call Setup Success Rate, Data Latency/Throughput, and Base Station Availability). All citizen MSISDNs are protected with salted SHA-256 HMAC tokens in full compliance with the Nigeria Data Protection Act (NDPA).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Document Live Visual Preview */
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md space-y-4 font-sans text-xs">
              {/* Fake PDF Header */}
              <div className="bg-emerald-800 text-white p-4 rounded-xl text-center space-y-1">
                <div className="text-[11px] font-bold tracking-widest text-emerald-200 uppercase">
                  Federal Republic of Nigeria
                </div>
                <h4 className="text-sm font-extrabold tracking-tight">
                  NIGERIAN COMMUNICATIONS COMMISSION (NCC)
                </h4>
                <div className="text-[10px] text-emerald-100">
                  TECHNICAL STANDARDS &amp; QUALITY OF SERVICE (QoS) COMMUNITY EVIDENCE DOSSIER
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500">Commission Docket:</span>{' '}
                  <strong className="font-mono text-slate-800">{commissionRef}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Jurisdiction:</span>{' '}
                  <strong className="text-slate-800">{auditJurisdiction}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Audit Period:</span>{' '}
                  <strong className="text-slate-800">{reportingQuarter}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Total Documented:</span>{' '}
                  <strong className="text-emerald-700">{targetReports.length} Community Incidents</strong>
                </div>
              </div>

              {/* Sample Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-white text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Ref</th>
                      <th className="px-3 py-2">LGA</th>
                      <th className="px-3 py-2">Operator</th>
                      <th className="px-3 py-2">QoS Category</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {targetReports.slice(0, 4).map(r => (
                      <tr key={r.id}>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-800">{r.reference}</td>
                        <td className="px-3 py-1.5">{r.lga_name || 'Chikun'}</td>
                        <td className="px-3 py-1.5 font-semibold">{r.operator_name || 'MTN'}</td>
                        <td className="px-3 py-1.5 capitalize">{r.issue_type.replace('_', ' ')}</td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              r.ai_severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.ai_severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-slate-400">NDPR Masked</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-400 text-center italic">
                Showing top 4 sample entries of {targetReports.length} total records included in final dossier.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Ready for export: <strong>{targetReports.length}</strong> incident logs</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition text-center"
            >
              Cancel
            </button>

            {/* Standardized CSV Export Button */}
            <button
              onClick={handleDownloadCsv}
              disabled={isExporting || targetReports.length === 0}
              className="px-4 py-2 bg-white border border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Standardized CSV</span>
            </button>

            {/* Official PDF Export Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting || targetReports.length === 0}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>Official NCC PDF Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
