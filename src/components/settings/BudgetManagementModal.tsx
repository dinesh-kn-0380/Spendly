import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { CategoryIcon } from '../common/CategoryIcon';
import { calculateCategoryBreakdown } from '../../services/financeEngine';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Plus, Trash2, Target, AlertTriangle } from 'lucide-react';

interface BudgetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetManagementModal: React.FC<BudgetManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    budgets,
    saveBudget,
    deleteBudget,
    categories,
    transactions,
    currencySymbol,
    showToast,
  } = useSpendly();

  const [isAdding, setIsAdding] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [categoryId, setCategoryId] = useState(''); // empty = overall monthly
  const [amount, setAmount] = useState('');

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const categoryBreakdown = calculateCategoryBreakdown(transactions, categories, monthStart, monthEnd);
  const totalMonthExpense = categoryBreakdown.reduce((sum, c) => sum + c.totalSpent, 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }

    const defaultName = categoryId
      ? `${categories.find(c => c.id === categoryId)?.name || 'Category'} Budget`
      : 'Overall Monthly Budget';

    try {
      await saveBudget({
        name: budgetName.trim() || defaultName,
        categoryId: categoryId || undefined,
        amount: numAmount,
        period: 'monthly',
      });
      setIsAdding(false);
      setBudgetName('');
      setCategoryId('');
      setAmount('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating budget';
      showToast(msg, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Budgets & Spending Limits"
      description="Set monthly caps to stay in control of your spending"
      maxWidth="md"
    >
      <div className="space-y-4">
        {!isAdding ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                {budgets.length} Active Budget Limit{budgets.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Budget</span>
              </button>
            </div>

            {budgets.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <Target className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">
                  No budgets configured. Click "New Budget" to set an overall monthly limit or category spending targets.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {budgets.map(b => {
                  const isOverall = !b.categoryId;
                  const cat = categories.find(c => c.id === b.categoryId);
                  const spent = isOverall
                    ? totalMonthExpense
                    : (categoryBreakdown.find(c => c.categoryId === b.categoryId)?.totalSpent || 0);

                  const pct = Math.min(100, Math.round((spent / b.amount) * 100));
                  const isOver = spent > b.amount;
                  const isWarning = pct >= 80 && !isOver;

                  return (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {cat && <CategoryIcon name={cat.icon} className="w-4 h-4 text-zinc-600" />}
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {b.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                            {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{b.amount.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteBudget(b.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600"
                            aria-label="Delete budget"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">
                          {isOver
                            ? `Over budget by ${currencySymbol}${(spent - b.amount).toLocaleString()}`
                            : `${currencySymbol}${(b.amount - spent).toLocaleString()} remaining`}
                        </span>
                        <span className={`font-semibold ${isOver ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pct}% used
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Create Spending Limit
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-zinc-500"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Target Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none"
              >
                <option value="">Overall Total Monthly Budget</option>
                {categories.filter(c => c.type === 'expense').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Budget Limit Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="15000"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              >
                Save Budget
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
