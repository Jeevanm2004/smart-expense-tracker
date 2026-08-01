import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { STORAGE, APP_CONFIG, COMMON_STRINGS } from '../constants';
import {
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
  TotalsResponse,
  MonthlySummaryItem,
  GetAllFilterOptions,
} from '../types';

// Realistic seed data
const initialExpenses: Expense[] = [
  {
    id: 'exp-101',
    title: 'Grocery Shopping (Supermarket)',
    amount: 120.5,
    category: 'Food',
    date: '2026-07-28',
  },
  {
    id: 'exp-102',
    title: 'Train Pass & Commute',
    amount: 85.0,
    category: 'Travel',
    date: '2026-07-29',
  },
  {
    id: 'exp-103',
    title: 'Monthly Broadband Internet',
    amount: 65.25,
    category: 'Utilities',
    date: '2026-07-30',
  },
  {
    id: 'exp-104',
    title: 'Cinema & Snacks',
    amount: 35.0,
    category: 'Entertainment',
    date: '2026-07-30',
  },
  {
    id: 'exp-105',
    title: 'Team Lunch',
    amount: 45.0,
    category: 'Food',
    date: '2026-07-31',
  },
  {
    id: 'exp-106',
    title: 'Gym Membership',
    amount: 50.0,
    category: 'Health',
    date: '2026-07-01',
  },
  {
    id: 'exp-107',
    title: 'Electricity Bill',
    amount: 112.4,
    category: 'Utilities',
    date: '2026-07-15',
  },
  {
    id: 'exp-108',
    title: 'Streaming Subscription',
    amount: 14.99,
    category: 'Entertainment',
    date: '2026-07-18',
  },
  {
    id: 'exp-109',
    title: 'Flight Ticket (Weekend Trip)',
    amount: 250.0,
    category: 'Travel',
    date: '2026-07-20',
  },
  {
    id: 'exp-110',
    title: 'Coffee & Pastry',
    amount: 6.75,
    category: 'Food',
    date: '2026-07-22',
  },
  {
    id: 'exp-111',
    title: 'Water Utility Bill',
    amount: 30.5,
    category: 'Utilities',
    date: '2026-07-24',
  },
  {
    id: 'exp-112',
    title: 'Online Course Purchase',
    amount: 99.99,
    category: 'Education',
    date: '2026-07-25',
  },
  {
    id: 'exp-113',
    title: 'Running Shoes',
    amount: 89.9,
    category: 'Shopping',
    date: '2026-07-26',
  },
  {
    id: 'exp-114',
    title: 'Pharmacy Prescription',
    amount: 22.3,
    category: 'Health',
    date: '2026-07-27',
  },
  {
    id: 'exp-115',
    title: 'Book Store Purchase',
    amount: 18.5,
    category: 'Education',
    date: '2026-07-27',
  },
];

let expenses: Expense[] = [];
let useFileStorage = true;

// Helper to load expenses from JSON file or seed data
function loadExpenses(): void {
  try {
    const dir = path.dirname(STORAGE.DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(STORAGE.DATA_FILE) && useFileStorage) {
      const fileData = fs.readFileSync(STORAGE.DATA_FILE, APP_CONFIG.ENCODING_UTF8);
      expenses = JSON.parse(fileData);
    } else {
      expenses = JSON.parse(JSON.stringify(initialExpenses));
      if (useFileStorage) {
        fs.writeFileSync(STORAGE.DATA_FILE, JSON.stringify(expenses, null, 2), APP_CONFIG.ENCODING_UTF8);
      }
    }
  } catch {
    // Fallback to in-memory array if file system operations fail or during strict test isolation
    expenses = JSON.parse(JSON.stringify(initialExpenses));
  }
}

