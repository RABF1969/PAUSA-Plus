import { Router } from 'express';
import { PlatesController } from '../controllers/PlatesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route to resolve generic plate code (used by kiosk before login)
router.get('/resolve', PlatesController.resolve);

// Protected routes
router.use(authenticateToken);
router.get('/', PlatesController.list);
router.post('/', PlatesController.create);
router.patch('/:id/active', PlatesController.toggleActive);

export default router;
