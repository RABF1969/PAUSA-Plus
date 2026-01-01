import { Router } from 'express';
import { getOverviewController, getActiveBreaksController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/overview', getOverviewController);
router.get('/active', getActiveBreaksController);

export default router;
