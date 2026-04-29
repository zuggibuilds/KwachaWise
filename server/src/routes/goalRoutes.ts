import { Router } from 'express';
import { getGoals, patchGoal, postGoal } from '../controllers/goalController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getGoals);
router.post('/', requireAuth, postGoal);
router.patch('/:id', requireAuth, patchGoal);

export default router;
