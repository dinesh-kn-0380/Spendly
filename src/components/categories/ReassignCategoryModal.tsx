import React, { useState } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { Category } from '../../types';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface ReassignCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
  affectedCount: number;
}

export const ReassignCategoryModal: React.FC<ReassignCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToDelete,
  affectedCount,
}) => {
  const { categories, deleteCategory, showToast } = useSpendly();

  const candidateCategories = categories.filter(
    c => categoryToDelete && c.id !== categoryToDelete.id && c.type === categoryToDelete.type
  );

  const [reassignTargetId, setReassignTargetId] = useState(candidateCategories[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !categoryToDelete) return null;

  const handleConfirm = async () => {
    if (!reassignTargetId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await deleteCategory(categoryToDelete.id, reassignTargetId);
      const target = categories.find(c => c.id === reassignTargetId);
      showToast(
        `Reassigned ${affectedCount} transaction(s) to "${target?.name}" and deleted "${categoryToDelete.name}"`,
        'success'
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reassigning category';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign Category Transactions"
      description="Safely preserve your historical data before deleting"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-semibold block mb-0.5">Category in Use</span>
            <strong>{categoryToDelete.name}</strong> is currently assigned to <strong>{affectedCount}</strong> existing transaction{affectedCount !== 1 ? 's' : ''}. To maintain accurate records, please choose a replacement category.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Reassign All {affectedCount} Transactions To:
          </label>
          <select
            value={reassignTargetId}
            onChange={e => setReassignTargetId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {candidateCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !reassignTargetId}
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <span>Reassign & Delete</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
