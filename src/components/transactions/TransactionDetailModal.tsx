import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types';
import { format, parseISO } from 'date-fns';
import { Edit2, Copy, Trash2, CheckCircle2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

export const TransactionDetailModal: React.FC = () => {
  const {
    activeModal,
    modalPayload,
    closeModal,
    openModal,
    accounts,
    categories,
    deleteTransaction,
    currencySymbol,
  } = useSpendly();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isOpen = activeModal === 'transaction-detail' && !!modalPayload;
  const tx = modalPayload as Transaction | undefined;

  if (!isOpen || !tx) return null;

  const isIncome = tx.type === 'income' || tx.type === 'refund';
  const isTransfer = tx.type === 'transfer';

  const category = categories.find(c => c.id === tx.categoryId);
  const account = accounts.find(a => a.id === tx.accountId);
  const destAccount = tx.destinationAccountId
    ? accounts.find(a => a.id === tx.destinationAccountId)
    : null;

  const formattedDate = (() => {
    try {
      return format(parseISO(tx.transactionDate), 'dd MMMM yyyy, hh:mm a');
    } catch {
      return tx.transactionDate;
    }
  })();

  const titleName = isIncome
    ? (tx.counterpartyName || 'Money Received')
    : isTransfer
    ? `Transfer to ${destAccount?.name || 'Account'}`
    : (tx.merchantName || category?.name || 'Expense');

  const handleDelete = async () => {
    if (tx.id) {
      await deleteTransaction(tx.id);
      closeModal();
    }
  };

  const handleDuplicate = () => {
    closeModal();
    if (isIncome) {
      openModal('add-money', {
        amount: tx.amount,
        counterpartyName: tx.counterpartyName,
        categoryId: tx.categoryId,
        accountId: tx.accountId,
        paymentMethod: tx.paymentMethod,
        description: tx.description,
      });
    } else if (isTransfer) {
      openModal('transfer', {
        amount: tx.amount,
        fromAccountId: tx.accountId,
        toAccountId: tx.destinationAccountId,
        description: tx.description,
      });
    } else {
      openModal('add-expense', {
        amount: tx.amount,
        merchantName: tx.merchantName,
        categoryId: tx.categoryId,
        subcategoryId: tx.subcategoryId,
        accountId: tx.accountId,
        paymentMethod: tx.paymentMethod,
        description: tx.description,
      });
    }
  };

  const handleEdit = () => {
    closeModal();
    openModal('edit-transaction', tx);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Transaction Details"
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Main GPay-style amount banner */}
          <div className="text-center pt-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-sm ${
                isIncome
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : isTransfer
                  ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="w-8 h-8" />
              ) : isTransfer ? (
                <ArrowRightLeft className="w-8 h-8" />
              ) : (
                <ArrowUpRight className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {titleName}
            </h3>

            <div
              className={`text-3xl font-extrabold tracking-tight mt-1 ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isTransfer
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isIncome ? '+' : isTransfer ? '' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
              <span className="text-zinc-500">Date & Time</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formattedDate}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
              <span className="text-zinc-500">Category</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {category && <CategoryIcon name={category.icon} className="w-3.5 h-3.5" />}
                <span>{category?.name || (isTransfer ? 'Transfer' : 'Uncategorized')}</span>
                {tx.subcategoryId && <span className="text-zinc-400 font-normal">({tx.subcategoryId})</span>}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
              <span className="text-zinc-500">Account</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {account?.name || tx.accountId}
                {destAccount && ` → ${destAccount.name}`}
              </span>
            </div>

            {tx.paymentMethod && (
              <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
                <span className="text-zinc-500">Payment Method</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{tx.paymentMethod}</span>
              </div>
            )}

            {tx.description && (
              <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
                <span className="text-zinc-500">Note</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[60%] text-right">{tx.description}</span>
              </div>
            )}

            {tx.referenceId && (
              <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/60">
                <span className="text-zinc-500">Reference / UTR</span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{tx.referenceId}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Edit, Duplicate, Delete */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={handleEdit}
              className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={handleDuplicate}
              className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Transaction?"
        message="This will permanently delete this record and recalculate your account balance immediately. This action cannot be undone."
        confirmLabel="Delete Transaction"
        isDestructive={true}
      />
    </>
  );
};
