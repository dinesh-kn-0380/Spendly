import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, initializeDatabase } from '../db';
import {
  Transaction,
  Account,
  Category,
  Budget,
  AppSettings,
  CombinedFinancialSummary,
  AccountBalanceSummary,
} from '../types';
import { DEFAULT_SETTINGS } from '../data/defaults';
import {
  calculateCombinedFinancialSummary,
  calculateAccountBalance,
  formatCurrency,
  validateAmount,
} from '../services/financeEngine';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SpendlyContextType {
  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: AppSettings;
  isLoading: boolean;

  // Selected filters
  selectedAccountId: string | null; // null = combined
  setSelectedAccountId: (id: string | null) => void;

  // Summaries
  combinedSummary: CombinedFinancialSummary;
  selectedAccountSummary: AccountBalanceSummary | null;
  displayBalance: number;

  // Currency helpers
  currencySymbol: string;
  formatMoney: (amount: number) => string;

  // Modal triggers
  activeModal: string | null;
  openModal: (modal: string, payload?: any) => void;
  closeModal: () => void;
  modalPayload: any;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Operations
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  createAccount: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  archiveAccount: (id: string) => Promise<void>;
  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string, reassignToId?: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  saveBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const SpendlyContext = createContext<SpendlyContextType | undefined>(undefined);

export const SpendlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all records
  const loadData = useCallback(async () => {
    try {
      await initializeDatabase();

      const [storedSettings, storedAccounts, storedCategories, storedTransactions, storedBudgets] =
        await Promise.all([
          db.settings.get('spendly_settings'),
          db.accounts.toArray(),
          db.categories.toArray(),
          db.transactions.reverse().sortBy('transactionDate'),
          db.budgets.toArray(),
        ]);

      if (storedSettings) {
        const sanitized = (storedSettings.recentCounterparties || [])
          .filter(name => !['Dad', 'Mom', 'Anamika'].includes(name));
        const updatedList = Array.from(new Set(['Dinesh', 'Sakthi', ...sanitized]));
        if (JSON.stringify(storedSettings.recentCounterparties) !== JSON.stringify(updatedList)) {
          storedSettings.recentCounterparties = updatedList;
          await db.settings.update('spendly_settings', { recentCounterparties: updatedList });
        }
        setSettings(storedSettings);
      }
      setAccounts(storedAccounts);
      setCategories(storedCategories);
      setTransactions(storedTransactions);
      setBudgets(storedBudgets);
    } catch (err) {
      console.error('Failed to load Spendly database:', err);
      showToast('Database error loading records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Financial calculations
  const combinedSummary = calculateCombinedFinancialSummary(accounts, transactions);

  const selectedAccount = selectedAccountId
    ? accounts.find(a => a.id === selectedAccountId) || null
    : null;

  const selectedAccountSummary = selectedAccount
    ? calculateAccountBalance(selectedAccount, transactions)
    : null;

  const displayBalance = selectedAccountSummary
    ? selectedAccountSummary.currentBalance
    : combinedSummary.combinedBalance;

  const currencySymbol = settings.currencySymbol || '₹';

  const formatMoney = useCallback(
    (amount: number) => {
      return formatCurrency(amount, settings.currency, currencySymbol);
    },
    [settings.currency, currencySymbol]
  );

  // Modal open/close
  const openModal = (modal: string, payload?: any) => {
    setModalPayload(payload ?? null);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  // Transaction CRUD
  const createTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> => {
    const validAmt = validateAmount(data.amount);
    const now = new Date().toISOString();

    const record: Transaction = {
      ...data,
      amount: validAmt,
      transactionDate: data.transactionDate || now,
      createdAt: now,
      updatedAt: now,
    };

    const newId = await db.transactions.add(record);

    // Save recent counterparty suggestion if present
    if (data.counterpartyName?.trim() && !settings.recentCounterparties?.includes(data.counterpartyName.trim())) {
      const updatedList = [data.counterpartyName.trim(), ...(settings.recentCounterparties || [])].slice(0, 10);
      await db.settings.update('spendly_settings', { recentCounterparties: updatedList });
    }

    await loadData();
    return newId;
  };

  const updateTransaction = async (id: number, data: Partial<Transaction>): Promise<void> => {
    if (data.amount !== undefined) {
      data.amount = validateAmount(data.amount);
    }
    const updates = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.transactions.update(id, updates);
    await loadData();
    showToast('Transaction updated successfully', 'success');
  };

  const deleteTransaction = async (id: number): Promise<void> => {
    await db.transactions.delete(id);
    await loadData();
    showToast('Transaction deleted', 'info');
  };

  // Account CRUD
  const createAccount = async (
    data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `acc-${Date.now()}`;
    const newAccount: Account = {
      ...data,
      id,
      openingBalance: Number(data.openingBalance) || 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.accounts.add(newAccount);
    await loadData();
    showToast(`Account "${newAccount.name}" created`, 'success');
    return id;
  };

  const updateAccount = async (id: string, data: Partial<Account>): Promise<void> => {
    if (data.openingBalance !== undefined) {
      data.openingBalance = Number(data.openingBalance) || 0;
    }
    await db.accounts.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await loadData();
    showToast('Account details updated', 'success');
  };

  const archiveAccount = async (id: string): Promise<void> => {
    await db.accounts.update(id, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
    }
    await loadData();
    showToast('Account archived', 'info');
  };

  // Category CRUD
  const createCategory = async (
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `cat-custom-${Date.now()}`;
    const newCat: Category = {
      ...data,
      id,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.categories.add(newCat);
    await loadData();
    showToast(`Category "${newCat.name}" added`, 'success');
    return id;
  };

  const updateCategory = async (id: string, data: Partial<Category>): Promise<void> => {
    await db.categories.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await loadData();
    showToast('Category updated', 'success');
  };

  const deleteCategory = async (id: string, reassignToId?: string): Promise<void> => {
    if (reassignToId) {
      // Reassign affected transactions atomically
      const affected = await db.transactions.where('categoryId').equals(id).toArray();
      await db.transaction('rw', db.transactions, db.categories, async () => {
        for (const tx of affected) {
          if (tx.id) {
            await db.transactions.update(tx.id, { categoryId: reassignToId });
          }
        }
        await db.categories.delete(id);
      });
    } else {
      await db.categories.delete(id);
    }
    await loadData();
    showToast('Category deleted', 'info');
  };

  // Settings
  const updateSettings = async (updates: Partial<AppSettings>): Promise<void> => {
    const newSettings = { ...settings, ...updates };
    await db.settings.put(newSettings);
    setSettings(newSettings);
    showToast('Settings saved', 'success');
  };

  // Budgets
  const saveBudget = async (
    budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    if (existingId) {
      await db.budgets.update(existingId, {
        ...budgetData,
        updatedAt: now,
      });
    } else {
      const id = `budget-${Date.now()}`;
      await db.budgets.add({
        ...budgetData,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
    await loadData();
    showToast('Budget saved', 'success');
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await db.budgets.delete(id);
    await loadData();
    showToast('Budget removed', 'info');
  };

  return (
    <SpendlyContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        budgets,
        settings,
        isLoading,
        selectedAccountId,
        setSelectedAccountId,
        combinedSummary,
        selectedAccountSummary,
        displayBalance,
        currencySymbol,
        formatMoney,
        activeModal,
        openModal,
        closeModal,
        modalPayload,
        toasts,
        showToast,
        removeToast,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createAccount,
        updateAccount,
        archiveAccount,
        createCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        saveBudget,
        deleteBudget,
        refreshAllData: loadData,
      }}
    >
      {children}
    </SpendlyContext.Provider>
  );
};

export const useSpendly = (): SpendlyContextType => {
  const context = useContext(SpendlyContext);
  if (!context) {
    throw new Error('useSpendly must be used within a SpendlyProvider');
  }
  return context;
};
