import { Router } from 'express';
import { startBreakController, endBreakController, listBreakTypesController } from '../controllers/breaks.controller';

const router = Router();

router.get('/types', listBreakTypesController);
router.post('/start', startBreakController);
router.post('/end', endBreakController);

export default router;
