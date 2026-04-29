import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { create, list, remove, update, due } from '../controllers/reminderController.js';

const router = express.Router();

router.post('/', requireAuth, create);
router.get('/', requireAuth, list);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

router.get('/due', requireAuth, due);

export default router;
