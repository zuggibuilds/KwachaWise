import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAdvice, chat } from '../controllers/aiController.js';

const router = Router();

router.get('/advice', requireAuth, getAdvice);
router.post('/chat', requireAuth, chat);

export default router;
