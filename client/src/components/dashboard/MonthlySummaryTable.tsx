import React from 'react';
import { MonthlySummaryItem } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { CalendarDays, TrendingUp, Receipt, Tag, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MonthlySummaryTableProps {
  monthlySummary: MonthlySummaryItem[];
}

const CATEGORY_VARIANTS: Record<string, 'indigo' | 'blue' | 'purple' | 'rose' | 'emerald'> = {
  Food: 'indigo',
  Travel: 'blue',
  Utilities: 'purple',
  Entertainment: 'rose',
};

const CATEGORY_BAR_COLORS: Record<string, string> = {
  Food: 'bg-indigo-500',
  Travel: 'bg-sky-500',
  Utilities: 'bg-purple-500',
  Entertainment: 'bg-rose-500',
};

function getCategoryVariant(cat: string): 'indigo' | 'blue' | 'purple' | 'rose' | 'emerald' {
  return CATEGORY_VARIANTS[cat] ?? 'emerald';
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({ monthlySummary }) => {
  if (monthlySummary.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No monthly data yet</h4>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Add your first expense to see the monthly breakdown here.
          </p>
        </div>
      </Card>
    );
  }

  // Sort most-recent first
  const sorted = [...monthlySummary].sort((a, b) => b.month.localeCompare(a.month));

  // Attach month-over-month delta (comparing to the next older month)
  const withDelta = sorted.map((item, idx) => {
    const prev = sorted[idx + 1];
    const delta =
      prev && prev.totalAmount > 0
        ? ((item.totalAmount - prev.totalAmount) / prev.totalAmount) * 100
        : null;
    return { ...item, delta };
  });

  const grandTotal = sorted.reduce((s, m) => s + m.totalAmount, 0);
  const totalTxns = sorted.reduce((s, m) => s + m.count, 0);

  return (
    <Card className="overflow-hidden p-0">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Breakdown
          </h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Per-month totals, counts &amp; top category &middot; {sorted.length} month{sorted.length !== 1 ? 's' : ''} on record
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-900/20">
              <th className="py-3 px-6">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Month
                </div>
              </th>
              <th className="py-3 px-6">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Total Spent
                </div>
              </th>
              <th className="py-3 px-6">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Transactions
                </div>
              </th>
              <th className="py-3 px-6">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Top Category
                </div>
              </th>
              <th className="py-3 px-6">Category Split</th>
              <th className="py-3 px-6 text-right">MoM Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold">
            {withDelta.map((item) => {
              const categoryEntries = item.byCategory
                ? Object.entries(item.byCategory).sort((a, b) => b[1] - a[1])
                : [];

              return (
                <tr
                  key={item.month}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Month name */}
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatMonth(item.month)}
                  </td>

                  {/* Total amount */}
                  <td className="py-4 px-6 font-black text-slate-900 dark:text-white text-base">
                    {formatCurrency(item.totalAmount)}
                  </td>

                  {/* Transaction count */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black">
                        {item.count}
                      </span>
                      {item.count === 1 ? 'entry' : 'entries'}
                    </span>
                  </td>

                  {/* Top category badge */}
                  <td className="py-4 px-6">
                    {item.topCategory ? (
                      <Badge variant={getCategoryVariant(item.topCategory)}>
                        {item.topCategory}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Category mini bar chart */}
                  <td className="py-4 px-6 min-w-[160px]">
                    {categoryEntries.length > 0 ? (
                      <div className="space-y-1.5">
                        {categoryEntries.slice(0, 3).map(([cat, amt]) => {
                          const pct =
                            item.totalAmount > 0
                              ? Math.round((amt / item.totalAmount) * 100)
                              : 0;
                          const barColor = CATEGORY_BAR_COLORS[cat] || 'bg-emerald-500';
                          return (
                            <div key={cat} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-16 truncate">
                                {cat}
                              </span>
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-7 text-right shrink-0">
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Month-over-month change */}
                  <td className="py-4 px-6 text-right">
                    {item.delta === null ? (
                      <span className="inline-flex items-center justify-end gap-1 text-xs font-bold text-slate-400">
                        <Minus className="w-3 h-3" />
                        Baseline
                      </span>
                    ) : item.delta > 0 ? (
                      <span className="inline-flex items-center justify-end gap-1 text-xs font-extrabold text-rose-500 dark:text-rose-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                        +{item.delta.toFixed(1)}%
                      </span>
                    ) : item.delta < 0 ? (
                      <span className="inline-flex items-center justify-end gap-1 text-xs font-extrabold text-emerald-500 dark:text-emerald-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                        {item.delta.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">±0%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>
          {sorted.length} month{sorted.length !== 1 ? 's' : ''} &middot; {totalTxns} total transaction{totalTxns !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-900 dark:text-white font-extrabold text-sm">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </Card>
  );
};
