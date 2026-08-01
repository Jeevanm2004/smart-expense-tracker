import React from 'react';
import { ArrowUpRight, PieChart } from 'lucide-react';

interface CategoryDonutChartProps {
  byCategory: Record<string, number>;
  overallExpense: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  byCategory,
  overallExpense
}) => {
  const categoryColors: Record<string, string> = {
    Food: '#6366F1', // Indigo
    Travel: '#3B82F6', // Blue
    Utilities: '#8B5CF6', // Purple
    Entertainment: '#EC4899', // Pink
    Other: '#10B981' // Emerald
  };

  const categoriesList = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
    percentage: overallExpense > 0 ? Math.round((value / overallExpense) * 100) : 0,
    color: categoryColors[name] || '#94A3B8'
  }));

  // Budget threshold calculations (Mock target $8,000 baseline)
  const budgetLimit = 8000;
  const budgetUsedPercent = Math.min(Math.round((overallExpense / budgetLimit) * 100), 100);

  return (
    <div className="bg-white/90 dark:bg-[#161922]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 card-shadow flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Category Breakdown</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Live expense ratio</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* SVG Donut Ring & Center Counter */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100 dark:text-slate-800/80"
            fill="transparent"
          />
          {/* Colored Segments */}
          {categoriesList.reduce((acc, cat) => {
            const strokeDasharray = 2 * Math.PI * 38;
            const strokeDashoffset = strokeDasharray * (1 - cat.percentage / 100);
            const rotation = acc.currentRotation;
            acc.currentRotation += (cat.percentage / 100) * 360;

            acc.elements.push(
              <circle
                key={cat.name}
                cx="50"
                cy="50"
                r="38"
                stroke={cat.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} 50 50)`}
                fill="transparent"
                className="transition-all duration-500 hover:stroke-[12]"
              />
            );
            return acc;
          }, { currentRotation: 0, elements: [] as JSX.Element[] }).elements}
        </svg>

        {/* Center Total Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ${overallExpense.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 mt-0.5">
            Active Month
          </span>
        </div>
      </div>

      {/* Budget Limit Progress Bar */}
      <div className="mt-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-600 dark:text-slate-300">Monthly Budget Limit</span>
          <span className="text-indigo-600 dark:text-indigo-400">{budgetUsedPercent}% used</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUsedPercent > 85 ? 'bg-rose-500' : budgetUsedPercent > 60 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${budgetUsedPercent}%` }}
          />
        </div>
      </div>

      {/* Legend List */}
      <div className="space-y-2 mt-4">
        {categoriesList.slice(0, 3).map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs font-bold p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-900 dark:text-white">${cat.value.toFixed(2)}</span>
              <span className="text-slate-400 text-[11px]">({cat.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
