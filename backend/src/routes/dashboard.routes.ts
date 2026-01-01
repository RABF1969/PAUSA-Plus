import { Router } from 'express';
import { getOverviewController, getActiveBreaksController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', authenticateToken, getOverviewController);
router.get('/active', authenticateToken, getActiveBreaksController);

export default router;
