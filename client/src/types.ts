export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface TotalsResponse {
  overall: number;
  byCategory: Record<string, number>;
  count?: number;
}

export interface MonthlySummaryItem {
  month: string;
  totalAmount: number;
  count: number;
  topCategory: string;
  byCategory?: Record<string, number>;
}

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface UpdateExpensePayload {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type SortField = 'date' | 'title' | 'amount' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  category: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}
