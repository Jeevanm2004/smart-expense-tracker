import React from 'react';
import { Search, Plus, Calendar } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  searchQuery,
  setSearchQuery
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Expense Overview
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Track, manage, and export your spending.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-[#161922]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all card-shadow"
          />
        </div>

        {/* Date Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-white/80 dark:bg-[#161922]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 card-shadow">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{currentDate}</span>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};
