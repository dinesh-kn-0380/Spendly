import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import {
  calculateIncomeForPeriod,
  calculateExpensesForPeriod,
  filterTransactionsByDateRange,
} from '../../services/financeEngine';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { TrendingUp, TrendingDown, Scale, Target } from 'lucide-react';

export const MonthlyOverviewCard: React.FC = () => {
  const { transactions, selectedAccountId, budgets, currencySymbol } = useSpendly();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthName = format(now, 'MMMM yyyy');

  // Filter transactions for current account if selected
  const accountTransactions = selectedAccountId
    ? transactions.filter(t => t.accountId === selectedAccountId || t.destinationAccountId === selectedAccountId)
    : transactions;

  const monthTransactions = filterTransactionsByDateRange(accountTransactions, monthStart, monthEnd);

  const monthIncome = calculateIncomeForPeriod(accountTransactions, monthStart, monthEnd);
  const monthExpenses = calculateExpensesForPeriod(accountTransactions, monthStart, monthEnd);
  const netCashFlow = monthIncome - monthExpenses;

  // Monthly budget
  const overallBudget = budgets.find(b => !b.categoryId && b.period === 'monthly');
  const budgetAmount = overallBudget ? overallBudget.amount : 0;
  const remainingBudget = overallBudget ? Math.max(0, budgetAmount - monthExpenses) : 0;
  const budgetUsagePercent = overallBudget && budgetAmount > 0
    ? Math.min(100, Math.round((monthExpenses / budgetAmount) * 100))
    : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Monthly Overview
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{monthName}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
          {monthTransactions.length} transaction{monthTransactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {/* Income Received */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Received</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{monthIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Expenses Spent */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Spent</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{monthExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Net Flow */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Net Flow</span>
          </div>
          <div
            className={`text-sm sm:text-base font-bold truncate ${
              netCashFlow >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}{currencySymbol}{netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Optional Budget bar if configured */}
      {overallBudget && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              <span>Monthly Budget ({currencySymbol}{budgetAmount.toLocaleString()})</span>
            </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {currencySymbol}{remainingBudget.toLocaleString()} left ({budgetUsagePercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                budgetUsagePercent > 90
                  ? 'bg-rose-500'
                  : budgetUsagePercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
