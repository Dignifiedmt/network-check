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
  ExternalLink,
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
  category: 'core' | 'analytics' | 'system';
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
      label: 'Bank USSD Codes',
      shortLabel: 'Banks',
      icon: Landmark,
      badge: 'Banking',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      category: 'core',
    },
    {
      id: 'reports',
      label: 'Community Reports',
      shortLabel: 'Reports',
      icon: FileText,
      category: 'core',
    },
    {
      id: 'areas',
      label: 'Area QoS Analysis',
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
      badge: 'AI',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      category: 'analytics',
    },
  ];

  const visibleNav = navItems.filter(item => !item.adminOnly || effectiveIsAdmin);

  const coreItems = visibleNav.filter(item => item.category === 'core');
  const analyticsItems = visibleNav.filter(item => item.category === 'analytics');

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`shrink-0 transition-transform duration-200 ${
                  collapsed ? 'w-5 h-5' : 'w-4 h-4'
                } ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />

              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-700/80 text-white border-emerald-500'
                          : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Floating Tooltip when Collapsed on Desktop */}
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 shadow-xs select-none">
      {/* Sidebar Header / Brand */}
      <div
        className={`flex items-center gap-3 p-4 border-b border-slate-200/80 shrink-0 ${
          collapsed ? 'justify-center p-3' : 'justify-between'
        }`}
      >
        <button
          onClick={() => {
            setCurrentTab('landing');
            setMobileOpen(false);
          }}
          className={`flex items-center gap-2.5 text-left transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="NetworkCheck Nigeria"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 shrink-0 ring-2 ring-emerald-500/20">
            <Signal className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 truncate">
                  Network<span className="text-emerald-700">Check</span>
                </span>
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded border border-slate-200 uppercase">
                  NG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Telco & Community Intel
              </p>
            </div>
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle icon button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title={collapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
        {renderNavGroup('Community & Offline', coreItems)}
        {renderNavGroup('QoS & Intelligence', analyticsItems)}
      </div>

      {/* Bottom Telecom Action Buttons & Account */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2 shrink-0">
        {/* USSD Simulator Trigger */}
        <button
          onClick={() => {
            onOpenUssd();
            setMobileOpen(false);
          }}
          title={collapsed ? 'Dial *384*20220# (USSD Simulator)' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/10 transition group relative ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Phone className="w-4 h-4 shrink-0 text-emerald-200 group-hover:scale-110 transition-transform" />
          {!collapsed && (
            <span className="truncate">Dial *384*20220#</span>
          )}
          {collapsed && (
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
              Dial *384*20220# (Feature Phone Simulator)
            </div>
          )}
        </button>

        {/* SMS Outbox Trigger */}
        <button
          onClick={() => {
            onOpenSms();
            setMobileOpen(false);
          }}
          title={collapsed ? 'SMS Outbox & Gateway Logs' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition group relative ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Mail className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-emerald-600 transition-colors" />
          {!collapsed && (
            <span className="truncate">SMS Gateway Outbox</span>
          )}
          {collapsed && (
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
              SMS Gateway Outbox (22220)
            </div>
          )}
        </button>

        {/* Admin Login / Logout */}
        <div className="pt-2 border-t border-slate-200/60">
          {effectiveIsAdmin ? (
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout of Admin Session' : undefined}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition group relative ${
                collapsed ? 'justify-center px-2' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
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
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold ${
                currentTab === 'login'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              } rounded-xl transition group relative ${
                collapsed ? 'justify-center px-2' : ''
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
              {!collapsed && <span>Admin Portal</span>}
              {collapsed && (
                <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                  Admin Portal Login
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidenav (Fixed or Sticky) */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen shrink-0 z-30 transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
