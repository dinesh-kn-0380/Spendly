export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export type AccountType = 'bank' | 'cash' | 'savings' | 'other';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Cheque' | 'Other';

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  categoryId: string;
  subcategoryId?: string;
  accountId: string; // Source account (or receiving account for income/refund)
  destinationAccountId?: string; // For transfers
  counterpartyName?: string; // Sender / Counterparty for income
  merchantName?: string; // Merchant / Recipient for expense
  description?: string;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
  transactionDate: string; // ISO 8601 string (e.g. 2026-10-25T14:30:00.000Z)
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currency: string;
  description?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string; // Lucide icon name
  color: string; // Tailwind hex or color code
  isDefault: boolean;
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  categoryId?: string; // null/undefined for total overall monthly budget
  amount: number;
  period: 'monthly' | 'daily';
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string; // 'spendly_settings'
  currency: string; // 'INR', 'USD', 'EUR', 'GBP'
  currencySymbol: string; // '₹', '$', '€', '£'
  dateFormat: string; // 'dd MMM yyyy'
  theme: 'light' | 'dark' | 'system';
  isBalanceHidden: boolean;
  defaultAccountId: string;
  allowNegativeBalance: boolean; // default true with warning or false
  warnOnNegativeBalance: boolean;
  isOnboarded: boolean;
  recentCounterparties: string[];
}

export interface AccountBalanceSummary {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalRefunds: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  currentBalance: number;
}

export interface CombinedFinancialSummary {
  combinedBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalRefunds: number;
  netCashFlow: number;
  transactionCount: number;
  accounts: AccountBalanceSummary[];
}

export interface CategorySpendingSummary {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
  subcategories: {
    name: string;
    totalSpent: number;
    count: number;
  }[];
}

export interface DailySpendingSummary {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon 24"
  expenses: number;
  income: number;
  net: number;
}
