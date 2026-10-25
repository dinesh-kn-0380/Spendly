import {
  Transaction,
  Account,
  AccountBalanceSummary,
  CombinedFinancialSummary,
  CategorySpendingSummary,
  DailySpendingSummary,
  Category,
} from '../types';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Precision round to 2 decimal places to avoid IEEE 754 floating point drift
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: unknown): number {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (!Number.isFinite(parsed) || isNaN(parsed) || parsed <= 0) {
    throw new Error('Transaction amount must be a finite positive number greater than zero.');
  }
  return roundToTwoDecimals(parsed);
}

/**
 * Calculate balance for a single account:
 * Current Balance = Opening Balance + Credits - Debits + Incoming Transfers - Outgoing Transfers
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[]
): AccountBalanceSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRefunds = 0;
  let incomingTransfers = 0;
  let outgoingTransfers = 0;

  for (const tx of transactions) {
    const amt = roundToTwoDecimals(tx.amount);

    if (tx.type === 'income' && tx.accountId === account.id) {
      totalIncome += amt;
    } else if (tx.type === 'expense' && tx.accountId === account.id) {
      totalExpenses += amt;
    } else if (tx.type === 'refund' && tx.accountId === account.id) {
      totalRefunds += amt;
    } else if (tx.type === 'transfer') {
      if (tx.accountId === account.id) {
        outgoingTransfers += amt;
      }
      if (tx.destinationAccountId === account.id) {
        incomingTransfers += amt;
      }
    }
  }

  totalIncome = roundToTwoDecimals(totalIncome);
  totalExpenses = roundToTwoDecimals(totalExpenses);
  totalRefunds = roundToTwoDecimals(totalRefunds);
  incomingTransfers = roundToTwoDecimals(incomingTransfers);
  outgoingTransfers = roundToTwoDecimals(outgoingTransfers);

  const currentBalance = roundToTwoDecimals(
    account.openingBalance +
      totalIncome +
      totalRefunds -
      totalExpenses +
      incomingTransfers -
      outgoingTransfers
  );

  return {
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    openingBalance: roundToTwoDecimals(account.openingBalance),
    totalIncome,
    totalExpenses,
    totalRefunds,
    incomingTransfers,
    outgoingTransfers,
    currentBalance,
  };
}

/**
 * Calculate combined summary across all tracked accounts.
 * Internal transfers between accounts net to zero across the combined balance.
 */
export function calculateCombinedFinancialSummary(
  accounts: Account[],
  transactions: Transaction[]
): CombinedFinancialSummary {
  const activeAccounts = accounts.filter(a => !a.isArchived);
  const accountSummaries = activeAccounts.map(acc => calculateAccountBalance(acc, transactions));

  let combinedBalance = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRefunds = 0;

  for (const summary of accountSummaries) {
    combinedBalance += summary.currentBalance;
    totalIncome += summary.totalIncome;
    totalExpenses += summary.totalExpenses;
    totalRefunds += summary.totalRefunds;
  }

  combinedBalance = roundToTwoDecimals(combinedBalance);
  totalIncome = roundToTwoDecimals(totalIncome);
  totalExpenses = roundToTwoDecimals(totalExpenses);
  totalRefunds = roundToTwoDecimals(totalRefunds);
  const netCashFlow = roundToTwoDecimals((totalIncome + totalRefunds) - totalExpenses);

  return {
    combinedBalance,
    totalIncome,
    totalExpenses,
    totalRefunds,
    netCashFlow,
    transactionCount: transactions.length,
    accounts: accountSummaries,
  };
}

/**
 * Filter transactions within a date interval (inclusive of start and end days)
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  const interval = {
    start: startOfDay(startDate),
    end: endOfDay(endDate),
  };

  return transactions.filter(tx => {
    try {
      const txDate = parseISO(tx.transactionDate);
      return isWithinInterval(txDate, interval);
    } catch {
      return false;
    }
  });
}

/**
 * Calculate total income for a period (excluding internal transfers)
 */
export function calculateIncomeForPeriod(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): number {
  const filtered = startDate && endDate
    ? filterTransactionsByDateRange(transactions, startDate, endDate)
    : transactions;

  const total = filtered.reduce((sum, tx) => {
    if (tx.type === 'income') {
      return sum + tx.amount;
    }
    return sum;
  }, 0);

  return roundToTwoDecimals(total);
}

/**
 * Calculate total expenses for a period (excluding internal transfers)
 */
export function calculateExpensesForPeriod(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): number {
  const filtered = startDate && endDate
    ? filterTransactionsByDateRange(transactions, startDate, endDate)
    : transactions;

  const total = filtered.reduce((sum, tx) => {
    if (tx.type === 'expense') {
      return sum + tx.amount;
    }
    return sum;
  }, 0);

  return roundToTwoDecimals(total);
}

