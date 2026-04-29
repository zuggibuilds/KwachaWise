import { Router } from 'express';
import { getCategories, postCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getCategories);
router.post('/', requireAuth, postCategory);

export default router;
