import React, { useState, useMemo } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import {
  calculateCategoryBreakdown,
  calculateDailySpending,
  filterTransactionsByDateRange,
  calculateIncomeForPeriod,
  calculateExpensesForPeriod,
} from '../../services/financeEngine';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  differenceInCalendarDays,
} from 'date-fns';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, categories, selectedAccountId, currencySymbol } = useSpendly();

  type TimeRange = 'today' | 'week' | 'month' | 'last-month' | 'custom';
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const now = new Date();
  const [customStart, setCustomStart] = useState(() => format(startOfMonth(now), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(() => format(now, 'yyyy-MM-dd'));

  // Calculate start and end dates based on selected range
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now),
          rangeLabel: 'Today (' + format(now, 'dd MMM') + ')',
        };
      case 'week':
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }),
          endDate: endOfWeek(now, { weekStartsOn: 1 }),
          rangeLabel: 'This Week',
        };
      case 'month':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
          rangeLabel: format(now, 'MMMM yyyy'),
        };
      case 'last-month': {
        const last = subMonths(now, 1);
        return {
          startDate: startOfMonth(last),
          endDate: endOfMonth(last),
          rangeLabel: format(last, 'MMMM yyyy'),
        };
      }
      case 'custom':
        return {
          startDate: startOfDay(new Date(customStart)),
          endDate: endOfDay(new Date(customEnd)),
          rangeLabel: `${format(new Date(customStart), 'dd MMM')} – ${format(new Date(customEnd), 'dd MMM yyyy')}`,
        };
    }
  }, [timeRange, customStart, customEnd, now]);

  // Filter transactions for chosen account and period
  const accountTransactions = selectedAccountId
    ? transactions.filter(t => t.accountId === selectedAccountId || t.destinationAccountId === selectedAccountId)
    : transactions;

  const periodTransactions = useMemo(
    () => filterTransactionsByDateRange(accountTransactions, startDate, endDate),
    [accountTransactions, startDate, endDate]
  );

  // Key metrics
  const totalIncome = calculateIncomeForPeriod(accountTransactions, startDate, endDate);
  const totalExpenses = calculateExpensesForPeriod(accountTransactions, startDate, endDate);
  const netCashFlow = totalIncome - totalExpenses;

  const expenseTx = periodTransactions.filter(t => t.type === 'expense');
  const largestExpense = expenseTx.length > 0
    ? Math.max(...expenseTx.map(t => t.amount))
    : 0;

  const daysInRange = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);
  const avgDailySpending = Math.round(totalExpenses / daysInRange);

  // Category breakdown
  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(accountTransactions, categories, startDate, endDate),
    [accountTransactions, categories, startDate, endDate]
  );

  // Daily spending chart data
  const dailySpendingData = useMemo(
    () => calculateDailySpending(accountTransactions, startDate, endDate),
    [accountTransactions, startDate, endDate]
  );

  // Top 5 categories for pie chart + others
  const pieData = useMemo(() => {
    if (categoryBreakdown.length <= 5) {
      return categoryBreakdown.map(c => ({
        name: c.categoryName,
        value: c.totalSpent,
        color: c.color,
      }));
    }
    const top = categoryBreakdown.slice(0, 4);
    const others = categoryBreakdown.slice(4).reduce((sum, c) => sum + c.totalSpent, 0);
    return [
      ...top.map(c => ({ name: c.categoryName, value: c.totalSpent, color: c.color })),
      { name: 'Others', value: others, color: '#94a3b8' },
    ];
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header and Time Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overview for {rangeLabel}
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'last-month', label: 'Last Mo' },
            { id: 'custom', label: 'Custom' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as TimeRange)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                timeRange === tab.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {timeRange === 'custom' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-subtle flex flex-wrap items-center gap-3 text-xs animate-slide-up">
          <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Income</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{totalIncome.toLocaleString()}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Expenses</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{totalExpenses.toLocaleString()}
          </div>
        </div>

        {/* Net Flow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Net Flow</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold truncate ${
              netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}{currencySymbol}{netCashFlow.toLocaleString()}
          </div>
        </div>

        {/* Largest Expense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Largest</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{largestExpense.toLocaleString()}
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Daily Avg</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
            {currencySymbol}{avgDailySpending.toLocaleString()}
          </div>
        </div>

        {/* Transactions Count */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Count</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
            {periodTransactions.length} txs
          </div>
        </div>
      </div>

      {/* Chart 1: Spending & Income Trend Over Time */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Daily Spending & Income Trend
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Chronological flow of money</p>
          </div>
        </div>

        {dailySpendingData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-zinc-400">
            No transaction records for this period.
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dayLabel"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `${currencySymbol}${val}`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${currencySymbol}${Number(val).toLocaleString()}`,
                    name === 'expenses' ? 'Expenses' : 'Income',
                  ]}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                  name="expenses"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="income"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Category Breakdown Donut & Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Donut Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Category Distribution
            </h3>
          </div>

          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 py-12">
              No expenses recorded for this timeframe.
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={val => <span className="text-xs text-zinc-600 dark:text-zinc-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Category Totals & Subcategories */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Expense Categories Breakdown
              </h3>
            </div>
            <span className="text-xs text-zinc-400">
              {categoryBreakdown.length} active
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 py-12">
              No expense categories to show.
            </div>
          ) : (
            <div className="space-y-3.5 overflow-y-auto max-h-72 pr-1">
              {categoryBreakdown.map(cat => (
                <div key={cat.categoryId} className="space-y-1.5 pb-2 border-b border-zinc-50 dark:border-zinc-800/60 last:border-none">
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
                    </div>
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {currencySymbol}{cat.totalSpent.toLocaleString()}
                      <span className="text-[11px] font-normal text-zinc-400 ml-1.5">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>

                  {/* Subcategories list */}
                  {cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 pl-8">
                      {cat.subcategories.map(sub => (
                        <span
                          key={sub.name}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        >
                          {sub.name}: {currencySymbol}{sub.totalSpent.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
