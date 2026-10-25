import { db } from '../db';
import { Transaction, Account, Category, Budget, AppSettings } from '../types';
import { format } from 'date-fns';

export interface BackupData {
  version: number;
  appName: string;
  exportedAt: string;
  settings?: AppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

/**
 * Generate CSV string from transactions
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[]
): string {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const headers = [
    'ID',
    'Date & Time',
    'Type',
    'Amount',
    'Account',
    'Destination Account',
    'Category',
    'Subcategory',
    'Counterparty / Merchant',
    'Payment Method',
    'Description',
    'Reference ID',
  ];

  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map(tx => {
    const accName = accountMap.get(tx.accountId) || tx.accountId;
    const destAccName = tx.destinationAccountId
      ? (accountMap.get(tx.destinationAccountId) || tx.destinationAccountId)
      : '';
    const catName = categoryMap.get(tx.categoryId) || tx.categoryId;
    const counterpartyOrMerchant = tx.type === 'income'
      ? (tx.counterpartyName || '')
      : (tx.merchantName || '');

    return [
      escapeCSV(tx.id),
      escapeCSV(tx.transactionDate),
      escapeCSV(tx.type),
      escapeCSV(tx.amount),
      escapeCSV(accName),
      escapeCSV(destAccName),
      escapeCSV(catName),
      escapeCSV(tx.subcategoryId || ''),
      escapeCSV(counterpartyOrMerchant),
      escapeCSV(tx.paymentMethod || ''),
      escapeCSV(tx.description || ''),
      escapeCSV(tx.referenceId || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full JSON Backup
 */
export async function createFullBackup(): Promise<string> {
  const [accounts, transactions, categories, budgets, settingsList] = await Promise.all([
    db.accounts.toArray(),
    db.transactions.toArray(),
    db.categories.toArray(),
    db.budgets.toArray(),
    db.settings.toArray(),
  ]);

  const backup: BackupData = {
    version: 1,
    appName: 'Spendly',
    exportedAt: new Date().toISOString(),
    settings: settingsList[0],
    accounts,
    categories,
    transactions,
    budgets,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Validate backup data before importing
 */
export function validateBackupFile(content: string): { isValid: boolean; error?: string; data?: BackupData } {
  try {
    const parsed = JSON.parse(content) as BackupData;
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'File does not contain valid JSON data.' };
    }
    if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
      return { isValid: false, error: 'Backup is missing essential accounts or transactions data.' };
    }
    return { isValid: true, data: parsed };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown parsing error';
    return { isValid: false, error: `Invalid JSON format: ${msg}` };
  }
}

/**
 * Restore backup with choice of replace or merge
 */
export async function restoreBackup(
  backup: BackupData,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ accountsRestored: number; transactionsRestored: number }> {
  return await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.settings], async () => {
    if (mode === 'replace') {
      await db.accounts.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      if (backup.categories?.length) {
        await db.categories.clear();
      }
    }

    if (backup.settings) {
      await db.settings.put(backup.settings);
    }

    if (backup.categories?.length) {
      await db.categories.bulkPut(backup.categories);
    }

    if (backup.accounts?.length) {
      await db.accounts.bulkPut(backup.accounts);
    }

    if (backup.budgets?.length) {
      await db.budgets.bulkPut(backup.budgets);
    }

    if (backup.transactions?.length) {
      if (mode === 'replace') {
        await db.transactions.bulkPut(backup.transactions);
      } else {
        // Merge: avoid key collision if auto-increment IDs clash
        const existingTx = await db.transactions.toArray();
        const existingRefs = new Set(existingTx.map(t => `${t.transactionDate}_${t.amount}_${t.accountId}`));
        const toAdd = backup.transactions.filter(
          t => !existingRefs.has(`${t.transactionDate}_${t.amount}_${t.accountId}`)
        ).map(t => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = t;
          return rest as Transaction;
        });
        if (toAdd.length > 0) {
          await db.transactions.bulkAdd(toAdd);
        }
      }
    }

    return {
      accountsRestored: backup.accounts.length,
      transactionsRestored: backup.transactions.length,
    };
  });
}

/**
 * Clear all transaction history while preserving accounts, categories and settings
 */
export async function clearTransactionHistory(): Promise<void> {
  await db.transactions.clear();
}

/**
 * Factory reset application to blank slate
 */
export async function factoryResetApplication(): Promise<void> {
  await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.settings], async () => {
    await db.accounts.clear();
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.settings.clear();
  });
}
