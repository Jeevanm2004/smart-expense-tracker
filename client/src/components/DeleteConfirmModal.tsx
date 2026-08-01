import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expenseTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expenseTitle,
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-modal-title"
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1A1D27] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden animate-modalIn">

        {/* Red accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-red-400" />

        {/* Content */}
        <div className="p-6">
          {/* Icon + close */}
          <div className="flex items-start justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h2
            id="delete-modal-title"
            className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-2"
          >
            Delete Expense?
          </h2>

          {/* Body */}
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-1">
            You're about to permanently delete:
          </p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 mb-5 truncate">
            "{expenseTitle}"
          </p>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-6">
            This action cannot be undone. The record will be removed from all summaries and totals.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold transition-all shadow-md shadow-rose-500/25"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
