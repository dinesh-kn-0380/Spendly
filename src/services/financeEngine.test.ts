import { describe, it, expect } from 'vitest';
import {
  calculateAccountBalance,
  calculateCombinedFinancialSummary,
  calculateIncomeForPeriod,
  calculateExpensesForPeriod,
  calculateCategoryBreakdown,
  checkSufficientBalance,
  roundToTwoDecimals,
  validateAmount,
} from './financeEngine';
import { Account, Transaction, Category } from '../types';

describe('Finance Accounting Engine Scenarios (Section 21)', () => {
  const primaryAccount: Account = {
    id: 'acc-primary',
    name: 'Primary Account',
    type: 'bank',
    openingBalance: 10000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const cashWallet: Account = {
    id: 'acc-cash',
    name: 'Cash Wallet',
    type: 'cash',
    openingBalance: 1000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('Scenario 1: Initial balance starts at opening balance', () => {
    const summary = calculateAccountBalance(primaryAccount, []);
    expect(summary.currentBalance).toBe(10000);
  });

  it('Scenario 2: Add money (+₹2,000) increases balance to ₹12,000', () => {
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'income',
        amount: 2000,
        categoryId: 'cat-inc-allowance',
        accountId: 'acc-primary',
        counterpartyName: 'Dad',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
    ];

    const summary = calculateAccountBalance(primaryAccount, transactions);
    expect(summary.currentBalance).toBe(12000);
    expect(summary.totalIncome).toBe(2000);
  });

  it('Scenario 3: Add expense (-₹500) reduces balance to ₹11,500', () => {
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'income',
        amount: 2000,
        categoryId: 'cat-inc-allowance',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
      {
        id: 2,
        type: 'expense',
        amount: 500,
        categoryId: 'cat-food',
        subcategoryId: 'Lunch',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T13:00:00.000Z',
        createdAt: '2026-10-25T13:00:00.000Z',
        updatedAt: '2026-10-25T13:00:00.000Z',
      },
    ];

    const summary = calculateAccountBalance(primaryAccount, transactions);
    expect(summary.currentBalance).toBe(11500);
    expect(summary.totalExpenses).toBe(500);
  });

  it('Scenario 4: Edit expense from ₹500 to ₹700 yields balance of ₹11,300', () => {
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'income',
        amount: 2000,
        categoryId: 'cat-inc-allowance',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
      {
        id: 2,
        type: 'expense',
        amount: 700, // Edited to 700
        categoryId: 'cat-food',
        subcategoryId: 'Lunch',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T13:00:00.000Z',
        createdAt: '2026-10-25T13:00:00.000Z',
        updatedAt: '2026-10-25T14:00:00.000Z',
      },
    ];

    const summary = calculateAccountBalance(primaryAccount, transactions);
    expect(summary.currentBalance).toBe(11300);
    expect(summary.totalExpenses).toBe(700);
  });

  it('Scenario 5: Delete expense reverses deduction and restores balance to ₹12,000', () => {
    // Only income transaction remains after deleting expense
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'income',
        amount: 2000,
        categoryId: 'cat-inc-allowance',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
    ];

    const summary = calculateAccountBalance(primaryAccount, transactions);
    expect(summary.currentBalance).toBe(12000);
    expect(summary.totalExpenses).toBe(0);
  });

  it('Scenario 6: Record a ₹300 refund yields expected balance of ₹12,300', () => {
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'income',
        amount: 2000,
        categoryId: 'cat-inc-allowance',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
      {
        id: 3,
        type: 'refund',
        amount: 300,
        categoryId: 'cat-inc-refund',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T15:00:00.000Z',
        createdAt: '2026-10-25T15:00:00.000Z',
        updatedAt: '2026-10-25T15:00:00.000Z',
      },
    ];

    const summary = calculateAccountBalance(primaryAccount, transactions);
    expect(summary.currentBalance).toBe(12300);
    expect(summary.totalRefunds).toBe(300);
  });

  it('Scenario 7: Internal transfer (₹1,000) between accounts leaves combined balance unchanged', () => {
    // Primary opening: 10,000. Cash opening: 1,000. Combined initial = 11,000.
    const transferTx: Transaction = {
      id: 4,
      type: 'transfer',
      amount: 1000,
      categoryId: 'transfer',
      accountId: 'acc-primary', // source
      destinationAccountId: 'acc-cash', // destination
      transactionDate: '2026-10-25T16:00:00.000Z',
      createdAt: '2026-10-25T16:00:00.000Z',
      updatedAt: '2026-10-25T16:00:00.000Z',
    };

    const primaryBal = calculateAccountBalance(primaryAccount, [transferTx]);
    const cashBal = calculateAccountBalance(cashWallet, [transferTx]);

    expect(primaryBal.currentBalance).toBe(9000); // 10000 - 1000
    expect(cashBal.currentBalance).toBe(2000); // 1000 + 1000

    const combined = calculateCombinedFinancialSummary([primaryAccount, cashWallet], [transferTx]);
    expect(combined.combinedBalance).toBe(11000); // exactly unchanged!
    expect(combined.totalIncome).toBe(0); // internal transfer is NOT income
    expect(combined.totalExpenses).toBe(0); // internal transfer is NOT expense
  });

  it('Scenario 8: Insufficient balance warning properly detects deficit', () => {
    const check1 = checkSufficientBalance(primaryAccount, [], 15000);
    expect(check1.hasSufficientBalance).toBe(false);
    expect(check1.projectedBalance).toBe(-5000);

    const check2 = checkSufficientBalance(primaryAccount, [], 4000);
    expect(check2.hasSufficientBalance).toBe(true);
    expect(check2.projectedBalance).toBe(6000);
  });

  it('Scenario 9: Category totals sum exactly and provide subcategory breakdown', () => {
    const categories: Category[] = [
      {
        id: 'cat-food',
        name: 'Food',
        type: 'expense',
        icon: 'Utensils',
        color: '#f97316',
        isDefault: true,
        subcategories: ['Lunch', 'Dinner'],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'expense',
        amount: 250,
        categoryId: 'cat-food',
        subcategoryId: 'Lunch',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T12:00:00.000Z',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        type: 'expense',
        amount: 450,
        categoryId: 'cat-food',
        subcategoryId: 'Dinner',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T20:00:00.000Z',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const breakdown = calculateCategoryBreakdown(transactions, categories);
    expect(breakdown.length).toBe(1);
    expect(breakdown[0].totalSpent).toBe(700);
    expect(breakdown[0].percentage).toBe(100);
    expect(breakdown[0].subcategories).toEqual(
      expect.arrayContaining([
        { name: 'Lunch', totalSpent: 250, count: 1 },
        { name: 'Dinner', totalSpent: 450, count: 1 },
      ])
    );
  });

  it('Scenario 10: Date filtering includes only transactions within selected range', () => {
    const transactions: Transaction[] = [
      {
        id: 1,
        type: 'expense',
        amount: 100,
        categoryId: 'cat-food',
        accountId: 'acc-primary',
        transactionDate: '2026-10-01T10:00:00.000Z',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        type: 'expense',
        amount: 200,
        categoryId: 'cat-food',
        accountId: 'acc-primary',
        transactionDate: '2026-10-15T10:00:00.000Z',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 3,
        type: 'expense',
        amount: 300,
        categoryId: 'cat-food',
        accountId: 'acc-primary',
        transactionDate: '2026-10-25T10:00:00.000Z',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const oct1To10 = calculateExpensesForPeriod(
      transactions,
      new Date('2026-10-01'),
      new Date('2026-10-10')
    );
    expect(oct1To10).toBe(100);

    const oct10To20 = calculateExpensesForPeriod(
      transactions,
      new Date('2026-10-10'),
      new Date('2026-10-20')
    );
    expect(oct10To20).toBe(200);

    const oct20To30 = calculateExpensesForPeriod(
      transactions,
      new Date('2026-10-20'),
      new Date('2026-10-30')
    );
    expect(oct20To30).toBe(300);
  });

  it('Validation: Disallows zero and negative amounts', () => {
    expect(() => validateAmount(0)).toThrow();
    expect(() => validateAmount(-50)).toThrow();
    expect(() => validateAmount('abc')).toThrow();
    expect(validateAmount('150.55')).toBe(150.55);
  });
});
