import { Router } from 'express';
import { CompaniesController } from '../controllers/CompaniesController';
import { CompanyController } from '../controllers/CompanyController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', CompaniesController.create);
router.get('/me', CompaniesController.getMe);
router.put('/:id', CompaniesController.update);

// Read-only overview endpoint
router.get('/overview', CompanyController.getOverview);

export default router;
