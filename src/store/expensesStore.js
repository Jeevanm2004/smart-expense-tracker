const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/expenses.json');
const TEMP_FILE = path.join(__dirname, '../data/expenses.json.tmp');

// Realistic seed data
const initialExpenses = [
  {
    id: "exp-101",
    title: "Grocery Shopping (Supermarket)",
    amount: 120.50,
    category: "Food",
    date: "2026-07-28"
  },
  {
    id: "exp-102",
    title: "Train Pass & Commute",
    amount: 85.00,
    category: "Travel",
    date: "2026-07-29"
  },
  {
    id: "exp-103",
    title: "Monthly Broadband Internet",
    amount: 65.25,
    category: "Utilities",
    date: "2026-07-30"
  },
  {
    id: "exp-104",
    title: "Cinema & Snacks",
    amount: 35.00,
    category: "Entertainment",
    date: "2026-07-30"
  },
  {
    id: "exp-105",
    title: "Team Lunch",
    amount: 45.00,
    category: "Food",
    date: "2026-07-31"
  }
];

let expenses = [];
let useFileStorage = true;

// Helper to load expenses from JSON file or seed data
function loadExpenses() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE) && useFileStorage) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      expenses = JSON.parse(fileData);
    } else {
      expenses = JSON.parse(JSON.stringify(initialExpenses));
      if (useFileStorage) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf8');
      }
    }
  } catch (err) {
    // Fallback to in-memory array if file system operations fail or during strict test isolation
    expenses = JSON.parse(JSON.stringify(initialExpenses));
  }
}

// Atomic helper to persist expenses to JSON file safely without race conditions
function saveExpenses() {
  if (!useFileStorage) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Write atomically to temp file, then rename atomically to prevent partial writes during high concurrency
    const dataString = JSON.stringify(expenses, null, 2);
    fs.writeFileSync(TEMP_FILE, dataString, 'utf8');
    fs.renameSync(TEMP_FILE, DATA_FILE);
  } catch (err) {
    console.warn('Warning: Could not persist expenses to JSON file:', err.message);
  }
}

// Initial load
loadExpenses();

const expensesStore = {
  /**
   * Retrieve expenses, with optional category, search, date range filtering & pagination
   */
  getAll: ({ category, search, startDate, endDate, page, limit } = {}) => {
    let result = [...expenses];

    // Filter by Category
    if (category && category !== 'All') {
      const normalizedCat = category.trim().toLowerCase();
      result = result.filter(e => e.category.toLowerCase() === normalizedCat);
    }

    // Filter by Search Query (title or category)
    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }

    // Filter by Date Range (startDate & endDate YYYY-MM-DD)
    if (startDate) {
      result = result.filter(e => e.date >= startDate);
    }
    if (endDate) {
      result = result.filter(e => e.date <= endDate);
    }

    // Sort by date descending, then ID descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Optional Pagination (if page & limit parameters are supplied)
    if (page !== undefined && limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
      const startIndex = (pageNum - 1) * limitNum;
      return result.slice(startIndex, startIndex + limitNum);
    }

    return result;
  },

  /**
   * Get single expense by ID
   */
  getById: (id) => {
    return expenses.find(e => e.id === id);
  },

  /**
   * Add a new expense
   */
  add: ({ title, amount, category, date }) => {
    const newExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category: category.trim(),
      date: date.trim()
    };
    expenses.push(newExpense);
    saveExpenses();
    return newExpense;
  },

  /**
   * Update an existing expense by ID
   */
  update: (id, { title, amount, category, date }) => {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return null;
    }

    const updatedExpense = {
      ...expenses[index],
      title: title !== undefined ? title.trim() : expenses[index].title,
      amount: amount !== undefined ? parseFloat(parseFloat(amount).toFixed(2)) : expenses[index].amount,
      category: category !== undefined ? category.trim() : expenses[index].category,
      date: date !== undefined ? date.trim() : expenses[index].date
    };

    expenses[index] = updatedExpense;
    saveExpenses();
    return updatedExpense;
  },

  /**
   * Remove expense by ID
   */
  remove: (id) => {
    const index = expenses.findIndex(e => e.id === id);
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
  getTotals: () => {
    let overallCents = 0;
    const byCategoryCents = {};

    for (const exp of expenses) {
      const amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
      const cents = Math.round(amt * 100);
      overallCents += cents;

      const cat = exp.category || 'Other';
      if (!byCategoryCents[cat]) {
        byCategoryCents[cat] = 0;
      }
      byCategoryCents[cat] += cents;
    }

    const roundedByCategory = {};
    for (const [cat, sumCents] of Object.entries(byCategoryCents)) {
      roundedByCategory[cat] = parseFloat((sumCents / 100).toFixed(2));
    }

    return {
      overall: parseFloat((overallCents / 100).toFixed(2)),
      byCategory: roundedByCategory,
      count: expenses.length
    };
  },

  /**
   * Calculate monthly summary aggregation using integer cents
   */
  getMonthlySummary: () => {
    const monthlyData = {};

    for (const exp of expenses) {
      if (!exp.date || typeof exp.date !== 'string' || exp.date.length < 7) continue;
      const monthKey = exp.date.substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalCents: 0,
          count: 0,
          categoriesCents: {}
        };
      }

      const amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
      const cents = Math.round(amt * 100);
      monthlyData[monthKey].totalCents += cents;
      monthlyData[monthKey].count += 1;

      const cat = exp.category || 'Other';
      if (!monthlyData[monthKey].categoriesCents[cat]) {
        monthlyData[monthKey].categoriesCents[cat] = 0;
      }
      monthlyData[monthKey].categoriesCents[cat] += cents;
    }

    const summaryList = Object.values(monthlyData).map(m => {
      let topCategory = 'None';
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
          Object.entries(m.categoriesCents).map(([c, s]) => [c, parseFloat((s / 100).toFixed(2))])
        )
      };
    });

    return summaryList.sort((a, b) => b.month.localeCompare(a.month));
  },

  /**
   * Generate CSV format string with CSV Formula Injection protection
   */
  toCSV: () => {
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date'];
    const rows = expenses.map(e => {
      const sanitizeCSVCell = (str) => {
        if (typeof str !== 'string') return '""';
        let cleaned = str.replace(/"/g, '""');
        if (/^[=+\-@\t\r]/.test(cleaned)) {
          cleaned = `'${cleaned}`;
        }
        return `"${cleaned}"`;
      };
      return [
        sanitizeCSVCell(e.id),
        sanitizeCSVCell(e.title),
        typeof e.amount === 'number' ? e.amount.toFixed(2) : '0.00',
        sanitizeCSVCell(e.category),
        sanitizeCSVCell(e.date)
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  /**
   * Reset store state (used for automated test isolation)
   */
  reset: (customData = null, enableFile = false) => {
    useFileStorage = enableFile;
    if (customData) {
      expenses = JSON.parse(JSON.stringify(customData));
    } else {
      expenses = JSON.parse(JSON.stringify(initialExpenses));
    }
  }
};

module.exports = expensesStore;
