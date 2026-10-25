import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { NavTab } from './BottomNav';
import {
  Home,
  Clock,
  BarChart3,
  Tag,
  Settings,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { openModal, accounts, currencySymbol, displayBalance } = useSpendly();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'history', label: 'Transactions', icon: Clock },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 h-screen sticky top-0 justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-base shadow-sm">
            <span className="text-emerald-400 dark:text-emerald-600">S</span>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white block leading-none">
              Spendly
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              Personal Finance
            </span>
          </div>
        </div>

        {/* Quick Actions in Sidebar */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => openModal('add-expense')}
            className="w-full py-2.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-between group"
          >
            <span className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>Record Expense</span>
            </span>
            <span className="text-[10px] bg-rose-700 px-1.5 py-0.5 rounded text-rose-100">−</span>
          </button>

          <button
            onClick={() => openModal('add-money')}
            className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-between group"
          >
            <span className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Add Money</span>
            </span>
            <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded text-emerald-100">+</span>
          </button>

          <button
            onClick={() => openModal('transfer')}
            className="w-full py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>Transfer Funds</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <Wallet className="w-3.5 h-3.5" />
            <span>Total Accounts ({accounts.length})</span>
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
            {currencySymbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Local IndexedDB · Offline Ready</span>
        </div>
      </div>
    </aside>
  );
};
