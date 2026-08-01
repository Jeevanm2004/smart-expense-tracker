import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Search,
  Calendar,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { fetchHealthCheck } from '../api/expenses';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  searchQuery,
  setSearchQuery,
}) => {
  const [healthStatus, setHealthStatus] = useState<{ isHealthy: boolean; timestamp?: string; loading: boolean }>({
    isHealthy: true,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      try {
        const data = await fetchHealthCheck();
        if (!cancelled) {
          setHealthStatus({ isHealthy: data.status === 'OK', timestamp: data.timestamp, loading: false });
        }
      } catch {
        if (!cancelled) {
          setHealthStatus({ isHealthy: false, loading: false });
        }
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#13151D]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="w-full pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        <div className="flex items-center justify-between h-18 py-3 gap-4">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-2xl shadow-lg shadow-sky-500/20 ring-4 ring-sky-500/10 shrink-0 overflow-hidden">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#0f0f1a" />
                <rect x="5" y="20" width="5" height="7" rx="1.5" fill="url(#nav-c1)" opacity="0.5" />
                <rect x="13" y="13" width="5" height="14" rx="1.5" fill="url(#nav-c1)" opacity="0.75" />
                <rect x="21" y="7" width="5" height="20" rx="1.5" fill="url(#nav-c1)" />
                <defs>
                  <linearGradient id="nav-c1" x1="16" y1="6" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  DilliCents
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 text-[10px] font-bold items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  v1.0
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-sky-500 dark:text-sky-400">
                by Diligent
              </span>
            </div>
          </div>

          {/* Center: Sliding Nav Pills */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 relative">
            {/* Sliding pill background */}
            <div
              className="absolute top-1 bottom-1 rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: `calc(50% - 4px)`,
                transform: `translateX(${navItems.findIndex((n) => n.id === activeTab) * 100}%)`,
                left: '4px',
              }}
            />
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-300 min-w-[120px] justify-center"
                  style={{ color: isActive ? 'white' : undefined }}
                >
                  <Icon
                    className="w-4 h-4 transition-colors duration-300"
                    style={{ color: isActive ? 'white' : undefined }}
                  />
                  <span
                    className={`transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right: Search + Date + Theme Toggle + Add Expense CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative hidden lg:block w-48 xl:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'transactions') {
                    setActiveTab('transactions');
                  }
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#161922] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Date Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-[#161922] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentDate}</span>
            </div>

            {/* API Health Check Status Badge (GET /health) */}
            <div
              title={
                healthStatus.timestamp
                  ? `Server health OK (Checked ${new Date(healthStatus.timestamp).toLocaleTimeString()})`
                  : 'System Health'
              }
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                healthStatus.isHealthy
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden md:inline">API Health</span>
              {healthStatus.isHealthy ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px]">OK</span>
                </span>
              ) : (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              )}
            </div>

            {/* Theme Switcher Button */}
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle Theme"
              className="p-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-200/60 dark:border-slate-700/50"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Add Expense Primary CTA */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200/60 dark:border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
