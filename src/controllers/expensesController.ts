import { Request, Response } from 'express';
import { expensesStore } from '../store/expensesStore';
import { VALIDATION, HttpStatus, ErrorResponse, HeaderKey, HeaderValue, COMMON_STRINGS } from '../constants';
import { CreateExpensePayload, UpdateExpensePayload } from '../types';

/**
 * Helper function to validate ISO date string (YYYY-MM-DD)
 */
function isValidDate(dateString: any): boolean {
  if (typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return false;
  // Guard against JS date rollover (e.g. '2026-02-30' silently becomes March 2)
  const [year, month, day] = dateString.split(COMMON_STRINGS.DATE_SEPARATOR).map(Number);
  return dateObj.getUTCFullYear() === year && dateObj.getUTCMonth() + 1 === month && dateObj.getUTCDate() === day;
}

/**
 * Helper function to sanitize string input against stored XSS
 */
function sanitizeText(str: any): any {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

/**
 * Controller handlers for Expenses API
 */
export const expensesController = {
  /**
   * POST /expenses - Add a new expense
   */
  createExpense: (req: Request, res: Response) => {
    const { title, amount, category, date } = (req.body || {}) as Partial<CreateExpensePayload>;

    const errors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim() === COMMON_STRINGS.EMPTY_STRING) {
      errors.push(VALIDATION.TITLE.REQUIRED_MSG);
    } else if (title.trim().length > VALIDATION.TITLE.MAX_LENGTH) {
      errors.push(VALIDATION.TITLE.TOO_LONG_MSG);
    }

    if (amount === undefined || amount === null) {
      errors.push(VALIDATION.AMOUNT.REQUIRED_MSG);
    } else if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push(VALIDATION.AMOUNT.TYPE_MSG);
    } else if (amount <= 0) {
      errors.push(VALIDATION.AMOUNT.POSITIVE_MSG);
    }

    if (!category || typeof category !== 'string' || category.trim() === COMMON_STRINGS.EMPTY_STRING) {
      errors.push(VALIDATION.CATEGORY.REQUIRED_MSG);
    } else if (category.trim().length > VALIDATION.CATEGORY.MAX_LENGTH) {
      errors.push(VALIDATION.CATEGORY.TOO_LONG_MSG);
    }

    if (!date || !isValidDate(date)) {
      errors.push(VALIDATION.DATE.REQUIRED_MSG);
    }

    if (errors.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: ErrorResponse.VALIDATION_FAILED,
        message: errors.join(' '),
      });
    }

    const createdExpense = expensesStore.add({
      title: sanitizeText(title),
      amount: amount!,
      category: sanitizeText(category),
      date: date!,
    });
    return res.status(HttpStatus.CREATED).json(createdExpense);
  },

  /**
   * GET /expenses/:id - Fetch a single expense by ID
   */
  getExpenseById: (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const item = expensesStore.getById(id);
    if (!item) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: ErrorResponse.NOT_FOUND,
        message: `Expense with ID '${id}' not found.`,
      });
    }
    return res.status(HttpStatus.OK).json(item);
  },

  /**
   * PUT /expenses/:id - Update an existing expense
   */
  updateExpense: (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { title, amount, category, date } = (req.body || {}) as Partial<UpdateExpensePayload>;

    const existing = expensesStore.getById(id);
    if (!existing) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: ErrorResponse.NOT_FOUND,
        message: `Expense with ID '${id}' not found.`,
      });
    }

    const errors: string[] = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === COMMON_STRINGS.EMPTY_STRING) {
        errors.push(VALIDATION.TITLE.MUST_BE_STRING_MSG);
      } else if (title.trim().length > VALIDATION.TITLE.MAX_LENGTH) {
        errors.push(VALIDATION.TITLE.TOO_LONG_MSG);
      }
    }

    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount) || amount <= 0)) {
      errors.push(VALIDATION.AMOUNT.POSITIVE_MSG);
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === COMMON_STRINGS.EMPTY_STRING) {
        errors.push(VALIDATION.CATEGORY.MUST_BE_STRING_MSG);
      } else if (category.trim().length > VALIDATION.CATEGORY.MAX_LENGTH) {
        errors.push(VALIDATION.CATEGORY.TOO_LONG_MSG);
      }
    }

    if (date !== undefined && !isValidDate(date)) {
      errors.push(VALIDATION.DATE.INVALID_MSG);
    }

    if (errors.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: ErrorResponse.VALIDATION_FAILED,
        message: errors.join(' '),
      });
    }

    const updated = expensesStore.update(id, {
      title: title !== undefined ? sanitizeText(title) : undefined,
      amount,
      category: category !== undefined ? sanitizeText(category) : undefined,
      date,
    });
    return res.status(HttpStatus.OK).json(updated);
  },

  /**
   * GET /expenses - View expenses with optional filtering (category, search, date range, pagination)
   */
  getExpenses: (req: Request, res: Response) => {
    const { category, search, startDate, endDate, page, limit } = req.query;

    const errors: string[] = [];
    if (startDate && !isValidDate(startDate)) {
      errors.push(VALIDATION.DATE.START_DATE_INVALID);
    }
    if (endDate && !isValidDate(endDate)) {
      errors.push(VALIDATION.DATE.END_DATE_INVALID);
    }

    if (errors.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: ErrorResponse.VALIDATION_FAILED,
        message: errors.join(' '),
      });
    }

    const items = expensesStore.getAll({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      page: typeof page === 'string' || typeof page === 'number' ? page : undefined,
      limit: typeof limit === 'string' || typeof limit === 'number' ? limit : undefined,
    });
    return res.status(HttpStatus.OK).json(items);
  },

  /**
   * GET /expenses/total - Get total overall + breakdown by category
   */
  getTotals: (req: Request, res: Response) => {
    const totals = expensesStore.getTotals();
    return res.status(HttpStatus.OK).json(totals);
  },

  /**
   * GET /expenses/monthly-summary - Get aggregated monthly summary (Bonus Feature)
   */
  getMonthlySummary: (req: Request, res: Response) => {
    const summary = expensesStore.getMonthlySummary();
    return res.status(HttpStatus.OK).json(summary);
  },

  /**
   * GET /expenses/export/csv - Download transactions as CSV file
   */
  exportCSV: (req: Request, res: Response) => {
    const csvContent = expensesStore.toCSV();
    res.setHeader(HeaderKey.CONTENT_TYPE, HeaderValue.TEXT_CSV);
    res.setHeader(HeaderKey.CONTENT_DISPOSITION, HeaderValue.CSV_ATTACHMENT);
    return res.status(HttpStatus.OK).send(csvContent);
  },

  /**
   * DELETE /expenses/:id - Delete an expense by ID
   */
  deleteExpense: (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: ErrorResponse.BAD_REQUEST,
        message: VALIDATION.ID.REQUIRED_MSG,
      });
    }

    const success = expensesStore.remove(id);
    if (!success) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: ErrorResponse.NOT_FOUND,
        message: `Expense with ID '${id}' not found.`,
      });
    }

    return res.status(HttpStatus.OK).json({
      message: `Expense '${id}' successfully deleted.`,
      id,
    });
  },
};
