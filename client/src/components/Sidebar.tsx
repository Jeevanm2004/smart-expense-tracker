import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Sun,
  Moon,
  Plus,
  Sparkles,
  CheckCircle2,
  Database
} from 'lucide-react';

interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  darkMode,
  onToggleDarkMode,
  activeTab,
  setActiveTab,
  onOpenAddModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="w-64 bg-white/90 dark:bg-[#13151D]/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0 transition-colors duration-300 z-30">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Bar Chart SVG Logo */}
            <div className="w-10 h-10 rounded-2xl shadow-lg shadow-sky-500/20 ring-4 ring-sky-500/10 shrink-0 overflow-hidden">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#0f0f1a"/>
                <rect x="5" y="20" width="5" height="7" rx="1.5" fill="url(#sidebar-c1)" opacity="0.5"/>
                <rect x="13" y="13" width="5" height="14" rx="1.5" fill="url(#sidebar-c1)" opacity="0.75"/>
                <rect x="21" y="7" width="5" height="20" rx="1.5" fill="url(#sidebar-c1)"/>
                <defs>
                  <linearGradient id="sidebar-c1" x1="16" y1="6" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8"/>
                    <stop offset="1" stopColor="#6366f1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                DilliCents
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-500 dark:text-sky-400">
                by Diligent
              </span>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>v1.0</span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Expense</span>
        </button>

        {/* Navigation Links */}
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Menu
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400 dark:text-slate-500 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
        {/* Database Persistence Status */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px]">JSON Store</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/50">
          <button
            onClick={onToggleDarkMode}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              !darkMode
                ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Light
          </button>
          <button
            onClick={onToggleDarkMode}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              darkMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Dark
          </button>
        </div>
      </div>
    </aside>
  );
};
