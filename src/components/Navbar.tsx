import React, { useState } from 'react';
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
  X,
  AlertCircle,
  Landmark,
} from 'lucide-react';
import { getAdminToken, clearAdminToken } from '../services/apiClient';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenUssd: () => void;
  onOpenSms: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenUssd,
  onOpenSms,
  isAdmin = false,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const allNavLinks = [
    { id: 'landing', label: 'Home', icon: Signal },
    { id: 'mobile-users', label: 'Mobile Hub', icon: Smartphone },
    { id: 'dashboard', label: 'Overview', icon: BarChart3, adminOnly: true },
    { id: 'banks', label: 'Bank Networks', icon: Landmark },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'areas', label: 'Area Analysis', icon: MapPin },
    { id: 'baselines', label: 'Baseline Data', icon: Layers },
    { id: 'sources', label: 'Data Sources', icon: Database },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
  ];

  const navLinks = allNavLinks.filter(link => !link.adminOnly || effectiveIsAdmin);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Navbar */}
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 shrink-0">
              <Signal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Network<span className="text-emerald-700">Check</span>
                </span>
                <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                  NG
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden md:block">
                USSD/SMS Connectivity Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.id === 'dashboard' && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: USSD Dial & SMS Console */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenUssd}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              title="Launch Feature Phone Simulator (*384*20220#)"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dial *384*20220#</span>
              <span className="sm:hidden">*384*20220#</span>
            </button>

            <button
              onClick={onOpenSms}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
              title="Inspect Dispatched SMS Messages"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>SMS Outbox</span>
            </button>

            {token ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Log out of Admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs rounded-lg transition border ${
                  currentTab === 'login'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
                title="Admin Login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin Login</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{link.label}</span>
                {link.id === 'dashboard' && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenUssd();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs hover:bg-emerald-800 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Dial *384*20220# (USSD)</span>
            </button>
            <button
              onClick={() => {
                onOpenSms();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition border border-slate-200"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>SMS Gateway (Shortcode 22220)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
