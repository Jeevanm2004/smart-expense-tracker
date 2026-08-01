import express from 'express';
import { expensesController } from '../controllers/expensesController';
import { ROUTES } from '../constants';

const router = express.Router();

const { SUB_ROUTES } = ROUTES;

// Static / aggregate routes MUST be declared before parameter routes (/:id)
router.get(SUB_ROUTES.TOTAL, expensesController.getTotals);
router.get(SUB_ROUTES.MONTHLY_SUMMARY, expensesController.getMonthlySummary);
router.get(SUB_ROUTES.EXPORT_CSV, expensesController.exportCSV);

// Standard collection routes
router.get(SUB_ROUTES.ROOT, expensesController.getExpenses);
router.post(SUB_ROUTES.ROOT, expensesController.createExpense);

// Parameter routes
router.get(SUB_ROUTES.ID, expensesController.getExpenseById);
router.put(SUB_ROUTES.ID, expensesController.updateExpense);
router.delete(SUB_ROUTES.ID, expensesController.deleteExpense);

export default router;
