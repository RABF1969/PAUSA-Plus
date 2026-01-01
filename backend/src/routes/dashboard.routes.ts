import { Router } from 'express';
import { getOverviewController, getActiveBreaksController } from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', authenticateToken, authorizeRoles('admin', 'gestor', 'rh'), getOverviewController);
router.get('/active', authenticateToken, authorizeRoles('admin', 'gestor', 'rh'), getActiveBreaksController);

export default router;
