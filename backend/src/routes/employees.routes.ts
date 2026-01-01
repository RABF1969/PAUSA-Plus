import { Router } from 'express';
import { listEmployeesController, createEmployeeController, updateEmployeeController, toggleEmployeeActiveController } from '../controllers/employees.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, listEmployeesController);
router.post('/', authenticateToken, authorizeRoles('admin', 'rh', 'gestor'), createEmployeeController);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'rh', 'gestor'), updateEmployeeController);
router.patch('/:id/active', authenticateToken, authorizeRoles('admin', 'rh', 'gestor'), toggleEmployeeActiveController);

export default router;
