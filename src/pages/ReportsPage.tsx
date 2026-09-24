import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Sparkles,
  Download,
  AlertTriangle,
  Users,
  FileText,
  FileSpreadsheet,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { fetchReports, fetchLgas, fetchOperators } from '../services/apiClient';
import { CommunityReport, LgaItem, OperatorItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';
import { NccComplianceExportModal } from '../components/NccComplianceExportModal';
import {
  downloadNccComplianceCsv,
  generateNccCompliancePdf,
} from '../utils/nccComplianceExport';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [allReports, setAllReports] = useState<CommunityReport[]>([]);
  const [lgas, setLgas] = useState<LgaItem[]>([]);
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLgaId, setFilterLgaId] = useState<string>('');
  const [filterOperatorId, setFilterOperatorId] = useState<string>('');
  const [filterIssue, setFilterIssue] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');

  // Selected report detail modal
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  // NCC Compliance Export Modal state
  const [isNccExportModalOpen, setIsNccExportModalOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, allReportsData, lgasData, operatorsData] = await Promise.all([
        fetchReports({
          lgaId: filterLgaId ? parseInt(filterLgaId, 10) : undefined,
          operatorId: filterOperatorId ? parseInt(filterOperatorId, 10) : undefined,
          issueType: filterIssue || undefined,
          aiSeverity: filterSeverity || undefined,
          source: filterSource || undefined,
        }),
        fetchReports(), // Unfiltered archive for compliance baseline
        fetchLgas(1), // Kaduna LGAs default
        fetchOperators(),
      ]);
      setReports(reportsData);
      setAllReports(allReportsData);
      setLgas(lgasData);
      setOperators(operatorsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterLgaId, filterOperatorId, filterIssue, filterSeverity, filterSource]);

  // Client-side search filtering by reference or description
  const filteredReports = reports.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.reference.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.lga_name && r.lga_name.toLowerCase().includes(term)) ||
      (r.operator_name && r.operator_name.toLowerCase().includes(term))
    );
  });

  const exportStandardCsv = () => {
    downloadNccComplianceCsv(filteredReports);
  };

  const exportStandardPdf = () => {
    generateNccCompliancePdf(filteredReports);
  };

  const activeLgaName = lgas.find(l => l.id.toString() === filterLgaId)?.name;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Community Reports Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and inspect incoming citizen reports with strict data source badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
            title="Reload reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* NCC Compliance Export Hub */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs">
              <button
                onClick={() => setIsNccExportModalOpen(true)}
                disabled={filteredReports.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-l-xl text-xs font-bold transition border-r border-emerald-600 disabled:opacity-50"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>NCC Compliance Export</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                  {filteredReports.length}
                </span>
              </button>

              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={filteredReports.length === 0}
                className="px-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-r-xl transition text-xs disabled:opacity-50"
                title="More NCC Export Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Export Dropdown */}
            {showExportDropdown && (
              <div
                className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 text-xs"
                onMouseLeave={() => setShowExportDropdown(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Standardized NCC Formats
                </div>

                <button
                  onClick={() => {
                    exportStandardCsv();
                    setShowExportDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>Standardized NCC CSV</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Formal QoS columns with integrity hash
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportStandardPdf();
                    setShowExportDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>Official NCC PDF Dossier</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Print-ready regulatory audit report
                    </div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsNccExportModalOpen(true);
                    setShowExportDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Configure Full Compliance Dossier...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference (NC-...), keyword, or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
            />
          </div>

          {/* Source Filter (Official / Community / Demo) */}
          <div className="w-full md:w-44">
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
            >
              <option value="">All Data Sources</option>
              <option value="Community">Source: Community</option>
              <option value="Official">Source: Official NCC</option>
              <option value="Demo">Source: Demo / Test</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* LGA */}
          <div>
            <select
              value={filterLgaId}
              onChange={e => setFilterLgaId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">All LGAs (Kaduna)</option>
              {lgas.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <select
              value={filterOperatorId}
              onChange={e => setFilterOperatorId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">All Operators</option>
              {operators.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Issue */}
          <div>
            <select
              value={filterIssue}
              onChange={e => setFilterIssue(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">All Issue Categories</option>
              <option value="slow_data">Slow Data</option>
              <option value="no_network">No Network</option>
              <option value="dropped_calls">Dropped Calls</option>
              <option value="call_connect_fail">Call Connect Fail</option>
              <option value="sms_problem">SMS Problem</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">All Severities</option>
              <option value="high">High Severity</option>
              <option value="moderate">Moderate Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Data: Mobile Cards (<md) and Desktop Table (>=md) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile Cards List (<md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No community reports found matching active criteria.
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {report.reference}
                    </span>
                    {report.duplicate_flag && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                        DUP
                      </span>
                    )}
                  </div>
                  <SourceBadge sourceType={report.source} compact />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{report.lga_name}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({report.state_name || 'Kaduna'})</span>
                  </div>
                  <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                    {report.operator_name}
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
                    {report.ai_severity} severity
                  </span>
                </div>

                {report.description && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                    "{report.description}"
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">{report.reported_time || 'Recent'}</span>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs transition flex items-center gap-1 border border-emerald-200"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>=md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-4 py-3">Area (LGA)</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Data Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No community reports found matching active criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">
                      {report.reference}
                      {report.duplicate_flag && (
                        <span className="ml-1 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-sans font-bold">
                          DUP
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{report.lga_name}</div>
                      <div className="text-[10px] text-slate-400">{report.state_name}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {report.operator_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-slate-700">
                        {report.issue_type.replace('_', ' ')}
                      </span>
                      {report.description && (
                        <span className="block text-[11px] text-slate-400 truncate max-w-[200px]">
                          "{report.description}"
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <SourceBadge sourceType={report.source} compact />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {report.status}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {report.reported_time || 'Recent'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> total records
            </span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-emerald-700 font-medium">NDPR Privacy Mask: Applied</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNccExportModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export as NCC Compliance Dossier (CSV/PDF) &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Report #{selectedReport.reference}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({selectedReport.status})
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedReport.lga_name} LGA &bull; {selectedReport.operator_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Data Integrity Attribution:</span>
                <SourceBadge sourceType={selectedReport.source} />
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Citizen Narrative:</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800">
                  {selectedReport.description || 'No free-text note provided (USSD numeric report).'}
                </div>
              </div>

              {/* AI Classification Insights Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Server-Side Gemini Multilingual Triage</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-emerald-700">Detected Language:</span>{' '}
                    <strong>{selectedReport.language || 'English'}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700">AI Category:</span>{' '}
                    <strong>{selectedReport.ai_category || selectedReport.issue_type}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700">Severity Assessment:</span>{' '}
                    <strong className="capitalize">{selectedReport.ai_severity}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700">Duplicate Outage:</span>{' '}
                    <strong>{selectedReport.duplicate_flag ? 'Yes (Detected)' : 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Privacy Shield Info */}
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                <span>Citizen Phone Hash: </span>
                <code className="font-mono text-slate-700">{selectedReport.phone_hash.slice(0, 16)}... (SHA-256)</code>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NCC Baseline Compliance Export Modal */}
      <NccComplianceExportModal
        isOpen={isNccExportModalOpen}
        onClose={() => setIsNccExportModalOpen(false)}
        filteredReports={filteredReports}
        allReports={allReports}
        currentLgaName={activeLgaName}
      />
    </div>
  );
};
