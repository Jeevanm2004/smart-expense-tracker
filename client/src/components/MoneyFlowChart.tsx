import React from 'react';
import { MonthlySummaryItem } from '../types';
import { BarChart3 } from 'lucide-react';

interface MoneyFlowChartProps {
  monthlySummary: MonthlySummaryItem[];
}

export const MoneyFlowChart: React.FC<MoneyFlowChartProps> = ({ monthlySummary }) => {
  const defaultMonths = [
    { month: '2026-01', totalAmount: 450, topCategory: 'Food' },
    { month: '2026-02', totalAmount: 620, topCategory: 'Travel' },
    { month: '2026-03', totalAmount: 780, topCategory: 'Utilities' },
    { month: '2026-04', totalAmount: 510, topCategory: 'Food' },
    { month: '2026-05', totalAmount: 690, topCategory: 'Entertainment' },
    { month: '2026-06', totalAmount: 540, topCategory: 'Travel' },
    { month: '2026-07', totalAmount: 351, topCategory: 'Food' },
  ];

  const displayData = monthlySummary.length > 0
    ? [...monthlySummary].reverse()
    : defaultMonths;

  const maxVal = Math.max(...displayData.map(d => d.totalAmount), 1000);

  const formatMonthName = (monthStr: string) => {
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleString('en-US', { month: 'short' });
    }
    return monthStr;
  };

  return (
    <div className="bg-white/90 dark:bg-[#161922]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 card-shadow flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Money flow</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Live monthly expense breakdown</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-gradient-to-t from-indigo-600 to-purple-500"></span>
              Actual Spend
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-950/80 border border-indigo-400/30"></span>
              Baseline
            </span>
          </div>

          <span className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400">
            This year
          </span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="relative pt-6">
        {/* Y Axis Guide Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[11px] font-bold text-slate-400 dark:text-slate-600 pointer-events-none pb-7">
          <div className="border-b border-dashed border-slate-200/60 dark:border-slate-800/60 pb-1">${Math.round(maxVal)}</div>
          <div className="border-b border-dashed border-slate-200/60 dark:border-slate-800/60 pb-1">${Math.round(maxVal * 0.66)}</div>
          <div className="border-b border-dashed border-slate-200/60 dark:border-slate-800/60 pb-1">${Math.round(maxVal * 0.33)}</div>
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-1">$0</div>
        </div>

        {/* Bars Container */}
        <div className="h-52 flex items-end justify-between px-4 sm:px-6 relative z-10 pt-4">
          {displayData.map((d, index) => {
            const heightPercent = Math.min(Math.round((d.totalAmount / maxVal) * 100), 100);
            const baselinePercent = Math.max(heightPercent - 15, 20);
            const isLatest = index === displayData.length - 1;

            return (
              <div key={d.month} className="flex flex-col items-center gap-2.5 group relative">
                {/* Tooltip on hover or latest month */}
                <div className={`absolute -top-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-lg z-20 transition-all duration-200 ${
                  isLatest ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                }`}>
                  ${d.totalAmount.toFixed(0)}
                </div>

                <div className="flex items-end gap-2 h-40">
                  {/* Spend Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-4 sm:w-5 bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 rounded-t-xl group-hover:brightness-125 shadow-md shadow-indigo-500/20 transition-all duration-300"
                  ></div>
                  {/* Baseline Bar */}
                  <div
                    style={{ height: `${baselinePercent}%` }}
                    className="w-4 sm:w-5 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 rounded-t-xl group-hover:brightness-125 transition-all duration-300"
                  ></div>
                </div>

                {/* Month Label */}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {formatMonthName(d.month)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
