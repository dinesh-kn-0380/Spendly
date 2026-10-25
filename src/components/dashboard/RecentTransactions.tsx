import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { TransactionItem } from '../transactions/TransactionItem';
import { Transaction } from '../../types';
import { ArrowRight, Receipt } from 'lucide-react';

interface RecentTransactionsProps {
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onViewAll }) => {
  const {
    transactions,
    accounts,
    categories,
    selectedAccountId,
    currencySymbol,
    openModal,
  } = useSpendly();

  // Filter transactions for current selected account if one is chosen
  const filtered = selectedAccountId
    ? transactions.filter(t => t.accountId === selectedAccountId || t.destinationAccountId === selectedAccountId)
    : transactions;

  const recentList = filtered.slice(0, 7);

  const handleTransactionClick = (tx: Transaction) => {
    openModal('transaction-detail', tx);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Recent Transactions
        </h3>
        {filtered.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recentList.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No transactions yet
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Use the buttons above to record your first expense or add money received.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentList.map(tx => (
            <TransactionItem
              key={tx.id || `${tx.transactionDate}_${tx.amount}`}
              transaction={tx}
              accounts={accounts}
              categories={categories}
              currencySymbol={currencySymbol}
              onClick={handleTransactionClick}
              showAccountBadge={!selectedAccountId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
