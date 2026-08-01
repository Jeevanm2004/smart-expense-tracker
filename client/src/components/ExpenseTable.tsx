import React, { useState } from 'react';
import { Expense } from '../types';
import { Trash2, Edit3, Download, Tag, ArrowUpDown, Filter, CreditCard } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  onDownloadCSV: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  isLoading: boolean;
}

type SortField = 'date' | 'title' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  onDownloadCSV,
  selectedCategory,
  setSelectedCategory,
  categories,
  isLoading
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categoryBadges: Record<string, string> = {
    Food: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50',
    Travel: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    Utilities: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
    Entertainment: 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 border-pink-200/50 dark:border-pink-800/50',
    Default: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
  };

  return (
    <div className="bg-white/90 dark:bg-[#161922]/90 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 card-shadow overflow-hidden">
      {/* Table Bar Header */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Manage and export transaction history</p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export CSV Button */}
          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700/60"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Category Filter Pills Bar */}
      <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['All', ...categories.filter(c => c !== 'All')].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-900/20">
              <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1.5">
                  <span>Transaction Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                  Loading transactions...
                </td>
              </tr>
            ) : sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                  No expenses found for this selection.
                </td>
              </tr>
            ) : (
              sortedExpenses.map((expense) => {
                const badgeStyle = categoryBadges[expense.category] || categoryBadges.Default;
                return (
                  <tr key={expense.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Title */}
                    <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                          <CreditCard className="w-4.5 h-4.5" />
                        </div>
                        <span className="truncate max-w-xs">{expense.title}</span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badgeStyle}`}>
                        <Tag className="w-3 h-3" />
                        {expense.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs font-bold">
                      {expense.date}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900 dark:text-white font-display text-base">
                      ${expense.amount.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(expense)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
