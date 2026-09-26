import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { ReportsPage } from './pages/ReportsPage';
import { AreaAnalysisPage } from './pages/AreaAnalysisPage';
import { BaselinesPage } from './pages/BaselinesPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { LoginPage } from './pages/LoginPage';
import { BankNetworkPage } from './pages/BankNetworkPage';
import { MobileHubPage } from './pages/MobileHubPage';
import { UssdSimulatorModal } from './components/UssdSimulatorModal';
import { SmsOutboxModal } from './components/SmsOutboxModal';
import { getAdminToken, clearAdminToken } from './services/apiClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isUssdOpen, setIsUssdOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!getAdminToken());

  // Collapsible desktop sidenav state (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('networkcheck_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Keyboard shortcut (Ctrl+[ or Cmd+[) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        setSidebarCollapsed(prev => {
          const next = !prev;
          try {
            localStorage.setItem('networkcheck_sidebar_collapsed', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('networkcheck_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAdmin(false);
    setCurrentTab('landing');
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16 lg:pb-0">
      {/* Top Header Navbar spanning full width */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUssd={() => setIsUssdOpen(true)}
        onOpenSms={() => setIsSmsOpen(true)}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Main Design Container: Sidenav + Page Content enclosed inside max-w-7xl */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl flex-1 flex flex-col">
        <div className="flex flex-col lg:flex-row gap-6 items-start flex-1 w-full">
          {/* Collapsible Sidenav Panel inside the main design container */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            collapsed={sidebarCollapsed}
            setCollapsed={handleToggleSidebar}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            onOpenUssd={() => setIsUssdOpen(true)}
            onOpenSms={() => setIsSmsOpen(true)}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />

          {/* Main Viewport Content Area */}
          <main className="flex-1 min-w-0 w-full">
            {currentTab === 'landing' && (
              <LandingPage
                onExploreDashboard={() => setCurrentTab('dashboard')}
                onOpenUssd={() => setIsUssdOpen(true)}
                onOpenSms={() => setIsSmsOpen(true)}
                isAdmin={isAdmin}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardOverview
                onNavigateReports={() => setCurrentTab('reports')}
                onOpenUssd={() => setIsUssdOpen(true)}
                isAdmin={isAdmin}
                onAdminLoginSuccess={() => setIsAdmin(true)}
                onNavigateHome={() => setCurrentTab('landing')}
              />
            )}

            {currentTab === 'mobile-users' && (
              <MobileHubPage
                onOpenUssd={() => setIsUssdOpen(true)}
                onOpenSms={() => setIsSmsOpen(true)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'banks' && (
              <BankNetworkPage onOpenUssd={() => setIsUssdOpen(true)} />
            )}

            {currentTab === 'reports' && <ReportsPage />}

            {currentTab === 'areas' && <AreaAnalysisPage />}

            {currentTab === 'baselines' && <BaselinesPage />}

            {currentTab === 'sources' && <DataSourcesPage />}

            {currentTab === 'ai-insights' && <AiInsightsPage />}

            {currentTab === 'login' && (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (screens < lg) */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUssd={() => setIsUssdOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Feature Phone USSD Simulator Modal */}
      <UssdSimulatorModal
        isOpen={isUssdOpen}
        onClose={() => setIsUssdOpen(false)}
        onReportSubmitted={() => {
          // If on dashboard, let it show
        }}
        onOpenSmsOutbox={() => {
          setIsUssdOpen(false);
          setIsSmsOpen(true);
        }}
      />

      {/* Africa's Talking SMS Outbox Modal */}
      <SmsOutboxModal
        isOpen={isSmsOpen}
        onClose={() => setIsSmsOpen(false)}
      />
    </div>
  );
}
