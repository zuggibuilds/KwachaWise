import { Router } from 'express';
import { complete, getDetail, getGroups, patchMembersReorder, patchPayment, postGroup, postMember, start } from '../controllers/chilimbaController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getGroups);
router.post('/', requireAuth, postGroup);
router.post('/:id/members', requireAuth, postMember);
router.patch('/:id/members/reorder', requireAuth, patchMembersReorder);
router.post('/:id/start', requireAuth, start);
router.get('/:id', requireAuth, getDetail);
router.patch('/:id/rounds/:roundId/payments/:memberId', requireAuth, patchPayment);
router.post('/:id/rounds/:roundId/complete', requireAuth, complete);

export default router;
