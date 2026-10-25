import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { CURRENCIES } from '../../data/defaults';
import { AccountManagementModal } from './AccountManagementModal';
import { BudgetManagementModal } from './BudgetManagementModal';
import { DataBackupModal } from './DataBackupModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { clearTransactionHistory, factoryResetApplication } from '../../services/dataManager';
import {
  Wallet,
  Target,
  Database,
  Moon,
  Sun,
  Laptop,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    accounts,
    budgets,
    currencySymbol,
    showToast,
    refreshAllData,
  } = useSpendly();

  // Sub-modals
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Destructive actions dialogs
  const [confirmClearHistoryOpen, setConfirmClearHistoryOpen] = useState(false);
  const [confirmResetAppOpen, setConfirmResetAppOpen] = useState(false);

  const handleCurrencyChange = (newCode: string) => {
    const found = CURRENCIES.find(c => c.code === newCode);
    if (found) {
      updateSettings({
        currency: found.code,
        currencySymbol: found.symbol,
      });
      showToast(`Currency changed to ${found.name} (${found.symbol})`, 'success');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearTransactionHistory();
      await refreshAllData();
      showToast('All transaction history cleared successfully', 'info');
    } catch (err) {
      showToast('Failed to clear history', 'error');
    }
  };

  const handleFactoryReset = async () => {
    try {
      await factoryResetApplication();
      await updateSettings({ isOnboarded: false });
      await refreshAllData();
      showToast('Application reset to factory defaults', 'info');
    } catch (err) {
      showToast('Failed to reset app', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-14">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Application Settings
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Preferences, accounts, data persistence, and security
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-card space-y-5">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          General Preferences
        </span>

        {/* Currency Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Primary Currency
            </h4>
            <p className="text-xs text-zinc-500">
              Format balances and transactions
            </p>
          </div>
          <select
            value={settings.currency}
            onChange={e => handleCurrencyChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
          >
            {CURRENCIES.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name} ({curr.code})
              </option>
            ))}
          </select>
        </div>

        {/* Theme Preference */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Appearance Theme
            </h4>
            <p className="text-xs text-zinc-500">
              Switch between light and dark modes
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                settings.theme === 'light'
                  ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              aria-label="Light mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                settings.theme === 'dark'
                  ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
              aria-label="Dark mode"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'system' })}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                settings.theme === 'system'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              aria-label="System theme"
            >
              <Laptop className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance Visibility Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Privacy Mode (Hide Balance)
            </h4>
            <p className="text-xs text-zinc-500">
              Hide account balances from shoulder surfers
            </p>
          </div>
          <button
            onClick={() => updateSettings({ isBalanceHidden: !settings.isBalanceHidden })}
            className={`p-2 rounded-xl border transition-all ${
              settings.isBalanceHidden
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-transparent'
            }`}
          >
            {settings.isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Negative Balance Configuration */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Allow Negative Balance
            </h4>
            <p className="text-xs text-zinc-500">
              Warn or restrict spending when account balance is insufficient
            </p>
          </div>
          <button
            onClick={() => updateSettings({ allowNegativeBalance: !settings.allowNegativeBalance })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.allowNegativeBalance ? 'bg-zinc-900 dark:bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.allowNegativeBalance ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Management Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Accounts Card */}
        <button
          type="button"
          onClick={() => setAccountsModalOpen(true)}
          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle hover:border-zinc-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mb-3 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Manage Accounts
            </h4>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {accounts.length} active account{accounts.length !== 1 ? 's' : ''} configured
          </p>
        </button>

        {/* Budgets Card */}
        <button
          type="button"
          onClick={() => setBudgetModalOpen(true)}
          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle hover:border-zinc-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mb-3 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Spending Budgets
            </h4>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {budgets.length} monthly limit{budgets.length !== 1 ? 's' : ''} set
          </p>
        </button>

        {/* Data Backup Card */}
        <button
          type="button"
          onClick={() => setBackupModalOpen(true)}
          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle hover:border-zinc-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mb-3 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Backup & Export
            </h4>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            CSV download & JSON backup
          </p>
        </button>
      </div>

      {/* Security & Privacy Notice */}
      <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <span>Local-First & Offline Privacy Guarantee</span>
        </div>
        <p className="leading-relaxed opacity-90">
          Spendly is designed from the ground up to never transmit your financial records or transactions over external servers. All accounts, balances, and history are stored directly within your browser's persistent IndexedDB database.
        </p>
        <p className="leading-relaxed opacity-80 text-[11px]">
          Remember to periodically download a JSON backup if you switch devices or clear browser storage.
        </p>
      </div>

      {/* Danger Zone: Clear History & Reset */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-950/60 shadow-subtle space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block">
          Danger Zone
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Clear Transaction History
            </h4>
            <p className="text-xs text-zinc-500">
              Deletes all past transaction records while keeping accounts and categories intact.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmClearHistoryOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold shrink-0 transition-colors"
          >
            Clear History
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Factory Reset Spendly
            </h4>
            <p className="text-xs text-zinc-500">
              Permanently wipes all accounts, transactions, and categories, returning to setup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmResetAppOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            Reset Application
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-xs text-zinc-400 space-y-1">
        <p>Spendly — Personal Finance & Expense Tracker v1.0.0</p>
        <p className="text-[11px]">Free Netlify Ready · Local-First IndexedDB</p>
      </div>

      {/* Sub-modals */}
      <AccountManagementModal
        isOpen={accountsModalOpen}
        onClose={() => setAccountsModalOpen(false)}
      />
      <BudgetManagementModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />
      <DataBackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

      {/* Confirm Clear History */}
      <ConfirmDialog
        isOpen={confirmClearHistoryOpen}
        onClose={() => setConfirmClearHistoryOpen(false)}
        onConfirm={handleClearHistory}
        title="Clear All Transaction History?"
        message="This will delete every recorded expense, credit, and transfer. Your account opening balances and categories will remain. This action cannot be reversed."
        confirmLabel="Clear All Transactions"
        isDestructive={true}
      />

      {/* Confirm Factory Reset */}
      <ConfirmDialog
        isOpen={confirmResetAppOpen}
        onClose={() => setConfirmResetAppOpen(false)}
        onConfirm={handleFactoryReset}
        title="Factory Reset Everything?"
        message="WARNING: This will completely wipe all accounts, transactions, categories, budgets, and settings from this browser. You will be redirected to the initial onboarding screen."
        confirmLabel="Wipe & Reset Everything"
        isDestructive={true}
      />
    </div>
  );
};
