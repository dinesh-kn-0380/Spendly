import React from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Eye, EyeOff, Wallet, Layers, ChevronDown } from 'lucide-react';

export const BalanceCard: React.FC = () => {
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    displayBalance,
    selectedAccountSummary,
    currencySymbol,
    settings,
    updateSettings,
  } = useSpendly();

  const isHidden = settings.isBalanceHidden;

  const toggleHide = () => {
    updateSettings({ isBalanceHidden: !isHidden });
  };

  const isCombined = selectedAccountId === null;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-card">
      {/* Background subtle glow effect */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top row: Label + Eye visibility toggle + Account selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            {isCombined ? 'Total Available Balance' : `${selectedAccountSummary?.accountName} Balance`}
          </span>
          <button
            onClick={toggleHide}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label={isHidden ? 'Show balance' : 'Hide balance'}
          >
            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Account Selector Pill */}
        <div className="relative">
          <select
            value={selectedAccountId || ''}
            onChange={e => setSelectedAccountId(e.target.value ? e.target.value : null)}
            className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Accounts ({accounts.length})</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex items-baseline gap-1 my-1">
        {isHidden ? (
          <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-widest">
            ••••••••
          </span>
        ) : (
          <>
            <span className="text-2xl sm:text-3xl font-bold text-zinc-400 dark:text-zinc-500">
              {currencySymbol}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {displayBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </>
        )}
      </div>

      {/* Account Details / Badges */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          {isCombined ? (
            <>
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Combined across {accounts.length} tracked account{accounts.length !== 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Opening: {currencySymbol}{selectedAccountSummary?.openingBalance.toLocaleString()}
              </span>
            </>
          )}
        </div>

        {selectedAccountSummary && !isCombined && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Active
          </span>
        )}
      </div>
    </div>
  );
};
