
import { Router } from 'express';
import { MasterController } from '../controllers/MasterController';
import { masterAuth } from '../middleware/masterAuth.middleware';

const masterRouter = Router();
const masterController = new MasterController();

// Apply Master Auth Protection to all routes in this router
masterRouter.use(masterAuth);

/**
 * @route POST /master/companies
 * Create a new company with Master settings
 */
masterRouter.post('/companies', masterController.createCompany);

/**
 * @route GET /master/companies
 * List all companies (Super Admin view)
 */
masterRouter.get('/companies', masterController.listCompanies);

/**
 * @route PATCH /master/companies/:id
 * Update company status/plan/limits
 */
masterRouter.patch('/companies/:id', masterController.updateCompany);

export { masterRouter };
