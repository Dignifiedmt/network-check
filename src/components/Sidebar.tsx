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
  ChevronLeft,
  ChevronRight,
  Landmark,
  X,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getAdminToken, clearAdminToken } from '../services/apiClient';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
  badgeColor?: string;
  category: 'core' | 'analytics';
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenUssd: () => void;
  onOpenSms: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenUssd,
  onOpenSms,
  isAdmin = false,
  onLogout,
}) => {
  const token = getAdminToken();
  const effectiveIsAdmin = isAdmin || !!token;

  const handleLogout = () => {
    clearAdminToken();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const navItems: NavItem[] = [
    // Core Community Services
    {
      id: 'landing',
      label: 'Home & Portal',
      shortLabel: 'Home',
      icon: Signal,
      category: 'core',
    },
    {
      id: 'mobile-users',
      label: 'Mobile Hub (SMS/USSD)',
      shortLabel: 'Mobile',
      icon: Smartphone,
      badge: 'Offline',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      category: 'core',
    },
    {
      id: 'banks',
      label: 'Bank USSD & Core',
      shortLabel: 'Banks',
      icon: Landmark,
      badge: '24 Banks',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      category: 'core',
    },
    {
      id: 'reports',
      label: 'Community Reports',
      shortLabel: 'Reports',
      icon: FileText,
      badge: '9 Live',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      category: 'core',
    },
    {
      id: 'areas',
      label: 'Area QoS Benchmark',
      shortLabel: 'Areas',
      icon: MapPin,
      category: 'core',
    },

    // Analytics & Intelligence
    {
      id: 'dashboard',
      label: 'Admin Overview',
      shortLabel: 'Overview',
      icon: BarChart3,
      adminOnly: true,
      badge: 'Admin',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      category: 'analytics',
    },
    {
      id: 'baselines',
      label: 'NCC Baseline QoS',
      shortLabel: 'Baselines',
      icon: Layers,
      badge: 'NCC 2026',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      category: 'analytics',
    },
    {
      id: 'sources',
      label: 'Data Sources & Audits',
      shortLabel: 'Sources',
      icon: Database,
      category: 'analytics',
    },
    {
      id: 'ai-insights',
      label: 'Gemini AI Insights',
      shortLabel: 'AI Insights',
      icon: Sparkles,
      badge: 'AI Flash',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      category: 'analytics',
    },
  ];

  const visibleNav = navItems.filter(item => !item.adminOnly || effectiveIsAdmin);
  const coreItems = visibleNav.filter(item => item.category === 'core');
  const analyticsItems = visibleNav.filter(item => item.category === 'analytics');

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-3">
      {!collapsed && (
        <div className="flex items-center justify-between px-2.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
        </div>
      )}
      <div className="space-y-0.5">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileOpen(false);
              }}
              title={collapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ''}` : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              } ${collapsed ? 'justify-center px-1.5' : ''}`}
            >
              <Icon
                className={`shrink-0 transition-transform ${
                  collapsed ? 'w-5 h-5' : 'w-4 h-4'
                } ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />

              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                        isActive
                          ? 'bg-emerald-800/90 text-emerald-100 border-emerald-600'
                          : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Floating Tooltip when Collapsed */}
              {collapsed && (
                <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Sidenav Header with Brand & Collapse toggle */}
      <div
        className={`flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 shrink-0 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button
          onClick={() => {
            setCurrentTab('landing');
            setMobileOpen(false);
          }}
          className={`flex items-center gap-2 text-left transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="NetworkCheck NG Navigation"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-emerald-500/20">
            <Signal className="w-4 h-4 text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-xs tracking-tight text-slate-900 truncate block">
                Network<span className="text-emerald-700">Check</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Navigation Hub
              </span>
            </div>
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title={collapsed ? 'Expand side navigation' : 'Collapse side navigation'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {renderNavGroup('Community & Services', coreItems)}
        {renderNavGroup('QoS & Intelligence', analyticsItems)}

        {/* Live Recent Updates Widget (Expanded view) */}
        {!collapsed && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-600" />
                <span>Live Recent Intel</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Recent Incident Feed Card */}
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 text-[11px]">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">
                    Chikun / Sabon Tasha
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    MTN 4G fiber cut restoration ongoing
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Today 08:14</span>
                </span>
                <span className="text-emerald-700 font-semibold">9 Reports Today</span>
              </div>
            </div>

            {/* Quick Network Pulse */}
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800 text-[10px]">
                <span>Operator Health Pulse</span>
                <span className="text-emerald-700">NCC Q3 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-emerald-100">
                  <span className="font-bold text-amber-700">MTN</span>
                  <span className="text-emerald-700 font-bold">91%</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-emerald-100">
                  <span className="font-bold text-rose-600">Airtel</span>
                  <span className="text-emerald-700 font-bold">86%</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-700">Glo</span>
                  <span className="text-slate-600 font-semibold">75%</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-800">9mobile</span>
                  <span className="text-slate-600 font-semibold">68%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidenav Footer Actions */}
      <div className="pt-3 mt-2 border-t border-slate-100 space-y-1.5 shrink-0">
        <button
          onClick={() => {
            onOpenUssd();
            setMobileOpen(false);
          }}
          title={collapsed ? 'Dial *384*20220# (Feature Phone Simulator)' : undefined}
          className={`w-full flex items-center gap-2 px-2.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition group relative ${
            collapsed ? 'justify-center px-1' : ''
          }`}
        >
          <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
          {!collapsed && <span className="truncate">Dial *384*20220#</span>}
          {collapsed && (
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
              Dial *384*20220#
            </div>
          )}
        </button>

        <button
          onClick={() => {
            onOpenSms();
            setMobileOpen(false);
          }}
          title={collapsed ? 'SMS Outbox & Gateway Logs' : undefined}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition group relative ${
            collapsed ? 'justify-center px-1' : ''
          }`}
        >
          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          {!collapsed && <span className="truncate">SMS Outbox</span>}
          {collapsed && (
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
              SMS Gateway Outbox
            </div>
          )}
        </button>

        {/* Admin Login / Logout */}
        {effectiveIsAdmin ? (
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout of Admin Session' : undefined}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition group relative ${
              collapsed ? 'justify-center px-1' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            {!collapsed && <span>Admin Logout</span>}
            {collapsed && (
              <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-rose-950 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Admin Logout
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              setCurrentTab('login');
              setMobileOpen(false);
            }}
            title={collapsed ? 'Admin Login' : undefined}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold ${
              currentTab === 'login'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            } rounded-xl transition group relative ${
              collapsed ? 'justify-center px-1' : ''
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            {!collapsed && <span>Admin Login</span>}
            {collapsed && (
              <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Admin Login
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidenav Card - Seamlessly integrated INSIDE the main container */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out sticky top-20 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide over with backdrop) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 p-4 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
