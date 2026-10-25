import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { NavTab } from './BottomNav';
import { Wallet, Sun, Moon, Plus } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    settings,
    updateSettings,
    openModal,
  } = useSpendly();

  const titleMap: Record<NavTab, string> = {
    home: 'Spendly',
    history: 'Transaction History',
    reports: 'Reports & Analytics',
    categories: 'Categories',
    settings: 'Settings',
  };

  const isDarkMode = settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-sm shadow-sm">
            <span className="text-emerald-400 dark:text-emerald-600">S</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
              {titleMap[currentTab]}
            </h1>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Personal Finance &amp; Expense Tracker
            </p>
          </div>
        </div>

        {/* Right Actions: Account Picker, Theme, Desktop Add */}
        <div className="flex items-center gap-2">
          {/* Account Selector Pill */}
          <select
            value={selectedAccountId || ''}
            onChange={e => setSelectedAccountId(e.target.value ? e.target.value : null)}
            className="hidden sm:block text-xs font-semibold py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Accounts ({accounts.length})</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop Quick Add Button */}
          <div className="hidden md:flex items-center gap-1.5 pl-2">
            <button
              onClick={() => openModal('add-expense')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              − Expense
            </button>
            <button
              onClick={() => openModal('add-money')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              + Money
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
