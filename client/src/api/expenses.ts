import { Expense, TotalsResponse, MonthlySummaryItem, CreateExpensePayload, UpdateExpensePayload } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchExpenses(
  category?: string,
  search?: string,
  startDate?: string,
  endDate?: string
): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const url = `${API_BASE}/expenses${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch expenses');
  }
  return res.json();
}

export async function fetchExpenseById(id: string): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Expense not found');
  }
  return res.json();
}

export async function fetchTotals(): Promise<TotalsResponse> {
  const res = await fetch(`${API_BASE}/expenses/total`);
  if (!res.ok) {
    throw new Error('Failed to fetch expense totals');
  }
  return res.json();
}

export async function fetchMonthlySummary(): Promise<MonthlySummaryItem[]> {
  const res = await fetch(`${API_BASE}/expenses/monthly-summary`);
  if (!res.ok) {
    throw new Error('Failed to fetch monthly summary');
  }
  return res.json();
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add expense');
  }
  return res.json();
}

export async function updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update expense');
  }
  return res.json();
}

export async function deleteExpense(id: string): Promise<{ message: string; id: string }> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete expense');
  }
  return res.json();
}

export function downloadCSV(): void {
  window.open(`${API_BASE}/expenses/export/csv`, '_blank');
}

export async function fetchHealthCheck(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  return res.json();
}

