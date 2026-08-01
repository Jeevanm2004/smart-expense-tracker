const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');

// Static / aggregate routes MUST be declared before parameter routes (/:id)
router.get('/total', expensesController.getTotals);
router.get('/monthly-summary', expensesController.getMonthlySummary);
router.get('/export/csv', expensesController.exportCSV);

// Standard collection routes
router.get('/', expensesController.getExpenses);
router.post('/', expensesController.createExpense);

// Parameter routes
router.get('/:id', expensesController.getExpenseById);
router.put('/:id', expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

module.exports = router;
