import { Router } from 'express';
import { getTransactions, patchTransaction, postTransaction, removeTransaction } from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getTransactions);
router.post('/', requireAuth, postTransaction);
router.patch('/:id', requireAuth, patchTransaction);
router.delete('/:id', requireAuth, removeTransaction);

export default router;
