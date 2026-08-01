import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet, DollarSign, CreditCard, PiggyBank } from 'lucide-react';

interface StatCardsProps {
  overallExpense: number;
}

export const StatCards: React.FC<StatCardsProps> = ({ overallExpense }) => {
  const formattedExpense = `$${overallExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    {
      id: 'balance',
      title: 'Total balance',
      amount: '$15,700.00',
      trend: '↑ 12.1%',
      trendLabel: 'vs last month',
      isPositive: true,
      icon: Wallet,
      iconBg: 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20',
      gradient: 'from-emerald-500/5 to-transparent'
    },
    {
      id: 'income',
      title: 'Income',
      amount: '$8,500.00',
      trend: '↑ 6.3%',
      trendLabel: 'vs last month',
      isPositive: true,
      icon: DollarSign,
      iconBg: 'bg-indigo-500/10 text-indigo-500 ring-indigo-500/20',
      gradient: 'from-indigo-500/5 to-transparent'
    },
    {
      id: 'expense',
      title: 'Expense',
      amount: formattedExpense,
      trend: '↑ 2.4%',
      trendLabel: 'vs last month',
      isPositive: false,
      icon: CreditCard,
      iconBg: 'bg-rose-500/10 text-rose-500 ring-rose-500/20',
      gradient: 'from-rose-500/5 to-transparent'
    },
    {
      id: 'savings',
      title: 'Total savings',
      amount: '$32,913.00',
      trend: '↑ 12.1%',
      trendLabel: 'vs last month',
      isPositive: true,
      icon: PiggyBank,
      iconBg: 'bg-purple-500/10 text-purple-500 ring-purple-500/20',
      gradient: 'from-purple-500/5 to-transparent'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`bg-white/90 dark:bg-[#161922]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 card-shadow card-hover group relative overflow-hidden bg-gradient-to-br ${stat.gradient}`}
          >
            {/* Top row with Icon & Arrow */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ring-4 ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Main Metric Value */}
            <div className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-display">
              {stat.amount}
            </div>

            {/* Bottom Trend & Label */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold ${
                stat.isPositive 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40' 
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
              }`}>
                {stat.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {stat.trend}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px]">
                {stat.trendLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
