import React, { useState } from 'react';
import { Expense, SortField, SortOrder } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../Button';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Trash2,
  Edit3,
  Download,
  Filter,
  ArrowUpDown,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Calendar,
  X,
  Search,
} from 'lucide-react';

interface TransactionsTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  onViewDetail: (id: string) => void;
  onDownloadCSV: () => void;
  onOpenAddModal: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  categories: string[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  onViewDetail,
  onDownloadCSV,
  onOpenAddModal,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
  isLoading,
  searchQuery,
  setSearchQuery,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

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

  const totalPages = Math.max(Math.ceil(sortedExpenses.length / pageSize), 1);
  const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'Food':
        return 'indigo';
      case 'Travel':
        return 'blue';
      case 'Utilities':
        return 'purple';
      case 'Entertainment':
        return 'rose';
      default:
        return 'emerald';
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Table Header Bar */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Transaction History</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Showing {sortedExpenses.length} total records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          {/* Table Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#161922] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownloadCSV}
              leftIcon={<Download className="w-4 h-4 text-indigo-500" />}
            >
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Filter & Date Range Bar */}
      <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/40 dark:border-slate-800/40 flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {['All', ...categories.filter((c) => c !== 'All')].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
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

        {/* Date Range Picker Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold mr-1">
              From
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs font-bold cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold mr-1">
              To
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs font-bold cursor-pointer"
            />
          </label>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-extrabold transition-colors"
              title="Clear date range filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Dates</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-900/20">
              <th
                className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-4 px-6 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('amount')}
              >
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
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center font-bold">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No transactions found</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        {selectedCategory !== 'All'
                          ? `No expense entries found in "${selectedCategory}" category.`
                          : 'Start tracking your spending by creating your first expense entry.'}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenAddModal}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add First Expense
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        <CreditCard className="w-4.5 h-4.5" />
                      </div>
                      <span className="truncate max-w-xs">{expense.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getCategoryBadgeVariant(expense.category)}>{expense.category}</Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white text-base">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetail(expense.id)}
                        className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-xl transition-colors"
                        title="View expense detail (GET /expenses/:id)"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                        title="Edit expense"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
