import Dexie, { type Table } from 'dexie';
import { Transaction, Account, Category, Budget, AppSettings } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SETTINGS } from '../data/defaults';

export class SpendlyDatabase extends Dexie {
  transactions!: Table<Transaction, number>;
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('SpendlyDB');

    this.version(1).stores({
      transactions: '++id, type, amount, categoryId, subcategoryId, accountId, destinationAccountId, counterpartyName, merchantName, transactionDate, createdAt',
      accounts: 'id, name, type, openingBalance, isArchived, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      budgets: 'id, categoryId, period, createdAt',
      settings: 'id',
    });
  }
}

export const db = new SpendlyDatabase();

// Seed initial database state if missing
export async function initializeDatabase(): Promise<void> {
  try {
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.put(DEFAULT_SETTINGS);
    }

    const categoriesCount = await db.categories.count();
    if (categoriesCount === 0) {
      const now = new Date().toISOString();
      const allDefaultCats: Category[] = [
        ...DEFAULT_EXPENSE_CATEGORIES.map(c => ({ ...c, createdAt: now, updatedAt: now })),
        ...DEFAULT_INCOME_CATEGORIES.map(c => ({ ...c, createdAt: now, updatedAt: now })),
      ];
      await db.categories.bulkPut(allDefaultCats);
    }
  } catch (error) {
    console.error('Failed to initialize database defaults:', error);
  }
}
