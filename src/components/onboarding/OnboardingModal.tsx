import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { CURRENCIES } from '../../data/defaults';
import { AccountType } from '../../types';
import { Wallet, ShieldCheck, ArrowRight, Building, Banknote, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { settings, accounts, updateSettings, createAccount } = useSpendly();

  // If already onboarded and accounts exist, do not show
  if (settings.isOnboarded && accounts.length > 0) {
    return null;
  }

  const [currency, setCurrency] = useState(settings.currency || 'INR');
  const [accountName, setAccountName] = useState('Primary Account');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('25000');
  const [description, setDescription] = useState('My main daily spending account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCurrencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const parsedBalance = parseFloat(openingBalance) || 0;

      // 1. Create initial account
      const newAccountId = await createAccount({
        name: accountName.trim() || 'Primary Account',
        type: accountType,
        openingBalance: parsedBalance,
        currency: currency,
        description: description.trim(),
      });

      // 2. Update settings as onboarded
      await updateSettings({
        currency: selectedCurrencyObj.code,
        currencySymbol: selectedCurrencyObj.symbol,
        defaultAccountId: newAccountId,
        isOnboarded: true,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#16a34a', '#10b981', '#3b82f6', '#18181b'],
      });
    } catch (err) {
      console.error('Error during onboarding setup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-elevated border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 animate-slide-up max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md mb-4">
            <Wallet className="w-7 h-7 text-emerald-400 dark:text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to Spendly
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
            Your personal, offline-first finance tracker inspired by the simplicity of Google Pay.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Currency selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CURRENCIES.map(curr => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-base">{curr.symbol}</span>
                    <span className="text-[10px] opacity-75">{curr.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Primary Account Name
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="e.g. Primary Account or HDFC Bank"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Account type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'bank' as AccountType, label: 'Bank Account', icon: Building },
                { type: 'cash' as AccountType, label: 'Cash Wallet', icon: Banknote },
                { type: 'other' as AccountType, label: 'Other', icon: HelpCircle },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    accountType === type
                      ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opening balance */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Current Available Opening Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400 dark:text-zinc-500">
                {selectedCurrencyObj.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={openingBalance}
                onChange={e => setOpeningBalance(e.target.value)}
                placeholder="25000"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Your opening balance sets the initial baseline. All subsequent expenses and credits will be added or deducted automatically.
            </p>
          </div>

          {/* Optional description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Account Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Salary & UPI daily expenses"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% private. All records stay locally on this device. No bank credentials required.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started with Spendly</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
