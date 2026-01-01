import { Router } from 'express';
import { getHistoryController } from '../controllers/reports.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authenticateToken, authorizeRoles('admin', 'gestor', 'rh'), getHistoryController);

export default router;
