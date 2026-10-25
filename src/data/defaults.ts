import { Category, AppSettings } from '../types';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Cheque',
  'Other',
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'spendly_settings',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'dd MMM yyyy, hh:mm a',
  theme: 'light',
  isBalanceHidden: false,
  defaultAccountId: '',
  allowNegativeBalance: true,
  warnOnNegativeBalance: true,
  isOnboarded: false,
  recentCounterparties: ['Dinesh', 'Sakthi', 'Client Payment', 'Company Payroll'],
};

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-food',
    name: 'Food',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316', // orange-500
    isDefault: true,
    subcategories: [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Restaurant',
      'Food Delivery',
      'Snacks',
      'Other Food',
    ],
  },
  {
    id: 'cat-snacks-beverages',
    name: 'Snacks & Beverages',
    type: 'expense',
    icon: 'Coffee',
    color: '#eab308', // yellow-500
    isDefault: true,
    subcategories: [
      'Tea',
      'Coffee',
      'Evening Snacks',
      'Biscuits',
      'Sweets',
      'Cold Drinks',
      'Other',
    ],
  },
  {
    id: 'cat-groceries',
    name: 'Groceries',
    type: 'expense',
    icon: 'ShoppingCart',
    color: '#10b981', // emerald-500
    isDefault: true,
    subcategories: [
      'Vegetables',
      'Fruits',
      'Household Items',
      'Other Groceries',
    ],
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    type: 'expense',
    icon: 'Bus',
    color: '#06b6d4', // cyan-500
    isDefault: true,
    subcategories: [
      'Bus',
      'Train',
      'Cab',
      'Auto',
      'Fuel',
      'Other Transport',
    ],
  },
  {
    id: 'cat-recharge-bills',
    name: 'Recharge & Bills',
    type: 'expense',
    icon: 'Zap',
    color: '#8b5cf6', // purple-500
    isDefault: true,
    subcategories: [
      'Mobile Recharge',
      'Internet',
      'Electricity',
      'Subscriptions',
      'Other Bills',
    ],
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899', // pink-500
    isDefault: true,
    subcategories: [
      'Clothing',
      'Accessories',
      'Electronics',
      'Personal Items',
      'Other Shopping',
    ],
  },
  {
    id: 'cat-accommodation',
    name: 'Accommodation',
    type: 'expense',
    icon: 'Home',
    color: '#3b82f6', // blue-500
    isDefault: true,
    subcategories: [
      'Hostel',
      'Rent',
      'Maintenance',
      'Other Accommodation',
    ],
  },
  {
    id: 'cat-education',
    name: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#6366f1', // indigo-500
    isDefault: true,
    subcategories: [
      'College Fees',
      'Books',
      'Stationery',
      'Courses',
      'Other Education',
    ],
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    type: 'expense',
    icon: 'Sparkles',
    color: '#14b8a6', // teal-500
    isDefault: true,
    subcategories: [
      'Grooming',
      'Laundry',
      'Toiletries',
      'Other',
    ],
  },
  {
    id: 'cat-health',
    name: 'Health',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ef4444', // red-500
    isDefault: true,
    subcategories: [
      'Medicines',
      'Medical Consultation',
      'Other Healthcare',
    ],
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#a855f7', // violet-500
    isDefault: true,
    subcategories: [
      'Movies',
      'Games',
      'Events',
      'Other Entertainment',
    ],
  },
  {
    id: 'cat-other-expenses',
    name: 'Other Expenses',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#71717a', // zinc-500
    isDefault: true,
    subcategories: [
      'Miscellaneous',
      'Unclassified',
    ],
  },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-inc-money-received',
    name: 'Money Received',
    type: 'income',
    icon: 'ArrowDownLeft',
    color: '#16a34a', // green-600
    isDefault: true,
    subcategories: ['Family', 'Friend', 'Peer Transfer', 'General'],
  },
  {
    id: 'cat-inc-salary',
    name: 'Salary',
    type: 'income',
    icon: 'Briefcase',
    color: '#059669', // emerald-600
    isDefault: true,
    subcategories: ['Monthly Salary', 'Bonus', 'Overtime', 'Incentive'],
  },
  {
    id: 'cat-inc-allowance',
    name: 'Allowance',
    type: 'income',
    icon: 'Gift',
    color: '#10b981', // emerald-500
    isDefault: true,
    subcategories: ['Monthly Allowance', 'Pocket Money', 'College Allowance'],
  },
  {
    id: 'cat-inc-gift',
    name: 'Gift',
    type: 'income',
    icon: 'Gift',
    color: '#f59e0b', // amber-500
    isDefault: true,
    subcategories: ['Birthday', 'Festival', 'Wedding', 'Cash Gift'],
  },
  {
    id: 'cat-inc-refund',
    name: 'Refund',
    type: 'income',
    icon: 'RotateCcw',
    color: '#06b6d4', // cyan-500
    isDefault: true,
    subcategories: ['Store Return', 'Failed Transaction Refund', 'Online Order Refund', 'Tax Refund'],
  },
  {
    id: 'cat-inc-reimbursement',
    name: 'Reimbursement',
    type: 'income',
    icon: 'Receipt',
    color: '#8b5cf6', // purple-500
    isDefault: true,
    subcategories: ['Shared Expense', 'Office Expense', 'Travel Reimbursement'],
  },
  {
    id: 'cat-inc-freelance',
    name: 'Freelance Income',
    type: 'income',
    icon: 'Laptop',
    color: '#3b82f6', // blue-500
    isDefault: true,
    subcategories: ['Client Work', 'Consulting', 'Design', 'Development'],
  },
  {
    id: 'cat-inc-other',
    name: 'Other Income',
    type: 'income',
    icon: 'TrendingUp',
    color: '#64748b', // slate-500
    isDefault: true,
    subcategories: ['Interest', 'Cashback', 'Dividends', 'Miscellaneous'],
  },
];
