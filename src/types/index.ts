export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
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

export interface TotalsResponse {
  overall: number;
  byCategory: Record<string, number>;
  count: number;
}

export interface MonthlySummaryItem {
  month: string;
  totalAmount: number;
  count: number;
  topCategory: string;
  byCategory: Record<string, number>;
}

export interface GetAllFilterOptions {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: string | number;
  limit?: string | number;
}
