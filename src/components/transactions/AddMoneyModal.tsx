import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { PAYMENT_METHODS } from '../../data/defaults';
import { PaymentMethod } from '../../types';
import { ArrowDownLeft, Calendar, Tag, Wallet, CreditCard, FileText, Hash, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddMoneyModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    accounts,
    categories,
    selectedAccountId,
    createTransaction,
    currencySymbol,
    settings,
    showToast,
  } = useSpendly();

  const isOpen = activeModal === 'add-money';

  const incomeCategories = categories.filter(c => c.type === 'income');

  const [amount, setAmount] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionDate, setTransactionDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // 1. Account sync
      const targetAccId = selectedAccountId || (accounts.length > 0 ? accounts[0].id : '');
      if (targetAccId && (!accountId || !accounts.some(a => a.id === accountId))) {
        setAccountId(targetAccId);
      }
      // 2. Category sync
      if (incomeCategories.length > 0 && (!categoryId || !incomeCategories.some(c => c.id === categoryId))) {
        setCategoryId(incomeCategories[0].id);
      }
    }
  }, [isOpen, selectedAccountId, accounts, accountId, incomeCategories, categoryId]);

  if (!isOpen) return null;

  const currentCategory = categories.find(c => c.id === categoryId);
  const quickSuggestions = settings.recentCounterparties || ['Dad', 'Mom', 'Anamika', 'Client'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    if (!accountId) {
      showToast('Please select a destination account', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransaction({
        type: 'income',
        amount: numAmount,
        categoryId,
        subcategoryId: currentCategory?.subcategories?.[0] || 'General',
        accountId,
        counterpartyName: counterpartyName.trim() || undefined,
        paymentMethod,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
      });

      // Celebration confetti for money received!
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#10b981', '#34d399', '#f59e0b'],
      });

      showToast(`+${currencySymbol}${numAmount.toLocaleString()} added successfully!`, 'success');
      closeModal();
      // Reset form
      setAmount('');
      setCounterpartyName('');
      setDescription('');
      setReferenceId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding money';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Add Money"
      description="Record income received and increase your balance"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prominent Amount Input */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl text-center">
          <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Amount Received
          </label>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">
              +{currencySymbol}
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
              className="w-48 text-3xl font-extrabold bg-transparent text-emerald-950 dark:text-emerald-100 focus:outline-none placeholder:text-emerald-300 dark:placeholder:text-emerald-800 text-center"
            />
          </div>
        </div>

        {/* Sender Name with Quick Suggestions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Received From (Sender)
          </label>
          <input
            type="text"
            value={counterpartyName}
            onChange={e => setCounterpartyName(e.target.value)}
            placeholder="e.g. Dad, Anamika, Company Payroll"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {quickSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-zinc-400 shrink-0">Quick suggestions:</span>
              {quickSuggestions.map(name => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setCounterpartyName(name)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                    counterpartyName === name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category & Destination Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Category</span>
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {incomeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-zinc-400" />
              <span>Destination Account</span>
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
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
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Description & Reference ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Description (Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Monthly allowance"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ref / UTR ID (Optional)</span>
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={e => setReferenceId(e.target.value)}
              placeholder="e.g. UPI-92384729"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Save Credit (+{amount ? `${currencySymbol}${amount}` : 'Money'})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