/**
 * Calculate category-wise expense breakdown with subcategories
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  startDate?: Date,
  endDate?: Date
): CategorySpendingSummary[] {
  const filtered = startDate && endDate
    ? filterTransactionsByDateRange(transactions, startDate, endDate)
    : transactions;

  const expenseTx = filtered.filter(tx => tx.type === 'expense');
  const totalPeriodExpense = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap = new Map<string, CategorySpendingSummary>();

  // Map category details
  const catLookup = new Map<string, Category>(categories.map(c => [c.id, c]));

  for (const tx of expenseTx) {
    const cat = catLookup.get(tx.categoryId);
    const catId = cat ? cat.id : tx.categoryId;
    const catName = cat ? cat.name : 'Uncategorized';
    const catIcon = cat ? cat.icon : 'Tag';
    const catColor = cat ? cat.color : '#71717a';

    let item = categoryMap.get(catId);
    if (!item) {
      item = {
        categoryId: catId,
        categoryName: catName,
        icon: catIcon,
        color: catColor,
        totalSpent: 0,
        percentage: 0,
        transactionCount: 0,
        subcategories: [],
      };
      categoryMap.set(catId, item);
    }

    item.totalSpent = roundToTwoDecimals(item.totalSpent + tx.amount);
    item.transactionCount += 1;

    // Subcategory breakdown
    const subName = tx.subcategoryId || 'General';
    const existingSub = item.subcategories.find(s => s.name === subName);
    if (existingSub) {
      existingSub.totalSpent = roundToTwoDecimals(existingSub.totalSpent + tx.amount);
      existingSub.count += 1;
    } else {
      item.subcategories.push({
        name: subName,
        totalSpent: roundToTwoDecimals(tx.amount),
        count: 1,
      });
    }
  }

  // Calculate percentages and sort descending
  const result = Array.from(categoryMap.values()).map(item => ({
    ...item,
    percentage: totalPeriodExpense > 0
      ? roundToTwoDecimals((item.totalSpent / totalPeriodExpense) * 100)
      : 0,
  }));

  result.sort((a, b) => b.totalSpent - a.totalSpent);
  return result;
}

/**
 * Calculate daily spending and income trends for a given date range
 */
export function calculateDailySpending(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): DailySpendingSummary[] {
  const filtered = filterTransactionsByDateRange(transactions, startDate, endDate);
  const dayMap = new Map<string, { expenses: number; income: number }>();

  // Initialize days in interval to prevent missing date gaps
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    const key = format(current, 'yyyy-MM-dd');
    dayMap.set(key, { expenses: 0, income: 0 });
    current.setDate(current.getDate() + 1);
  }

  for (const tx of filtered) {
    try {
      const txDate = parseISO(tx.transactionDate);
      const key = format(txDate, 'yyyy-MM-dd');
      const dayData = dayMap.get(key) || { expenses: 0, income: 0 };

      if (tx.type === 'expense') {
        dayData.expenses = roundToTwoDecimals(dayData.expenses + tx.amount);
      } else if (tx.type === 'income' || tx.type === 'refund') {
        dayData.income = roundToTwoDecimals(dayData.income + tx.amount);
      }
      dayMap.set(key, dayData);
    } catch {
      // skip invalid date
    }
  }

  // Format into sorted array
  const sortedKeys = Array.from(dayMap.keys()).sort();
  return sortedKeys.map(dateKey => {
    const data = dayMap.get(dateKey)!;
    const parsed = parseISO(dateKey);
    return {
      date: dateKey,
      dayLabel: format(parsed, 'd MMM'),
      expenses: data.expenses,
      income: data.income,
      net: roundToTwoDecimals(data.income - data.expenses),
    };
  });
}

/**
 * Check if spending an amount would result in negative balance for the specified account
 */
export function checkSufficientBalance(
  account: Account,
  transactions: Transaction[],
  expenseAmount: number
): {
  hasSufficientBalance: boolean;
  currentBalance: number;
  projectedBalance: number;
} {
  const summary = calculateAccountBalance(account, transactions);
  const projectedBalance = roundToTwoDecimals(summary.currentBalance - expenseAmount);

  return {
    hasSufficientBalance: projectedBalance >= 0,
    currentBalance: summary.currentBalance,
    projectedBalance,
  };
}

/**
 * Format currency with international/Indian numeral system support
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  currencySymbol: string = '₹'
): string {
  const absAmount = Math.abs(amount);
  let formattedNumber = '';

  if (currencyCode === 'INR') {
    formattedNumber = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNumber = absAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencySymbol}${formattedNumber}`;
}
