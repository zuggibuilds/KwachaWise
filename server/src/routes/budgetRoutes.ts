import { Router } from 'express';
import { getBudgets, patchBudget, postBudget, removeBudget } from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getBudgets);
router.post('/', requireAuth, postBudget);
router.patch('/:id', requireAuth, patchBudget);
router.delete('/:id', requireAuth, removeBudget);

export default router;
