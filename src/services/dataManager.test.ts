import { describe, it, expect } from 'vitest';
import { exportTransactionsToCSV, validateBackupFile } from './dataManager';
import { Transaction, Account, Category } from '../types';

describe('Data Management & Backup Validation', () => {
  const mockAccount: Account = {
    id: 'acc-1',
    name: 'Primary Bank',
    type: 'bank',
    openingBalance: 5000,
    currency: 'INR',
    createdAt: '',
    updatedAt: '',
  };

  const mockCategory: Category = {
    id: 'cat-food',
    name: 'Food',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316',
    isDefault: true,
    subcategories: ['Lunch'],
    createdAt: '',
    updatedAt: '',
  };

  const mockTransaction: Transaction = {
    id: 101,
    type: 'expense',
    amount: 350.5,
    categoryId: 'cat-food',
    subcategoryId: 'Lunch',
    accountId: 'acc-1',
    merchantName: 'Subway, "Downtown"',
    paymentMethod: 'UPI',
    transactionDate: '2026-10-25T13:45:00.000Z',
    createdAt: '',
    updatedAt: '',
  };

  it('exports transactions to valid CSV with escaped quotes and proper headers', () => {
    const csv = exportTransactionsToCSV([mockTransaction], [mockAccount], [mockCategory]);
    expect(csv).toContain('ID,Date & Time,Type,Amount');
    expect(csv).toContain('"101"');
    expect(csv).toContain('"350.5"');
    expect(csv).toContain('"Primary Bank"');
    expect(csv).toContain('"Food"');
    expect(csv).toContain('"Subway, ""Downtown"""'); // escaped quotes
  });

  it('validates backup JSON correctly and rejects malformed content', () => {
    const validJson = JSON.stringify({
      version: 1,
      appName: 'Spendly',
      accounts: [mockAccount],
      categories: [mockCategory],
      transactions: [mockTransaction],
      budgets: [],
    });

    const validResult = validateBackupFile(validJson);
    expect(validResult.isValid).toBe(true);
    expect(validResult.data?.accounts.length).toBe(1);

    const malformedResult = validateBackupFile('{"invalid json');
    expect(malformedResult.isValid).toBe(false);

    const missingDataResult = validateBackupFile(JSON.stringify({ someKey: 123 }));
    expect(missingDataResult.isValid).toBe(false);
  });
});
