import React from 'react';
import { Transaction, Account, Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ArrowRightLeft } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  currencySymbol: string;
  onClick: (tx: Transaction) => void;
  showAccountBadge?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction: tx,
  accounts,
  categories,
  currencySymbol,
  onClick,
  showAccountBadge = false,
}) => {
  const isIncome = tx.type === 'income' || tx.type === 'refund';
  const isTransfer = tx.type === 'transfer';

  const category = categories.find(c => c.id === tx.categoryId);
  const account = accounts.find(a => a.id === tx.accountId);
  const destAccount = tx.destinationAccountId
    ? accounts.find(a => a.id === tx.destinationAccountId)
    : null;

  // Title calculation
  const title = isIncome
    ? (tx.counterpartyName || 'Money Received')
    : isTransfer
    ? `Transfer → ${destAccount?.name || 'Account'}`
    : (tx.merchantName || category?.name || 'Expense');

  // Subtitle
  const subtitleParts: string[] = [];
  if (isTransfer) {
    if (tx.description) subtitleParts.push(tx.description);
  } else {
    if (tx.subcategoryId) subtitleParts.push(tx.subcategoryId);
    else if (category?.name && title !== category.name) subtitleParts.push(category.name);
    if (tx.paymentMethod) subtitleParts.push(tx.paymentMethod);
  }
  const subtitle = subtitleParts.join(' · ') || tx.description || '';

  // Formatted Time/Date
  const timeFormatted = (() => {
    try {
      const date = parseISO(tx.transactionDate);
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'dd MMM, h:mm a');
    } catch {
      return tx.transactionDate;
    }
  })();

  const iconName = isTransfer ? 'ArrowRightLeft' : (category?.icon || 'Tag');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(tx)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(tx);
        }
      }}
      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-subtle active:scale-[0.99] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Category Icon Badge */}
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            isIncome
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
              : isTransfer
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700'
          }`}
          style={{
            color: !isIncome && !isTransfer && category?.color ? category.color : undefined,
          }}
        >
          {isTransfer ? (
            <ArrowRightLeft className="w-5 h-5" />
          ) : (
            <CategoryIcon name={iconName} className="w-5 h-5" />
          )}
        </div>

        {/* Text information */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white transition-colors">
              {title}
            </h4>
            {showAccountBadge && account && (
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium shrink-0">
                {account.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {subtitle && <span className="text-zinc-300 dark:text-zinc-700 shrink-0">•</span>}
            <span className="shrink-0 text-[11px]">{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Amount column */}
      <div className="text-right shrink-0 pl-3">
        <div
          className={`text-sm sm:text-base font-bold tracking-tight ${
            isIncome
              ? 'text-emerald-600 dark:text-emerald-400'
              : isTransfer
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {tx.paymentMethod && (
          <span className="text-[10px] text-zinc-400 font-medium">
            {tx.paymentMethod}
          </span>
        )}
      </div>
    </div>
  );
};
