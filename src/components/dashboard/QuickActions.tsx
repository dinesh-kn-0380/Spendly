import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const { openModal } = useSpendly();

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {/* Add Money */}
      <button
        type="button"
        onClick={() => openModal('add-money')}
        className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-950/60 shadow-subtle hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-card active:scale-[0.98] transition-all group"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          + Add Money
        </span>
        <span className="text-[10px] text-zinc-400 hidden sm:inline-block mt-0.5">
          Income received
        </span>
      </button>

      {/* Add Expense */}
      <button
        type="button"
        onClick={() => openModal('add-expense')}
        className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950/60 shadow-subtle hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-card active:scale-[0.98] transition-all group"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          − Add Expense
        </span>
        <span className="text-[10px] text-zinc-400 hidden sm:inline-block mt-0.5">
          Record spending
        </span>
      </button>

      {/* Transfer */}
      <button
        type="button"
        onClick={() => openModal('transfer')}
        className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-950/60 shadow-subtle hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-card active:scale-[0.98] transition-all group"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          ⇄ Transfer
        </span>
        <span className="text-[10px] text-zinc-400 hidden sm:inline-block mt-0.5">
          Between accounts
        </span>
      </button>
    </div>
  );
};
