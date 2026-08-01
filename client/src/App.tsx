import { useState, useEffect, useCallback } from 'react';
import { Expense, TotalsResponse, MonthlySummaryItem, CreateExpensePayload, UpdateExpensePayload, ToastMessage } from './types';
import { fetchExpenses, fetchTotals, fetchMonthlySummary, createExpense, updateExpense, deleteExpense, downloadCSV } from './api/expenses';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/dashboard/MetricsOverview';
import { AnalyticsSection } from './components/dashboard/AnalyticsSection';
import { MonthlySummaryTable } from './components/dashboard/MonthlySummaryTable';
import { TransactionsTable } from './components/dashboard/TransactionsTable';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExpenseDetailDrawer } from './components/ExpenseDetailDrawer';
import { Toast } from './components/Toast';
import { ArrowRight } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<TotalsResponse>({ overall: 0, byCategory: {} });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpenseId, setViewingExpenseId] = useState<string | null>(null);

  // Delete confirmation modal
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteExpense = expenses.find((e) => e.id === pendingDeleteId) ?? null;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync dark mode class on html root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch live API data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [expenseList, totalData, summaryData] = await Promise.all([
        fetchExpenses(selectedCategory, searchQuery, startDate, endDate),
        fetchTotals(),
        fetchMonthlySummary(),
      ]);
      setExpenses(expenseList);
      setTotals(totalData);
      setMonthlySummary(summaryData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load expense tracker data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddExpense = async (payload: CreateExpensePayload) => {
    await createExpense(payload);
    addToast(`Expense "${payload.title}" created!`, 'success');
    await loadData();
  };

  const handleUpdateExpense = async (id: string, payload: UpdateExpensePayload) => {
    await updateExpense(id, payload);
    addToast(`Expense updated successfully!`, 'success');
    await loadData();
  };

  // Open the delete confirmation modal (no API call yet)
  const handleDeleteExpense = (id: string) => {
    setPendingDeleteId(id);
  };

  // Called when user clicks "Delete" inside the modal
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteExpense(id);
      addToast('Expense deleted.', 'info');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDownloadCSV = () => {
    downloadCSV();
    addToast('CSV export downloaded!', 'info');
  };

  const categories = Array.from(
    new Set([...Object.keys(totals.byCategory), 'Food', 'Travel', 'Utilities', 'Entertainment'])
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0F1117] text-white bg-ambient-dark' : 'bg-[#F8F9FD] text-slate-900 bg-ambient-light'}`}>
      {/* Top Navbar — Replaces left vertical sidebar completely */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Full Width Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between shadow-sm">
            <span>{errorMessage}</span>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div key="dashboard" className="space-y-8 animate-tabIn">
            <MetricsOverview
              overallExpense={totals.overall}
              expenses={expenses}
              byCategory={totals.byCategory}
            />

            <AnalyticsSection
              monthlySummary={monthlySummary}
              byCategory={totals.byCategory}
              overallExpense={totals.overall}
            />

            {/* Monthly Breakdown Table — surfaces full /monthly-summary API data */}
            <MonthlySummaryTable monthlySummary={monthlySummary} />

            {/* Quick Link Banner to Full Transactions */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Need to manage or export transactions?</h3>
                <p className="text-xs text-slate-300 font-semibold mt-1">Access the full transaction suite with multi-column sorting, search, category filters, and CSV export.</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('transactions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>View Transactions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS VIEW */}
        {activeTab === 'transactions' && (
          <div key="transactions" className="space-y-6 animate-tabIn">
            <TransactionsTable
              expenses={expenses}
              onDelete={handleDeleteExpense}
              onEdit={handleOpenEditModal}
              onViewDetail={(id) => setViewingExpenseId(id)}
              onDownloadCSV={handleDownloadCSV}
              onOpenAddModal={handleOpenAddModal}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              categories={categories}
              isLoading={isLoading}
            />
          </div>
        )}

      </main>

      {/* Expense Detail Drawer (GET /expenses/:id) */}
      <ExpenseDetailDrawer
        expenseId={viewingExpenseId}
        onClose={() => setViewingExpenseId(null)}
      />

      {/* Expense Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
        onUpdate={handleUpdateExpense}
        editingExpense={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={pendingDeleteId !== null}
        expenseTitle={pendingDeleteExpense?.title ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {/* Toast Feedback Messages */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
