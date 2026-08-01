import React, { useEffect, useState } from 'react';
import { Expense } from '../types';
import { fetchExpenseById } from '../api/expenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import { X, CreditCard, Tag, CalendarDays, Hash, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/Badge';

interface ExpenseDetailDrawerProps {
  expenseId: string | null;
  onClose: () => void;
}

const CATEGORY_VARIANTS: Record<string, 'indigo' | 'blue' | 'purple' | 'rose' | 'emerald'> = {
  Food: 'indigo',
  Travel: 'blue',
  Utilities: 'purple',
  Entertainment: 'rose',
};

function getCategoryVariant(cat: string): 'indigo' | 'blue' | 'purple' | 'rose' | 'emerald' {
  return CATEGORY_VARIANTS[cat] ?? 'emerald';
}

export const ExpenseDetailDrawer: React.FC<ExpenseDetailDrawerProps> = ({ expenseId, onClose }) => {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = expenseId !== null;

  useEffect(() => {
    if (!expenseId) {
      setExpense(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExpenseById(expenseId)
      .then((data) => {
        if (!cancelled) setExpense(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load expense details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [expenseId]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Expense Details"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-[#1A1D27] shadow-2xl border-l border-slate-200/80 dark:border-slate-700/80 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Expense Detail</h2>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                GET /expenses/:id
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold">Fetching expense…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Failed to load</p>
              <p className="text-xs font-semibold text-slate-400">{error}</p>
            </div>
          )}

          {!loading && !error && expense && (
            <div className="space-y-5">
              {/* Amount — hero element */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-3xl border border-indigo-100 dark:border-indigo-800/40 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Amount</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(expense.amount)}
                </p>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {/* Title */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Title</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white break-words">{expense.title}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Category</p>
                    <Badge variant={getCategoryVariant(expense.category)}>{expense.category}</Badge>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm shrink-0">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Date</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatDate(expense.date)}</p>
                  </div>
                </div>

                {/* ID */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm shrink-0">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Record ID</p>
                    <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 break-all">{expense.id}</p>
                  </div>
                </div>
              </div>

              {/* API source label */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Fetched live via GET /expenses/{expense.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
