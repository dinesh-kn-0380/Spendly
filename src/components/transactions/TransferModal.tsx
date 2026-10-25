import React, { useState, useEffect } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { calculateAccountBalance } from '../../services/financeEngine';
import { ArrowRightLeft, ArrowRight, AlertTriangle, Calendar, FileText } from 'lucide-react';

export const TransferModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    accounts,
    transactions,
    createTransaction,
    currencySymbol,
    showToast,
  } = useSpendly();

  const isOpen = activeModal === 'transfer';

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
      if (!toAccountId) setToAccountId(accounts[1].id);
    }
  }, [isOpen, accounts, fromAccountId, toAccountId]);

  if (!isOpen) return null;

  if (accounts.length < 2) {
    return (
      <Modal isOpen={isOpen} onClose={closeModal} title="Transfer Money" maxWidth="sm">
        <div className="text-center py-6">
          <ArrowRightLeft className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Multiple Accounts Needed
          </h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto">
            Internal transfer moves money between two of your accounts. Please add another account in Settings &gt; Manage Accounts first.
          </p>
          <button
            onClick={closeModal}
            className="mt-6 px-4 py-2 text-sm font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >
            Got it
          </button>
        </div>
      </Modal>
    );
  }

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);

  const fromSummary = fromAccount ? calculateAccountBalance(fromAccount, transactions) : null;
  const toSummary = toAccount ? calculateAccountBalance(toAccount, transactions) : null;

  const numAmount = parseFloat(amount) || 0;
  const hasInsufficient = fromSummary ? fromSummary.currentBalance < numAmount : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (numAmount <= 0) {
      showToast('Please enter an amount greater than 0', 'error');
      return;
    }

    if (fromAccountId === toAccountId) {
      showToast('Source and destination accounts must be different', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransaction({
        type: 'transfer',
        amount: numAmount,
        categoryId: 'transfer',
        accountId: fromAccountId,
        destinationAccountId: toAccountId,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || `Transfer to ${toAccount?.name}`,
      });

      showToast(`Transferred ${currencySymbol}${numAmount.toLocaleString()} successfully!`, 'success');
      closeModal();
      setAmount('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Transfer Between Accounts"
      description="Move funds between your accounts without affecting net income or expense"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transfer Header Graphic */}
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex-1 text-center">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              From (Source)
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
              {fromAccount?.name}
            </span>
            <span className="text-[11px] text-zinc-500">
              {currencySymbol}{fromSummary?.currentBalance.toLocaleString()}
            </span>
          </div>

          <div className="p-2 rounded-full bg-indigo-600 text-white shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 text-center">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              To (Destination)
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
              {toAccount?.name}
            </span>
            <span className="text-[11px] text-zinc-500">
              {currencySymbol}{toSummary?.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Transfer Amount
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
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Insufficient Warning */}
        {hasInsufficient && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Warning: Transfer amount exceeds current balance in {fromAccount?.name}.</span>
          </div>
        )}

        {/* Source & Destination Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Source Account
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === toAccountId}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Destination Account
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Transfer Date & Time</span>
          </label>
          <input
            type="datetime-local"
            value={transactionDate}
            onChange={e => setTransactionDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Note (Optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. ATM withdrawal for weekend"
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer {amount ? `${currencySymbol}${amount}` : 'Funds'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
