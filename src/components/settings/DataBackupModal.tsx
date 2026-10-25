import React, { useState, useRef } from 'react';
import { useSpendly } from '../../context/SpendlyContext';
import { Modal } from '../common/Modal';
import {
  exportTransactionsToCSV,
  createFullBackup,
  downloadFile,
  validateBackupFile,
  restoreBackup,
  BackupData,
} from '../../services/dataManager';
import { format } from 'date-fns';
import { Download, Upload, FileSpreadsheet, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const { transactions, accounts, categories, showToast, refreshAllData } = useSpendly();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedBackup, setImportedBackup] = useState<BackupData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    try {
      const csv = exportTransactionsToCSV(transactions, accounts, categories);
      const filename = `spendly-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadFile(csv, filename, 'text/csv;charset=utf-8;');
      showToast('Transactions exported to CSV successfully', 'success');
    } catch (err: unknown) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handleExportJSON = async () => {
    try {
      const json = await createFullBackup();
      const filename = `spendly-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      downloadFile(json, filename, 'application/json;charset=utf-8;');
      showToast('Full backup exported successfully', 'success');
    } catch (err: unknown) {
      showToast('Failed to create backup', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportedBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const result = validateBackupFile(content);
      if (!result.isValid || !result.data) {
        setImportError(result.error || 'Invalid backup file structure.');
      } else {
        setImportedBackup(result.data);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleRestoreExecute = async () => {
    if (!importedBackup || isRestoring) return;

    try {
      setIsRestoring(true);
      const res = await restoreBackup(importedBackup, importMode);
      await refreshAllData();
      showToast(
        `Successfully restored ${res.accountsRestored} account(s) and ${res.transactionsRestored} transaction(s)!`,
        'success'
      );
      setImportedBackup(null);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Restore failed';
      showToast(msg, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Management & Backup"
      description="Export your financial data or restore a previously saved backup"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Export Section */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Export Records
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Export to CSV
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Spreadsheet format for Excel, Google Sheets, or Numbers.
                </p>
              </div>
            </button>

            {/* JSON Full Backup */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Create Full JSON Backup
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Complete snapshot of accounts, categories, and balances.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Restore Section */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Import & Restore Backup
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!importedBackup ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-center flex flex-col items-center justify-center transition-all bg-white dark:bg-zinc-900"
            >
              <Upload className="w-6 h-6 text-zinc-400 mb-1.5" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Select Spendly JSON Backup File
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Click to browse your device for a valid .json backup file
              </span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-slide-up">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Valid Backup File Loaded</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-400 block text-[10px]">Accounts</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {importedBackup.accounts?.length || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-400 block text-[10px]">Transactions</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {importedBackup.transactions?.length || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-400 block text-[10px]">Categories</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {importedBackup.categories?.length || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5">
                  Restore Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block font-bold">Replace Everything</span>
                    <span className="text-[10px] opacity-80">Wipes current database and replaces cleanly.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      importMode === 'merge'
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block font-bold">Merge Safely</span>
                    <span className="text-[10px] opacity-80">Preserves existing records and appends missing data.</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setImportedBackup(null)}
                  className="px-3.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Discard File
                </button>
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleRestoreExecute}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm hover:opacity-90 flex items-center gap-1.5"
                >
                  <span>Execute Restore</span>
                </button>
              </div>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
