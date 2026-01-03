import { Router } from 'express';
import { loginController, getMeController, changePasswordController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginController);
router.get('/me', authenticateToken, getMeController);
router.post('/change-password', authenticateToken, changePasswordController);

export default router;
