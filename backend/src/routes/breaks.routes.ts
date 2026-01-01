import { Router } from 'express';
import { startBreakController, endBreakController, listBreakTypesController } from '../controllers/breaks.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All break routes require authentication to ensure company isolation
router.use(authenticateToken);

router.get('/types', listBreakTypesController);
router.post('/start', startBreakController);
router.post('/end', endBreakController);

export default router;
