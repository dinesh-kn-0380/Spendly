import React, { useState, useEffect } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import { Category } from '../../types';
import { CategoryIcon, AVAILABLE_ICONS } from '../common/CategoryIcon';
import { Plus, X, Check } from 'lucide-react';

const PALETTE = [
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#14b8a6', // teal
  '#71717a', // zinc
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  defaultType?: 'expense' | 'income';
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  defaultType = 'expense',
}) => {
  const { createCategory, updateCategory, showToast } = useSpendly();

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#f97316');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setIcon(category.icon);
      setColor(category.color);
      setSubcategories(category.subcategories || []);
    } else {
      setName('');
      setType(defaultType);
      setIcon(defaultType === 'income' ? 'ArrowDownLeft' : 'Utensils');
      setColor(defaultType === 'income' ? '#10b981' : '#f97316');
      setSubcategories([]);
    }
  }, [category, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleAddSubcategory = () => {
    const trimmed = newSubInput.trim();
    if (trimmed && !subcategories.includes(trimmed)) {
      setSubcategories([...subcategories, trimmed]);
      setNewSubInput('');
    }
  };

  const handleRemoveSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter(s => s !== sub));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (category) {
        await updateCategory(category.id, {
          name: name.trim(),
          type,
          icon,
          color,
          subcategories,
        });
      } else {
        await createCategory({
          name: name.trim(),
          type,
          icon,
          color,
          isDefault: false,
          subcategories: subcategories.length > 0 ? subcategories : ['General'],
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving category';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create Category'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Preview Icon */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${color}25`, color: color }}
          >
            <CategoryIcon name={icon} className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              {name || 'Category Name'}
            </div>
            <div className="text-xs text-zinc-500 capitalize">
              {type} Category · {subcategories.length} subcategories
            </div>
          </div>
        </div>

        {/* Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. College Friends, Weekend Trip"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Income
              </button>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Color Accent
          </label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-zinc-900 dark:ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker Grid */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Select Icon
          </label>
          <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {AVAILABLE_ICONS.map(ic => {
              const isSelected = icon === ic;
              return (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <CategoryIcon name={ic} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Management */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Subcategories
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newSubInput}
              onChange={e => setNewSubInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubcategory();
                }
              }}
              placeholder="Add subcategory (press Enter)"
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {subcategories.map(sub => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200"
              >
                <span>{sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(sub)}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{category ? 'Save Changes' : 'Create Category'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
