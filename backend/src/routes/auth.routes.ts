import { Router } from 'express';
import { loginController, getMeController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginController);
router.get('/me', authenticateToken, getMeController);

export default router;
