import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { UsersController } from '../controllers/users.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// List users (all authenticated users can see)
router.get('/', UsersController.list);

// Get user by ID
router.get('/:id', UsersController.getById);

// Create user (admin only)
router.post('/', authorizeRoles('admin'), UsersController.create);

// Update user (admin only)
router.patch('/:id', authorizeRoles('admin'), UsersController.update);

export default router;
