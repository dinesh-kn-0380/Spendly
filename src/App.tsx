import React, { useState } from 'react';
import { SpendlyProvider, useSpendly } from './context/SpendlyContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionHistoryView } from './components/history/TransactionHistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { CategoryManagementView } from './components/categories/CategoryManagementView';
import { SettingsView } from './components/settings/SettingsView';

// Transaction Modals
import { AddMoneyModal } from './components/transactions/AddMoneyModal';
import { AddExpenseModal } from './components/transactions/AddExpenseModal';
import { TransferModal } from './components/transactions/TransferModal';
import { EditTransactionModal } from './components/transactions/EditTransactionModal';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';

const SpendlyApp: React.FC = () => {
  const { isLoading, settings, accounts } = useSpendly();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-xl shadow-md animate-pulse">
            <span className="text-emerald-400 dark:text-emerald-600">S</span>
          </div>
          <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
            Loading Spendly...
          </span>
        </div>
      </div>
    );
  }

  // Render appropriate view
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return (
          <DashboardView
            onViewAllHistory={() => setCurrentTab('history')}
            onViewReports={() => setCurrentTab('reports')}
          />
        );
      case 'history':
        return <TransactionHistoryView />;
      case 'reports':
        return <ReportsView />;
      case 'categories':
        return <CategoryManagementView />;
      case 'settings':
        return <SettingsView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Desktop Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTab={currentTab} />

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-7 max-w-4xl w-full mx-auto pb-24 md:pb-12">
          {renderCurrentView()}
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>

      {/* First-time Onboarding Modal */}
      {(!settings.isOnboarded || accounts.length === 0) && <OnboardingModal />}

      {/* Global Transaction Modals */}
      <AddMoneyModal />
      <AddExpenseModal />
      <TransferModal />
      <EditTransactionModal />
      <TransactionDetailModal />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SpendlyProvider>
      <SpendlyApp />
    </SpendlyProvider>
  );
}
