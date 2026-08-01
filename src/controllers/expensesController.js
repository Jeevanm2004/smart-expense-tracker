const expensesStore = require('../store/expensesStore');

/**
 * Helper function to validate ISO date string (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return false;
  // Guard against JS date rollover (e.g. '2026-02-30' silently becomes March 2)
  const [year, month, day] = dateString.split('-').map(Number);
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() + 1 === month &&
    dateObj.getUTCDate() === day
  );
}

/**
 * Helper function to sanitize string input against stored XSS
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

/**
 * Controller handlers for Expenses API
 */
const expensesController = {
  /**
   * POST /expenses - Add a new expense
   */
  createExpense: (req, res) => {
    const { title, amount, category, date } = req.body || {};

    const errors = [];

    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('title is required and must be a non-empty string.');
    } else if (title.trim().length > 150) {
      errors.push('title cannot exceed 150 characters.');
    }

    if (amount === undefined || amount === null) {
      errors.push('amount is required.');
    } else if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push('amount must be a JSON number, not a string. Send: {"amount": 45.50} not {"amount": "45.50"}.');
    } else if (amount <= 0) {
      errors.push('amount must be a positive number greater than 0.');
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      errors.push('category is required and must be a non-empty string.');
    } else if (category.trim().length > 50) {
      errors.push('category cannot exceed 50 characters.');
    }

    if (!date || !isValidDate(date)) {
      errors.push('date is required and must be a valid date in YYYY-MM-DD format.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Failed',
        message: errors.join(' ')
      });
    }

    const createdExpense = expensesStore.add({
      title: sanitizeText(title),
      amount,
      category: sanitizeText(category),
      date
    });
    return res.status(201).json(createdExpense);
  },

  /**
   * GET /expenses/:id - Fetch a single expense by ID
   */
  getExpenseById: (req, res) => {
    const { id } = req.params;
    const item = expensesStore.getById(id);
    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Expense with ID '${id}' not found.`
      });
    }
    return res.status(200).json(item);
  },

  /**
   * PUT /expenses/:id - Update an existing expense
   */
  updateExpense: (req, res) => {
    const { id } = req.params;
    const { title, amount, category, date } = req.body || {};

    const existing = expensesStore.getById(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Expense with ID '${id}' not found.`
      });
    }

    const errors = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        errors.push('title must be a non-empty string.');
      } else if (title.trim().length > 150) {
        errors.push('title cannot exceed 150 characters.');
      }
    }

    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount) || amount <= 0)) {
      errors.push('amount must be a positive number greater than 0.');
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        errors.push('category must be a non-empty string.');
      } else if (category.trim().length > 50) {
        errors.push('category cannot exceed 50 characters.');
      }
    }

    if (date !== undefined && !isValidDate(date)) {
      errors.push('date must be a valid date in YYYY-MM-DD format.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Failed',
        message: errors.join(' ')
      });
    }

    const updated = expensesStore.update(id, {
      title: title !== undefined ? sanitizeText(title) : undefined,
      amount,
      category: category !== undefined ? sanitizeText(category) : undefined,
      date
    });
    return res.status(200).json(updated);
  },

  /**
   * GET /expenses - View expenses with optional filtering (category, search, date range, pagination)
   */
  getExpenses: (req, res) => {
    const { category, search, startDate, endDate, page, limit } = req.query;

    const errors = [];
    if (startDate && !isValidDate(startDate)) {
      errors.push('startDate must be a valid date in YYYY-MM-DD format.');
    }
    if (endDate && !isValidDate(endDate)) {
      errors.push('endDate must be a valid date in YYYY-MM-DD format.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Failed',
        message: errors.join(' ')
      });
    }

    const items = expensesStore.getAll({ category, search, startDate, endDate, page, limit });
    return res.status(200).json(items);
  },

  /**
   * GET /expenses/total - Get total overall + breakdown by category
   */
  getTotals: (req, res) => {
    const totals = expensesStore.getTotals();
    return res.status(200).json(totals);
  },

  /**
   * GET /expenses/monthly-summary - Get aggregated monthly summary (Bonus Feature)
   */
  getMonthlySummary: (req, res) => {
    const summary = expensesStore.getMonthlySummary();
    return res.status(200).json(summary);
  },

  /**
   * GET /expenses/export/csv - Download transactions as CSV file
   */
  exportCSV: (req, res) => {
    const csvContent = expensesStore.toCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses-export.csv');
    return res.status(200).send(csvContent);
  },

  /**
   * DELETE /expenses/:id - Delete an expense by ID
   */
  deleteExpense: (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Expense ID parameter is required.'
      });
    }

    const success = expensesStore.remove(id);
    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Expense with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      message: `Expense '${id}' successfully deleted.`,
      id
    });
  }
};

module.exports = expensesController;
