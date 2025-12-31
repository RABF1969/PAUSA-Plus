import { Router } from 'express';
import { startBreakController, endBreakController } from '../controllers/breaks.controller';

const router = Router();

router.post('/start', startBreakController);
router.post('/end', endBreakController);

export default router;
