import React, { useState, useEffect } from 'react';
import { MapPin, BarChart3, AlertCircle, RefreshCw, Signal, CheckCircle2 } from 'lucide-react';
import { fetchAreaAnalytics, fetchBaselineComparison } from '../services/apiClient';
import { AreaAnalyticItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';

export const AreaAnalysisPage: React.FC = () => {
  const [areas, setAreas] = useState<AreaAnalyticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(1); // Chikun default
  const [areaComparison, setAreaComparison] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await fetchAreaAnalytics();
      setAreas(items);
      if (items.length > 0) {
        loadComparisonForArea(items[0].lgaId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonForArea = async (lgaId: number) => {
    setSelectedAreaId(lgaId);
    try {
      const comp = await fetchBaselineComparison(1, lgaId);
      setAreaComparison(comp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Geographic Area Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            LGA-level connectivity performance, cluster incidents, and cross-operator metrics.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 self-start bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
          title="Reload area telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* LGA Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {areas.map(area => {
          const isSelected = selectedAreaId === area.lgaId;
          const topIssueEntry = Object.entries(area.issueBreakdown || {}).sort((a, b) => b[1] - a[1])[0];
          const topOpEntry = Object.entries(area.operatorBreakdown || {}).sort((a, b) => b[1] - a[1])[0];

          return (
            <div
              key={area.lgaId}
              onClick={() => loadComparisonForArea(area.lgaId)}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-slate-900 text-base">{area.lgaName}</h3>
                  </div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {area.reportCount} reports
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Leading Incident:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {topIssueEntry ? topIssueEntry[0].replace('_', ' ') : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Most Reported Operator:</span>
                    <span className="font-semibold text-slate-800">
                      {topOpEntry ? topOpEntry[0] : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">State: {area.stateName}</span>
                <span className="text-emerald-700 font-bold">
                  {isSelected ? 'Viewing Detailed Baselines &rarr;' : 'Click to inspect'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Area Inspector */}
      {areaComparison && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                LGA Baseline Comparison Detail
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {areaComparison.lga?.name.toUpperCase()} LGA, {areaComparison.state?.name}
              </h2>
            </div>
            <SourceBadge
              sourceType={areaComparison.primarySource?.type}
              sourceName={areaComparison.primarySource?.name}
              lastUpdated={areaComparison.primarySource?.lastUpdated}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {areaComparison.operators?.map((item: any) => (
              <div
                key={item.operator.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                    <span>{item.operator.name}</span>
                    <span className="text-xs font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {item.operator.code}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Voice Rating:</span>
                      <strong className="text-slate-800">{item.baseline?.voice_rating || 'Fair'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data Rating:</span>
                      <strong className="text-slate-800">{item.baseline?.data_rating || 'Fair'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SMS Rating:</span>
                      <strong className="text-slate-800">{item.baseline?.sms_rating || 'Good'}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                  <span>Community Reports:</span>
                  <strong>{item.communityStats?.totalReports || 0}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
