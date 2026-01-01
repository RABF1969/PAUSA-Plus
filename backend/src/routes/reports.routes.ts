import { Router } from 'express';
import { getHistoryController } from '../controllers/reports.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authenticateToken, getHistoryController);

export default router;
