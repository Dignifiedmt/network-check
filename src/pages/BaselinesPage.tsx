import React, { useState, useEffect } from 'react';
import {
  Layers,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { fetchBaselines, validateCsvContent, importCsvContent, getAdminToken } from '../services/apiClient';
import { BaselineItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';

export const BaselinesPage: React.FC = () => {
  const [baselines, setBaselines] = useState<BaselineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState(
`state,lga,operator,voice_rating,data_rating,sms_rating,source_name,source_type,source_url,dataset_version,last_updated
Kaduna,Chikun,MTN,Good,Good,Good,NCC Q1 Official Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-15
Kaduna,Zaria,Airtel,Fair,Good,Good,NCC Q1 Official Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-15
Kaduna,Igabi,Glo,Fair,Poor,Fair,NCC Q1 Official Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-15`
  );
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const token = getAdminToken();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await fetchBaselines();
      setBaselines(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateCsv = async () => {
    setValidating(true);
    setValidationResult(null);
    setImportSuccessMsg(null);
    try {
      const res = await validateCsvContent(csvText);
      setValidationResult(res.validation);
    } catch (err: any) {
      alert('CSV Validation failed: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult?.canImport) return;
    setImporting(true);
    try {
      const res = await importCsvContent(csvText);
      if (res.success) {
        setImportSuccessMsg(`Successfully imported ${res.importedCount} new and updated ${res.updatedCount} baseline records.`);
        loadData();
      }
    } catch (err: any) {
      alert('Import execution failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Baseline Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified regulatory benchmarks (NCC Bulletins) mapped to Nigerian LGAs and operators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
            title="Reload baseline table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Baseline CSV</span>
          </button>
        </div>
      </div>

      {/* Baseline Data: Mobile Cards (<md) & Desktop Table (>=md) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {baselines.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No baseline records found.</div>
          ) : (
            baselines.map(b => (
              <div key={b.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">
                    LGA #{b.lga_id} &bull; Operator #{b.operator_id}
                  </div>
                  <SourceBadge sourceType={b.source_type} compact />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Voice</span>
                    <span
                      className={`font-bold text-[11px] ${
                        b.voice_rating === 'Good'
                          ? 'text-emerald-700'
                          : b.voice_rating === 'Fair'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {b.voice_rating}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Data</span>
                    <span
                      className={`font-bold text-[11px] ${
                        b.data_rating === 'Good'
                          ? 'text-emerald-700'
                          : b.data_rating === 'Fair'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {b.data_rating}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">SMS</span>
                    <span
                      className={`font-bold text-[11px] ${
                        b.sms_rating === 'Good' ? 'text-emerald-700' : 'text-blue-700'
                      }`}
                    >
                      {b.sms_rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="font-mono">{b.dataset_version}</span>
                  <span>Updated {b.last_updated}</span>
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
                <th className="px-5 py-3">LGA / State</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Voice Rating</th>
                <th className="px-4 py-3">Data Rating</th>
                <th className="px-4 py-3">SMS Rating</th>
                <th className="px-4 py-3">Dataset Version</th>
                <th className="px-4 py-3">Data Source Badge</th>
                <th className="px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {baselines.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    LGA ID #{b.lga_id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Operator ID #{b.operator_id}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        b.voice_rating === 'Good'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.voice_rating === 'Fair'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.voice_rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        b.data_rating === 'Good'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.data_rating === 'Fair'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.data_rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        b.sms_rating === 'Good'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {b.sms_rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {b.dataset_version}
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge sourceType={b.source_type} compact />
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {b.last_updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">Import Regulatory Baseline CSV</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {!token && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Admin Token Notice:</strong> You are testing in Demo Mode. To write directly to persistent production tables, ensure you have logged in via Admin.
                  </span>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed text-xs">
                Paste raw CSV data or load from official NCC audit exports. Mandatory schema:
                <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px] block mt-1">
                  state,lga,operator,voice_rating,data_rating,sms_rating,source_name,source_type,source_url,dataset_version,last_updated
                </code>
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">CSV Content</label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 leading-relaxed"
                />
              </div>

              {/* Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    validationResult.canImport
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      {validationResult.canImport ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span>
                        Validation {validationResult.canImport ? 'Passed' : 'Failed'}: {validationResult.validRowsCount} valid, {validationResult.errorRowsCount} invalid
                      </span>
                    </span>
                  </div>

                  {/* Row-Level Errors */}
                  {validationResult.errorRowsCount > 0 && (
                    <div className="space-y-1.5 text-xs">
                      {validationResult.rows
                        .filter((r: any) => !r.isValid)
                        .map((r: any) => (
                          <div key={r.rowNumber} className="bg-white/80 p-2 rounded border border-red-200">
                            <strong>Row {r.rowNumber}:</strong> {r.errors.join('; ')}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidateCsv}
                  disabled={validating}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
                >
                  {validating ? 'Validating...' : 'Validate Rows'}
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={!validationResult?.canImport || importing}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 disabled:opacity-50 transition"
                >
                  {importing ? 'Importing...' : 'Confirm & Import Validated Rows'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
