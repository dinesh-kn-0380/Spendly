import React, { useState, useEffect } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { CategoryIcon } from '../common/CategoryIcon';
import { PAYMENT_METHODS } from '../../data/defaults';
import { PaymentMethod } from '../../types';
import { checkSufficientBalance } from '../../services/financeEngine';
import { ArrowUpRight, AlertTriangle, Calendar, CreditCard, FileText, Hash, Store, Wallet } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    accounts,
    categories,
    transactions,
    selectedAccountId,
    createTransaction,
    currencySymbol,
    settings,
    showToast,
  } = useSpendly();

  const isOpen = activeModal === 'add-expense';

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const defaultCatId = expenseCategories[0]?.id || 'cat-food';
  const defaultAccId = selectedAccountId || accounts[0]?.id || '';

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCatId);
  const [subcategoryId, setSubcategoryId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [accountId, setAccountId] = useState(defaultAccId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionDate, setTransactionDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default account and category when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetAccId = selectedAccountId || (accounts.length > 0 ? accounts[0].id : '');
      if (targetAccId && (!accountId || !accounts.some(a => a.id === accountId))) {
        setAccountId(targetAccId);
      }
      if (expenseCategories.length > 0 && (!categoryId || !expenseCategories.some(c => c.id === categoryId))) {
        setCategoryId(expenseCategories[0].id);
      }
    }
  }, [isOpen, selectedAccountId, accounts, accountId, expenseCategories, categoryId]);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Update default subcategory when category changes
  useEffect(() => {
    if (availableSubcategories.length > 0 && !subcategoryId) {
      setSubcategoryId(availableSubcategories[0]);
    }
  }, [categoryId, availableSubcategories, subcategoryId]);

  if (!isOpen) return null;

  // Balance sufficiency check
  const selectedAccount = accounts.find(a => a.id === accountId);
  const numAmount = parseFloat(amount) || 0;
  const balanceCheck = selectedAccount
    ? checkSufficientBalance(selectedAccount, transactions, numAmount)
    : null;

  const isDeficit = balanceCheck ? !balanceCheck.hasSufficientBalance && numAmount > 0 : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (numAmount <= 0) {
      showToast('Please enter an amount greater than 0', 'error');
      return;
    }

    if (!accountId) {
      showToast('Please select an account', 'error');
      return;
    }

    if (isDeficit && !settings.allowNegativeBalance) {
      showToast('Expense blocked: Account does not have enough balance.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransaction({
        type: 'expense',
        amount: numAmount,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        accountId,
        merchantName: merchantName.trim() || undefined,
        paymentMethod,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
      });

      showToast(`-${currencySymbol}${numAmount.toLocaleString()} recorded`, 'success');
      closeModal();
      // Reset form
      setAmount('');
      setMerchantName('');
      setDescription('');
      setReferenceId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding expense';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Add Expense"
      description="Quickly record money spent"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prominent Amount Input */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl text-center">
          <label className="block text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wider mb-1">
            Amount Spent
          </label>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 mr-1.5">
              -{currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-48 text-3xl font-extrabold bg-transparent text-rose-950 dark:text-rose-100 focus:outline-none placeholder:text-rose-300 dark:placeholder:text-rose-800 text-center"
            />
          </div>
        </div>

        {/* Insufficient Balance Warning Banner */}
        {isDeficit && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 animate-slide-up">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Insufficient Balance Warning</p>
              <p className="mt-0.5 opacity-90">
                Current available: {currencySymbol}{balanceCheck?.currentBalance.toLocaleString()}. Recording this expense will put {selectedAccount?.name} into a deficit of {currencySymbol}{Math.abs(balanceCheck?.projectedBalance || 0).toLocaleString()}.
              </p>
            </div>
          </div>
        )}

        {/* Category Horizontal Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Category
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {expenseCategories.map(cat => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSubcategoryId(cat.subcategories?.[0] || '');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Chips */}
        {availableSubcategories.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Subcategory
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSubcategories.map(sub => {
                const isSelected = subcategoryId === sub;
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => setSubcategoryId(sub)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Account Used & Merchant Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                <span>Account Used</span>
              </span>
              {balanceCheck && (
                <span className="text-[10px] text-zinc-500">
                  Bal: {currencySymbol}{balanceCheck.currentBalance.toLocaleString()}
                </span>
              )}
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-zinc-400" />
              <span>Merchant / Place</span>
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={e => setMerchantName(e.target.value)}
              placeholder="e.g. Swiggy, Uber, Supermarket"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Payment Method & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
              <span>Payment Method</span>
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Description & Reference ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Note (Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Lunch with team"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ref ID (Optional)</span>
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={e => setReferenceId(e.target.value)}
              placeholder="e.g. UPI-398242"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Save Expense (-{amount ? `${currencySymbol}${amount}` : 'Expense'})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
