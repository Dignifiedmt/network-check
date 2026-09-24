import React, { useState } from 'react';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isUssdOpen, setIsUssdOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16 lg:pb-0">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUssd={() => setIsUssdOpen(true)}
        onOpenSms={() => setIsSmsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onExploreDashboard={() => setCurrentTab('dashboard')}
            onOpenUssd={() => setIsUssdOpen(true)}
            onOpenSms={() => setIsSmsOpen(true)}
          />
        )}

        {currentTab !== 'landing' && (
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                onNavigateReports={() => setCurrentTab('reports')}
                onOpenUssd={() => setIsUssdOpen(true)}
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
              <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUssd={() => setIsUssdOpen(true)}
      />

      {/* Footer */}
      <Footer />

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
