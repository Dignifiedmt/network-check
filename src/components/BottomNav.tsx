import React from 'react';
import {
  Signal,
  Smartphone,
  Landmark,
  BarChart3,
  FileText,
  Phone,
  Layers,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenUssd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenUssd,
}) => {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Signal },
    { id: 'mobile-users', label: 'Mobile Hub', icon: Smartphone, highlight: true },
    { id: 'banks', label: 'Banks', icon: Landmark },
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 px-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[56px] ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.highlight && !isActive && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-emerald-800' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Quick Dial Action Tab */}
        <button
          onClick={onOpenUssd}
          className="flex flex-col items-center justify-center py-1 px-2 text-emerald-800 hover:text-emerald-900 transition min-w-[56px]"
          title="Dial USSD *384*20220#"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
            Dial
          </span>
        </button>
      </div>
    </div>
  );
};
