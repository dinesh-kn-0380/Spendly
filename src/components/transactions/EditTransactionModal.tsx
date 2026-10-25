import React, { useState, useEffect } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { PAYMENT_METHODS } from '../../data/defaults';
import { Transaction, PaymentMethod } from '../../types';
import { Check, Calendar, CreditCard, Tag, Wallet, FileText, Hash } from 'lucide-react';

export const EditTransactionModal: React.FC = () => {
  const {
    activeModal,
    modalPayload,
    closeModal,
    accounts,
    categories,
    updateTransaction,
    currencySymbol,
    showToast,
  } = useSpendly();

  const isOpen = activeModal === 'edit-transaction' && !!modalPayload;
  const tx = modalPayload as Transaction | undefined;

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [counterpartyOrMerchant, setCounterpartyOrMerchant] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tx) {
      setAmount(tx.amount.toString());
      setCategoryId(tx.categoryId);
      setSubcategoryId(tx.subcategoryId || '');
      setCounterpartyOrMerchant(tx.type === 'income' ? (tx.counterpartyName || '') : (tx.merchantName || ''));
      setAccountId(tx.accountId);
      setDestinationAccountId(tx.destinationAccountId || '');
      setPaymentMethod((tx.paymentMethod as PaymentMethod) || 'UPI');
      try {
        const dt = new Date(tx.transactionDate);
        setTransactionDate(new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      } catch {
        setTransactionDate(new Date().toISOString().slice(0, 16));
      }
      setDescription(tx.description || '');
      setReferenceId(tx.referenceId || '');
    }
  }, [tx]);

  if (!isOpen || !tx) return null;

  const isIncome = tx.type === 'income' || tx.type === 'refund';
  const isTransfer = tx.type === 'transfer';
  const filteredCategories = categories.filter(c => isIncome ? c.type === 'income' : c.type === 'expense');
  const selectedCat = categories.find(c => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tx.id || isSubmitting) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter an amount greater than 0', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const updates: Partial<Transaction> = {
        amount: numAmount,
        accountId,
        categoryId: isTransfer ? 'transfer' : categoryId,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
      };

      if (isIncome) {
        updates.counterpartyName = counterpartyOrMerchant.trim() || undefined;
      } else if (!isTransfer) {
        updates.merchantName = counterpartyOrMerchant.trim() || undefined;
      }

      if (isTransfer) {
        updates.destinationAccountId = destinationAccountId;
      }

      await updateTransaction(tx.id, updates);
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update transaction';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Edit Transaction"
      description="Update transaction details and recalculate balances"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Counterparty / Merchant */}
        {!isTransfer && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              {isIncome ? 'Received From (Sender)' : 'Merchant / Recipient'}
            </label>
            <input
              type="text"
              value={counterpartyOrMerchant}
              onChange={e => setCounterpartyOrMerchant(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        )}

        {/* Category & Subcategory */}
        {!isTransfer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Category</span>
              </label>
              <select
                value={categoryId}
                onChange={e => {
                  setCategoryId(e.target.value);
                  const found = categories.find(c => c.id === e.target.value);
                  setSubcategoryId(found?.subcategories?.[0] || '');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                onChange={e => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">General</option>
                {selectedCat?.subcategories?.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Account and destination if transfer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isTransfer ? 'Source Account' : 'Account'}</span>
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {isTransfer ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                <span>Destination Account</span>
              </label>
              <select
                value={destinationAccountId}
                onChange={e => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date & Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Note</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Update Transaction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
