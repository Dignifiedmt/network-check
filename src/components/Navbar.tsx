import React from 'react';
import {
  Signal,
  Smartphone,
  Phone,
  BarChart3,
  FileText,
  MapPin,
  Database,
  Sparkles,
  Layers,
  Lock,
  LogOut,
  Mail,
  Menu,
  Landmark,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { getAdminToken, clearAdminToken } from '../services/apiClient';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenUssd: () => void;
  onOpenSms: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

const TAB_TITLES: Record<string, { label: string; icon: React.ElementType; category: string }> = {
  landing: { label: 'Portal Overview', icon: Signal, category: 'NetworkCheck NG' },
  'mobile-users': { label: 'Mobile Offline Hub', icon: Smartphone, category: 'Citizen Tools' },
  banks: { label: 'Bank USSD & Core Banking', icon: Landmark, category: 'Financial Access' },
  reports: { label: 'Citizen Incident Reports', icon: FileText, category: 'Community Intel' },
  areas: { label: 'Area QoS Benchmark', icon: MapPin, category: 'Geographic Intelligence' },
  dashboard: { label: 'Admin Telemetry Overview', icon: BarChart3, category: 'Operations' },
  baselines: { label: 'NCC Baseline Data', icon: Layers, category: 'Regulatory Standards' },
  sources: { label: 'Data Sources & Audits', icon: Database, category: 'Compliance' },
  'ai-insights': { label: 'Gemini AI Synthesis', icon: Sparkles, category: 'Intelligence' },
  login: { label: 'Administrator Portal', icon: Lock, category: 'System Access' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenUssd,
  onOpenSms,
  isAdmin = false,
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const token = getAdminToken();
  const effectiveIsAdmin = isAdmin || !!token;

  const currentTabMeta = TAB_TITLES[currentTab] || {
    label: 'Overview',
    icon: Signal,
    category: 'NetworkCheck',
  };
  const CurrentIcon = currentTabMeta.icon;

  const handleLogout = () => {
    clearAdminToken();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Sidebar Collapse/Expand Toggle + Current Module Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidenav Toggle Button */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200/80"
                title={sidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-emerald-700" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            {onOpenMobileSidebar && (
              <button
                onClick={onOpenMobileSidebar}
                className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200/80"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
            )}

            {/* Mobile Brand Logo (Visible only on mobile screens where desktop sidebar is hidden) */}
            <div
              className="lg:hidden flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => setCurrentTab('landing')}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Signal className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                Network<span className="text-emerald-700">Check</span>
              </span>
            </div>

            {/* Desktop Current Location & Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2.5 pl-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                <CurrentIcon className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium leading-none">
                  <span>{currentTabMeta.category}</span>
                  <span>/</span>
                </div>
                <h1 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-normal truncate">
                  {currentTabMeta.label}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Quick Telecom Action Center */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Telecom Gateway Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-semibold border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>USSD/SMS Live</span>
            </div>

            {/* Launch Feature Phone USSD Simulator */}
            <button
              onClick={onOpenUssd}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/10 transition"
              title="Launch Feature Phone Simulator (*384*20220#)"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dial *384*20220#</span>
              <span className="sm:hidden text-[11px] font-bold">*384*20220#</span>
            </button>

            {/* SMS Outbox Inspector */}
            <button
              onClick={onOpenSms}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200/90 shadow-2xs"
              title="Inspect Dispatched SMS Messages via Africa's Talking"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>SMS Outbox</span>
            </button>

            {/* Admin State / Login Button */}
            {effectiveIsAdmin ? (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200/60"
                title="Log out of Admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition border ${
                  currentTab === 'login'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 border-slate-200/90'
                }`}
                title="Admin Authentication"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
