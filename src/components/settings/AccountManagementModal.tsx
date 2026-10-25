import React, { useState, useEffect } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Account, AccountType } from '../../types';
import { Building, Banknote, HelpCircle, Plus, Edit2, Archive, Check } from 'lucide-react';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    accounts,
    createAccount,
    updateAccount,
    archiveAccount,
    currencySymbol,
    showToast,
  } = useSpendly();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmBalanceChange, setShowConfirmBalanceChange] = useState(false);
  const [pendingSavePayload, setPendingSavePayload] = useState<any>(null);

  const [confirmArchiveAcc, setConfirmArchiveAcc] = useState<Account | null>(null);

  const resetForm = () => {
    setName('');
    setType('bank');
    setOpeningBalance('0');
    setDescription('');
    setSelectedAcc(null);
    setIsEditing(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (acc: Account) => {
    setSelectedAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setOpeningBalance(acc.openingBalance.toString());
    setDescription(acc.description || '');
    setIsEditing(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBalance = parseFloat(openingBalance) || 0;

    if (selectedAcc && selectedAcc.openingBalance !== parsedBalance) {
      // Consequential balance adjustment requires explicit confirmation
      setPendingSavePayload({
        name: name.trim(),
        type,
        openingBalance: parsedBalance,
        description: description.trim(),
      });
      setShowConfirmBalanceChange(true);
      return;
    }

    await saveAccountDetails({
      name: name.trim(),
      type,
      openingBalance: parsedBalance,
      description: description.trim(),
    });
  };

  const saveAccountDetails = async (payload: any) => {
    try {
      if (selectedAcc) {
        await updateAccount(selectedAcc.id, payload);
      } else {
        await createAccount({
          name: payload.name,
          type: payload.type,
          openingBalance: payload.openingBalance,
          currency: 'INR',
          description: payload.description,
        });
      }
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving account';
      showToast(msg, 'error');
    }
  };

  const handleArchiveConfirm = async () => {
    if (confirmArchiveAcc) {
      await archiveAccount(confirmArchiveAcc.id);
      setConfirmArchiveAcc(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Accounts"
        description="Configure your bank accounts, cash wallets, and starting balances"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  {accounts.length} Tracked Account{accounts.length !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Account</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-200">
                        {acc.type === 'bank' ? (
                          <Building className="w-5 h-5" />
                        ) : acc.type === 'cash' ? (
                          <Banknote className="w-5 h-5" />
                        ) : (
                          <HelpCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {acc.name}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          Opening: {currencySymbol}{acc.openingBalance.toLocaleString()} {acc.description && `· ${acc.description}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(acc)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        aria-label={`Edit ${acc.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {accounts.length > 1 && (
                        <button
                          onClick={() => setConfirmArchiveAcc(acc)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          aria-label={`Archive ${acc.name}`}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {selectedAcc ? `Edit Account: ${selectedAcc.name}` : 'Create New Account'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Back to List
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. HDFC Bank, Cash Wallet"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank' as AccountType, label: 'Bank' },
                    { id: 'cash' as AccountType, label: 'Cash' },
                    { id: 'other' as AccountType, label: 'Other' },
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize ${
                        type === t.id
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Opening Balance ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={openingBalance}
                  onChange={e => setOpeningBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Salary account"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedAcc ? 'Save Updates' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Opening Balance Adjustment Confirmation */}
      <ConfirmDialog
        isOpen={showConfirmBalanceChange}
        onClose={() => setShowConfirmBalanceChange(false)}
        onConfirm={async () => {
          if (pendingSavePayload) {
            await saveAccountDetails(pendingSavePayload);
            setPendingSavePayload(null);
          }
        }}
        title="Adjust Opening Balance?"
        message={`Changing the opening balance of "${selectedAcc?.name}" will immediately recalculate its current available balance and affected historical summaries. Do you want to proceed?`}
        confirmLabel="Confirm Balance Adjustment"
      />

      {/* Archive Account Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmArchiveAcc}
        onClose={() => setConfirmArchiveAcc(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive Account?"
        message={`Archiving "${confirmArchiveAcc?.name}" will hide it from the active account selector while preserving past transaction records.`}
        confirmLabel="Archive Account"
        isDestructive={true}
      />
    </>
  );
};
