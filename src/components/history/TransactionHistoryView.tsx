import React, { useState, useMemo } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { TransactionItem } from '../transactions/TransactionItem';
import { Transaction, TransactionType } from '../../types';
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { Search, Filter, X, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Calendar, RotateCcw } from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    selectedAccountId,
    currencySymbol,
    openModal,
  } = useSpendly();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>(selectedAccountId || '');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'last-month'>('all');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Sync with global account selector if changed
  React.useEffect(() => {
    if (selectedAccountId) {
      setFilterAccountId(selectedAccountId);
    }
  }, [selectedAccountId]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Account filter
      if (filterAccountId && tx.accountId !== filterAccountId && tx.destinationAccountId !== filterAccountId) {
        return false;
      }

      // 2. Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'income' && tx.type !== 'income') return false;
        if (selectedType === 'expense' && tx.type !== 'expense') return false;
        if (selectedType === 'transfer' && tx.type !== 'transfer') return false;
        if (selectedType === 'refund' && tx.type !== 'refund') return false;
      }

      // 3. Category filter
      if (filterCategoryId && tx.categoryId !== filterCategoryId) {
        return false;
      }

      // 4. Date range filter
      if (dateRangeFilter !== 'all') {
        try {
          const txDate = parseISO(tx.transactionDate);
          const now = new Date();
          if (dateRangeFilter === 'today' && !isToday(txDate)) return false;
          if (dateRangeFilter === 'week' && !isThisWeek(txDate, { weekStartsOn: 1 })) return false;
          if (dateRangeFilter === 'month' && !isThisMonth(txDate)) return false;
          if (dateRangeFilter === 'last-month') {
            const lastMonth = subMonths(now, 1);
            const start = startOfMonth(lastMonth);
            const end = endOfMonth(lastMonth);
            if (txDate < start || txDate > end) return false;
          }
        } catch {
          return false;
        }
      }

      // 5. Search query (person, merchant, description, category, amount, referenceId)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = categories.find(c => c.id === tx.categoryId);
        const matchTitle = (tx.counterpartyName || '').toLowerCase().includes(q) ||
          (tx.merchantName || '').toLowerCase().includes(q);
        const matchDesc = (tx.description || '').toLowerCase().includes(q);
        const matchCat = (cat?.name || '').toLowerCase().includes(q);
        const matchSub = (tx.subcategoryId || '').toLowerCase().includes(q);
        const matchRef = (tx.referenceId || '').toLowerCase().includes(q);
        const matchAmt = tx.amount.toString().includes(q);

        if (!matchTitle && !matchDesc && !matchCat && !matchSub && !matchRef && !matchAmt) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterAccountId, selectedType, filterCategoryId, dateRangeFilter, searchQuery, categories]);

  // Group transactions by date sections (Today, Yesterday, Earlier this week, Previous dates)
  const groupedSections = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {
      Today: [],
      Yesterday: [],
      'Earlier This Week': [],
      'This Month': [],
      Earlier: [],
    };

    for (const tx of filteredList) {
      try {
        const dt = parseISO(tx.transactionDate);
        if (isToday(dt)) {
          groups['Today'].push(tx);
        } else if (isYesterday(dt)) {
          groups['Yesterday'].push(tx);
        } else if (isThisWeek(dt, { weekStartsOn: 1 })) {
          groups['Earlier This Week'].push(tx);
        } else if (isThisMonth(dt)) {
          groups['This Month'].push(tx);
        } else {
          groups['Earlier'].push(tx);
        }
      } catch {
        groups['Earlier'].push(tx);
      }
    }

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredList]);

  // Filter summary totals
  const totalFilteredSpent = filteredList
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredReceived = filteredList
    .filter(t => t.type === 'income' || t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const hasActiveFilters = !!searchQuery || selectedType !== 'all' || !!filterAccountId || !!filterCategoryId || dateRangeFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setFilterAccountId('');
    setFilterCategoryId('');
    setDateRangeFilter('all');
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, merchant, amount, or note..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white shadow-subtle"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
            showFiltersDrawer || filterAccountId || filterCategoryId || dateRangeFilter !== 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
          aria-label="Filter transactions"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'income', label: 'Received (+)', icon: ArrowDownLeft, color: 'text-emerald-600' },
          { id: 'expense', label: 'Expenses (−)', icon: ArrowUpRight, color: 'text-rose-600' },
          { id: 'transfer', label: 'Transfers (⇄)', icon: ArrowRightLeft, color: 'text-indigo-600' },
          { id: 'refund', label: 'Refunds (↺)', icon: RotateCcw, color: 'text-cyan-600' },
        ].map(item => {
          const isSelected = selectedType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedType(item.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expandable Filter Drawer */}
      {showFiltersDrawer && (
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card space-y-3 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Advanced Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Account filter */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Account
              </label>
              <select
                value={filterAccountId}
                onChange={e => setFilterAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="">All Accounts</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Category
              </label>
              <select
                value={filterCategoryId}
                onChange={e => setFilterCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Date range filter */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Timeframe
              </label>
              <select
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="last-month">Previous Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter summary header */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>{filteredList.length} transaction{filteredList.length !== 1 ? 's' : ''} found</span>
        <div className="flex items-center gap-3">
          {totalFilteredReceived > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              +{currencySymbol}{totalFilteredReceived.toLocaleString()}
            </span>
          )}
          {totalFilteredSpent > 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              -{currencySymbol}{totalFilteredSpent.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Grouped Transaction Rows */}
      {groupedSections.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
          <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No transactions match your criteria
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search terms, changing the account or resetting filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSections.map(([groupName, items]) => (
            <div key={groupName} className="space-y-2">
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {groupName}
              </div>
              <div className="space-y-2">
                {items.map(tx => (
                  <TransactionItem
                    key={tx.id || `${tx.transactionDate}_${tx.amount}`}
                    transaction={tx}
                    accounts={accounts}
                    categories={categories}
                    currencySymbol={currencySymbol}
                    onClick={selectedTx => openModal('transaction-detail', selectedTx)}
                    showAccountBadge={!filterAccountId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
