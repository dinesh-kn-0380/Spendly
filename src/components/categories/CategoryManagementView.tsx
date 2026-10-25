import React, { useState, useMemo } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { ReassignCategoryModal } from './ReassignCategoryModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

export const CategoryManagementView: React.FC = () => {
  const { categories, transactions, currencySymbol, deleteCategory } = useSpendly();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Deletion states
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const displayedCategories = useMemo(
    () => categories.filter(c => c.type === activeTab),
    [categories, activeTab]
  );

  // Compute transaction counts and totals per category
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { count: number; total: number }>();
    for (const tx of transactions) {
      const current = stats.get(tx.categoryId) || { count: 0, total: 0 };
      current.count += 1;
      current.total += tx.amount;
      stats.set(tx.categoryId, current);
    }
    return stats;
  }, [transactions]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleDeleteClick = (cat: Category) => {
    const stat = categoryStats.get(cat.id);
    const affectedCount = stat ? stat.count : 0;

    setCategoryToDelete(cat);
    if (affectedCount > 0) {
      setReassignModalOpen(true);
    } else {
      setConfirmDeleteOpen(true);
    }
  };

  const handleSimpleDeleteConfirm = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Categories & Subcategories
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize your spending and income buckets
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Tabs: Expense vs Income */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('expense')}
          className={`py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'expense'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Expense Categories ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'income'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Income Categories ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {displayedCategories.map(cat => {
          const stat = categoryStats.get(cat.id) || { count: 0, total: 0 };

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {cat.name}
                    </h4>
                    {cat.isDefault && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-medium">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Subcategories list */}
                  {cat.subcategories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cat.subcategories.map(sub => (
                        <span
                          key={sub}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 mt-1">
                    {stat.count} transaction{stat.count !== 1 ? 's' : ''} recorded · Total: {currencySymbol}{stat.total.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(cat)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        defaultType={activeTab}
      />

      {/* Reassign Modal if Category in use */}
      <ReassignCategoryModal
        isOpen={reassignModalOpen}
        onClose={() => {
          setReassignModalOpen(false);
          setCategoryToDelete(null);
        }}
        categoryToDelete={categoryToDelete}
        affectedCount={categoryToDelete ? (categoryStats.get(categoryToDelete.id)?.count || 0) : 0}
      />

      {/* Simple Confirm Dialog if Category is unused */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleSimpleDeleteConfirm}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Since it has no transactions recorded, it can be removed safely.`}
        confirmLabel="Delete Category"
        isDestructive={true}
      />
    </div>
  );
};
