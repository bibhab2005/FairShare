import express from 'express';
import {
  createExpense,
  getExpenses,
  deleteExpense,
  createSettlement,
} from '../controllers/expenseController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createExpense);
router.get('/group/:groupId', getExpenses);
router.delete('/:id', deleteExpense);
router.post('/settle', createSettlement);

export default router;
