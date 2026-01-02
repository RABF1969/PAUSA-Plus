import { Router } from 'express';
import { CompaniesController } from '../controllers/CompaniesController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', CompaniesController.create);
router.get('/me', CompaniesController.getMe);
router.put('/:id', CompaniesController.update);

export default router;
