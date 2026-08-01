import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { TrendingDown, CreditCard, Hash, BarChart3, Tag } from 'lucide-react';
import { Expense } from '../../types';

interface MetricsOverviewProps {
  overallExpense: number;
  expenses: Expense[];
  byCategory: Record<string, number>;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  overallExpense,
  expenses,
  byCategory,
}) => {
  const count = expenses.length;
  const avg = count > 0 ? overallExpense / count : 0;

  const topCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : '—';
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

  const metrics = [
    {
      id: 'expense',
      title: 'Total Spent',
      value: formatCurrency(overallExpense),
      sub: `across ${count} transaction${count !== 1 ? 's' : ''}`,
      icon: CreditCard,
      accentColor: 'from-rose-500/8 to-transparent',
      badgeVariant: 'rose' as const,
      badgeLabel: 'All time',
      iconColor: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    },
    {
      id: 'count',
      title: 'Transactions',
      value: count.toString(),
      sub: 'total recorded entries',
      icon: Hash,
      accentColor: 'from-indigo-500/8 to-transparent',
      badgeVariant: 'indigo' as const,
      badgeLabel: 'All time',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      id: 'avg',
      title: 'Avg per Transaction',
      value: formatCurrency(avg),
      sub: count > 0 ? `over ${count} entries` : 'no data yet',
      icon: BarChart3,
      accentColor: 'from-sky-500/8 to-transparent',
      badgeVariant: 'blue' as const,
      badgeLabel: 'Mean',
      iconColor: 'text-sky-500 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    },
    {
      id: 'top',
      title: 'Top Category',
      value: topCategory,
      sub: topCategoryEntry ? formatCurrency(topCategoryAmount) + ' total' : 'no data yet',
      icon: Tag,
      accentColor: 'from-purple-500/8 to-transparent',
      badgeVariant: 'purple' as const,
      badgeLabel: 'Highest',
      iconColor: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.id} className={`relative overflow-hidden bg-gradient-to-br ${metric.accentColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${metric.iconBg} flex items-center justify-center shadow-sm border border-slate-200/40 dark:border-slate-700/40`}>
                  <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {metric.title}
                </span>
              </div>
              <Badge variant={metric.badgeVariant}>
                <TrendingDown className="w-3 h-3" />
                <span>{metric.badgeLabel}</span>
              </Badge>
            </div>

            <div className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 truncate">
              {metric.value}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate">
              {metric.sub}
            </p>
          </Card>
        );
      })}
    </div>
  );
};
