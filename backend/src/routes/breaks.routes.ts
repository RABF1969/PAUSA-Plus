import { Router } from 'express';
import {
    startBreakController,
    endBreakController,
    listBreakTypesController,
    getActiveBreakController,
    createBreakTypeController,
    updateBreakTypeController
} from '../controllers/breaks.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// All break routes require authentication to ensure company isolation
router.use(authenticateToken);

router.get('/active', getActiveBreakController);
router.get('/types', listBreakTypesController);

// Configuration routes - Restricted to admin, gestor, rh
router.post('/types', authorizeRoles('admin', 'gestor', 'rh'), createBreakTypeController);
router.put('/types/:id', authorizeRoles('admin', 'gestor', 'rh'), updateBreakTypeController);

router.post('/start', startBreakController);
router.post('/end', endBreakController);

export default router;
