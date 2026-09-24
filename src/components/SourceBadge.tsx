import React from 'react';
import { ShieldCheck, Users, AlertTriangle } from 'lucide-react';

interface SourceBadgeProps {
  sourceType: 'Official' | 'Community' | 'Demo' | string;
  sourceName?: string;
  lastUpdated?: string;
  count?: number;
  compact?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  sourceType,
  sourceName,
  lastUpdated,
  count,
  compact = false,
}) => {
  if (sourceType === 'Official') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'}`}>
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold">Source: Official NCC dataset</span>
          {lastUpdated && (
            <span className="text-emerald-700/80 font-normal">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (sourceType === 'Community') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md font-medium text-blue-800 bg-blue-50 border border-blue-300 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'}`}>
        <Users className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold">Source: Community reports</span>
          {count !== undefined && (
            <span className="text-blue-700/80 font-normal">
              Based on {count} {count === 1 ? 'report' : 'reports'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Demo / Test Data
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md font-medium text-amber-900 bg-amber-50 border border-amber-300 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'}`}>
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="font-bold tracking-wide">DEMO DATA</span>
        <span className="text-amber-800 font-normal text-[11px] sm:text-xs">
          not real network measurements
        </span>
      </div>
    </div>
  );
};
