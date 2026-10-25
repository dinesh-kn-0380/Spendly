import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { calculateCategoryBreakdown } from '../../services/financeEngine';
import { CategoryIcon } from '../common/CategoryIcon';
import { startOfMonth, endOfMonth } from 'date-fns';
import { PieChart } from 'lucide-react';

interface MiniSpendingBreakdownProps {
  onViewReports: () => void;
}

export const MiniSpendingBreakdown: React.FC<MiniSpendingBreakdownProps> = ({ onViewReports }) => {
  const { transactions, categories, selectedAccountId, currencySymbol } = useSpendly();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const accountTransactions = selectedAccountId
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;

  const breakdown = calculateCategoryBreakdown(accountTransactions, categories, monthStart, monthEnd);
  const topCategories = breakdown.slice(0, 4);

  if (topCategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Top Spending This Month
          </h3>
        </div>
        <button
          onClick={onViewReports}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Detailed Reports
        </button>
      </div>

      <div className="space-y-3.5">
        {topCategories.map(cat => (
          <div key={cat.categoryId} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {cat.categoryName}
                </span>
                <span className="text-[11px] text-zinc-400">
                  ({cat.transactionCount})
                </span>
              </div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">
                {currencySymbol}{cat.totalSpent.toLocaleString()}
                <span className="text-[11px] font-normal text-zinc-400 ml-1.5">
                  {cat.percentage}%
                </span>
              </div>
            </div>

            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
