import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { list, markAsRead, stream } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', requireAuth, list);
router.patch('/:id/read', requireAuth, markAsRead);
router.get('/stream', requireAuth, stream);

export default router;
