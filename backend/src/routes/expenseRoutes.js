import express from 'express';
import {
  createExpense,
  getExpenses,
  deleteExpense,
  createSettlement,
  getMySettlements,
} from '../controllers/expenseController.js';
import protect from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createExpenseSchema, createSettlementSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(protect);

router.get('/settlements/my', getMySettlements);
router.post('/', validateBody(createExpenseSchema), createExpense);
router.get('/group/:groupId', getExpenses);
router.delete('/:id', deleteExpense);
router.post('/settle', validateBody(createSettlementSchema), createSettlement);

export default router;
