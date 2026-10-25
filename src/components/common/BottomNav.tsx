import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import {
  Home,
  Clock,
  BarChart3,
  Tag,
  Settings,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  X,
} from 'lucide-react';

export type NavTab = 'home' | 'history' | 'reports' | 'categories' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { openModal } = useSpendly();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Quick Action Overlay Sheet for Mobile Floating Plus */}
      {showQuickMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setShowQuickMenu(false)}
          />

          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-3xl p-6 shadow-elevated border-t border-zinc-200 dark:border-zinc-800 animate-slide-up space-y-3 pb-8">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Quick Action
              </span>
              <button
                onClick={() => setShowQuickMenu(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  openModal('add-money');
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 active:scale-95 transition-transform"
              >
                <ArrowDownLeft className="w-6 h-6 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">+ Add Money</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  openModal('add-expense');
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 active:scale-95 transition-transform"
              >
                <ArrowUpRight className="w-6 h-6 mb-1 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold">− Expense</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  openModal('transfer');
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300 active:scale-95 transition-transform"
              >
                <ArrowRightLeft className="w-6 h-6 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold">⇄ Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Plus Button for Mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button
          onClick={() => setShowQuickMenu(true)}
          className="w-14 h-14 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-elevated flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800 safe-area-bottom">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
