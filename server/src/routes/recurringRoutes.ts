import express from 'express';
import { create, getOne, list, remove } from '../controllers/recurringController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, create);
router.get('/', requireAuth, list);
router.get('/:id', requireAuth, getOne);
router.delete('/:id', requireAuth, remove);

export default router;