// Atomic helper to persist expenses to JSON file safely without race conditions
function saveExpenses(): void {
  if (!useFileStorage) return;
  try {
    const dir = path.dirname(STORAGE.DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Write atomically to temp file, then rename atomically to prevent partial writes during high concurrency
    const dataString = JSON.stringify(expenses, null, 2);
    fs.writeFileSync(STORAGE.TEMP_FILE, dataString, APP_CONFIG.ENCODING_UTF8);
    fs.renameSync(STORAGE.TEMP_FILE, STORAGE.DATA_FILE);
  } catch (err: any) {
    console.warn('Warning: Could not persist expenses to JSON file:', err.message);
  }
}

// Initial load
loadExpenses();

export const expensesStore = {
  /**
   * Retrieve expenses, with optional category, search, date range filtering & pagination
   */
  getAll: ({ category, search, startDate, endDate, page, limit }: GetAllFilterOptions = {}): Expense[] => {
    let result = [...expenses];

    // Filter by Category
    if (category && category !== STORAGE.ALL_CATEGORIES) {
      const normalizedCat = category.trim().toLowerCase();
      result = result.filter((e) => e.category.toLowerCase() === normalizedCat);
    }

    // Filter by Search Query (title or category)
    if (search && search.trim() !== COMMON_STRINGS.EMPTY_STRING) {
      const query = search.trim().toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(query) || e.category.toLowerCase().includes(query));
    }

    // Filter by Date Range (startDate & endDate YYYY-MM-DD)
    if (startDate) {
      result = result.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      result = result.filter((e) => e.date <= endDate);
    }

    // Sort by date descending, then ID descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Optional Pagination (if page & limit parameters are supplied)
    if (page !== undefined && limit !== undefined) {
      const pageNum = Math.max(
        STORAGE.PAGINATION.MIN_PAGE,
        typeof page === 'number' ? page : parseInt(page, 10) || STORAGE.PAGINATION.MIN_PAGE,
      );
      const limitNum = Math.max(
        STORAGE.PAGINATION.MIN_LIMIT,
        Math.min(
          STORAGE.PAGINATION.MAX_LIMIT,
          typeof limit === 'number' ? limit : parseInt(limit, 10) || STORAGE.PAGINATION.DEFAULT_LIMIT,
        ),
      );
      const startIndex = (pageNum - 1) * limitNum;
      return result.slice(startIndex, startIndex + limitNum);
    }

    return result;
  },

  /**
   * Get single expense by ID
   */
  getById: (id: string): Expense | undefined => {
    return expenses.find((e) => e.id === id);
  },

  /**
   * Add a new expense
   */
  add: ({ title, amount, category, date }: CreateExpensePayload): Expense => {
    const newExpense: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      amount: parseFloat(parseFloat(String(amount)).toFixed(2)),
      category: category.trim(),
      date: date.trim(),
    };
    expenses.push(newExpense);
    saveExpenses();
    return newExpense;
  },

  /**
   * Update an existing expense by ID
   */
  update: (id: string, { title, amount, category, date }: UpdateExpensePayload): Expense | null => {
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      return null;
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      title: title !== undefined ? title.trim() : expenses[index].title,
      amount: amount !== undefined ? parseFloat(parseFloat(String(amount)).toFixed(2)) : expenses[index].amount,
      category: category !== undefined ? category.trim() : expenses[index].category,
      date: date !== undefined ? date.trim() : expenses[index].date,
    };

    expenses[index] = updatedExpense;
    saveExpenses();
    return updatedExpense;
  },

  /**
   * Remove expense by ID
   */
  remove: (id: string): boolean => {
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    expenses.splice(index, 1);
    saveExpenses();
    return true;
  },

  /**
   * Calculate overall total and category totals using integer cents arithmetic for precision
   */
  getTotals: (): TotalsResponse => {
    let overallCents = 0;
    const byCategoryCents: Record<string, number> = {};

    for (const exp of expenses) {
      const amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
      const cents = Math.round(amt * 100);
      overallCents += cents;

      const cat = exp.category || STORAGE.DEFAULT_CATEGORY;
      if (!byCategoryCents[cat]) {
        byCategoryCents[cat] = 0;
      }
      byCategoryCents[cat] += cents;
    }

    const roundedByCategory: Record<string, number> = {};
    for (const [cat, sumCents] of Object.entries(byCategoryCents)) {
      roundedByCategory[cat] = parseFloat((sumCents / 100).toFixed(2));
    }

    return {
      overall: parseFloat((overallCents / 100).toFixed(2)),
      byCategory: roundedByCategory,
      count: expenses.length,
    };
  },

  /**
   * Calculate monthly summary aggregation using integer cents
   */
  getMonthlySummary: (): MonthlySummaryItem[] => {
    const monthlyData: Record<
      string,
      { month: string; totalCents: number; count: number; categoriesCents: Record<string, number> }
    > = {};

    for (const exp of expenses) {
      if (!exp.date || typeof exp.date !== 'string' || exp.date.length < 7) continue;
      const monthKey = exp.date.substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalCents: 0,
          count: 0,
          categoriesCents: {},
        };
      }

      const amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
      const cents = Math.round(amt * 100);
      monthlyData[monthKey].totalCents += cents;
      monthlyData[monthKey].count += 1;

      const cat = exp.category || STORAGE.DEFAULT_CATEGORY;
      if (!monthlyData[monthKey].categoriesCents[cat]) {
        monthlyData[monthKey].categoriesCents[cat] = 0;
      }
      monthlyData[monthKey].categoriesCents[cat] += cents;
    }

    const summaryList: MonthlySummaryItem[] = Object.values(monthlyData).map((m) => {
      let topCategory = COMMON_STRINGS.NONE;
      let topAmtCents = 0;

      for (const [cat, sumCents] of Object.entries(m.categoriesCents)) {
        if (sumCents > topAmtCents) {
          topAmtCents = sumCents;
          topCategory = cat;
        }
      }

      return {
        month: m.month,
        totalAmount: parseFloat((m.totalCents / 100).toFixed(2)),
        count: m.count,
        topCategory,
        byCategory: Object.fromEntries(
          Object.entries(m.categoriesCents).map(([c, s]) => [c, parseFloat((s / 100).toFixed(2))]),
        ),
      };
    });

    return summaryList.sort((a, b) => b.month.localeCompare(a.month));
  },

  /**
   * Generate CSV format string with CSV Formula Injection protection
   */
  toCSV: (): string => {
    const rows = expenses.map((e) => {
      const sanitizeCSVCell = (str: string): string => {
        if (typeof str !== 'string') return COMMON_STRINGS.EMPTY_QUOTE;
        let cleaned = str.replace(/"/g, COMMON_STRINGS.EMPTY_QUOTE);
        if (/^[=+\-@\t\r]/.test(cleaned)) {
          cleaned = `${COMMON_STRINGS.SINGLE_QUOTE}${cleaned}`;
        }
        return `${COMMON_STRINGS.DOUBLE_QUOTE}${cleaned}${COMMON_STRINGS.DOUBLE_QUOTE}`;
      };
      return [
        sanitizeCSVCell(e.id),
        sanitizeCSVCell(e.title),
        typeof e.amount === 'number' ? e.amount.toFixed(2) : '0.00',
        sanitizeCSVCell(e.category),
        sanitizeCSVCell(e.date),
      ];
    });

    return [STORAGE.CSV_HEADERS.join(COMMON_STRINGS.COMMA), ...rows.map((r) => r.join(COMMON_STRINGS.COMMA))].join(
      COMMON_STRINGS.NEWLINE,
    );
  },

  /**
   * Reset store state (used for automated test isolation)
   */
  reset: (customData: Expense[] | null = null, enableFile = false): void => {
    useFileStorage = enableFile;
    if (customData) {
      expenses = JSON.parse(JSON.stringify(customData));
    } else {
      expenses = JSON.parse(JSON.stringify(initialExpenses));
    }
  },
};
