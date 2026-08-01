import React from 'react';
import { MonthlySummaryItem } from '../../types';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

interface AnalyticsSectionProps {
  monthlySummary: MonthlySummaryItem[];
  byCategory: Record<string, number>;
  overallExpense: number;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  monthlySummary,
  byCategory,
  overallExpense
}) => {
  // Always build a clean 6-month continuous timeline (Feb -> Jul)
  // Current month (Jul) uses live API data; past months show baseline benchmarks
  const monthLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const baselines = [550, 600, 520, 640, 580, 650];
  const historicalSpends = [480, 620, 510, 590, 540];

  // Map API monthly summary items to quick lookup by month name
  const apiSummaryMap: Record<string, number> = {};
  monthlySummary.forEach((item) => {
    if (item.month) {
      const [year, monthNum] = item.month.split('-');
      const d = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const name = d.toLocaleString('en-US', { month: 'short' });
      apiSummaryMap[name] = item.totalAmount;
    }
  });

  const chartData = monthLabels.map((monthName, idx) => {
    const isCurrentMonth = idx === monthLabels.length - 1;
    const spend = isCurrentMonth
      ? (apiSummaryMap[monthName] ?? overallExpense)
      : (apiSummaryMap[monthName] ?? historicalSpends[idx]);
    
    return {
      monthName,
      spend: Math.round(spend),
      baseline: baselines[idx]
    };
  });

  // Donut Pie Chart Data
  const COLOR_PALETTE = ['#6366F1', '#38BDF8', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
  
  const pieData = Object.entries(byCategory).map(([name, value], index) => ({
    name,
    value,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length]
  }));

  const budgetLimit = 8000;
  const budgetUsedPercent = Math.min(Math.round((overallExpense / budgetLimit) * 100), 100);

  const [hoveredCategory, setHoveredCategory] = React.useState<{ name: string; value: number; color: string } | null>(null);
  const hoveredPercentage = hoveredCategory && overallExpense > 0
    ? Math.round((hoveredCategory.value / overallExpense) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Main Recharts Money Flow Bar Chart */}
      <Card className="lg:col-span-2 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Money Flow Analytics</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Monthly spend vs baseline trend</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></span>
                Actual Spend
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                Baseline
              </span>
            </div>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-extrabold border border-indigo-200/50 dark:border-indigo-800/50">
              YTD 2026
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={6}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold space-y-1">
                        <p className="text-slate-400 uppercase tracking-wider text-[10px]">{data.monthName} 2026</p>
                        <p className="text-indigo-400 font-extrabold text-sm">Spend: {formatCurrency(data.spend)}</p>
                        <p className="text-slate-300 text-[11px]">Baseline: {formatCurrency(data.baseline)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="spend" fill="url(#spendGradient)" radius={[6, 6, 0, 0]} barSize={20} animationDuration={1200} animationEasing="ease-out" />
              <Bar dataKey="baseline" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={20} opacity={0.35} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Recharts Donut Pie Chart & Budget Limit */}
      <Card className="flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Category Breakdown</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Expense proportion</p>
            </div>
          </div>
        </div>

        {/* Recharts Pie Donut */}
        <div className="h-44 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1, color: '#E2E8F0' }]}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                animationDuration={1200}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => {
                  if (pieData[index]) setHoveredCategory(pieData[index]);
                }}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                    className="transition-all duration-200 hover:opacity-85 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                position={{ y: -5 }}
                wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-slate-700/60 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (data.payload as any).color || '#6366F1' }} />
                        <span>{data.name}: </span>
                        <span className="text-indigo-400 font-extrabold">{formatCurrency(data.value as number)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredCategory ? (
              <>
                <span className="text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-200" style={{ color: hoveredCategory.color }}>
                  {hoveredCategory.name}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white transition-all duration-200">
                  {formatCurrency(hoveredCategory.value)}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mt-0.5">
                  {hoveredPercentage}% share
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(overallExpense)}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Budget Gauge */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300">Monthly Budget Cap ($8,000)</span>
            <span className={budgetUsedPercent > 85 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}>
              {budgetUsedPercent}% used
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsedPercent > 85 ? 'bg-rose-500' : budgetUsedPercent > 60 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${budgetUsedPercent}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
