import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { listUsers, createUser, updateUser, getUserById } from '../services/users.service';
import { AppError } from '../utils/AppError';

export const UsersController = {
    /**
     * GET /users
     * List all users in the authenticated user's company
     */
    async list(req: AuthRequest, res: Response) {
        try {
            const companyId = req.user?.company_id;
            
            if (!companyId) {
                throw new AppError('Empresa não identificada', 401, 'UNAUTHORIZED');
            }

            const users = await listUsers(companyId);
            return res.json(users);
        } catch (error) {
            throw error;
        }
    },

    /**
     * POST /users
     * Create a new user (admin only)
     */
    async create(req: AuthRequest, res: Response) {
        try {
            const companyId = req.user?.company_id;
            
            if (!companyId) {
                throw new AppError('Empresa não identificada', 401, 'UNAUTHORIZED');
            }

            const { name, email, role } = req.body;

            if (!name || !email || !role) {
                throw new AppError('Nome, email e role são obrigatórios', 400, 'MISSING_FIELDS');
            }

            if (!['admin', 'gestor', 'rh'].includes(role)) {
                throw new AppError('Role inválida', 400, 'INVALID_ROLE');
            }

            const result = await createUser({
                company_id: companyId,
                name,
                email,
                role
            });

            return res.status(201).json(result);
        } catch (error) {
            throw error;
        }
    },

    /**
     * PATCH /users/:id
     * Update user information (admin only)
     */
    async update(req: AuthRequest, res: Response) {
        try {
            const companyId = req.user?.company_id;
            const userId = req.params.id;
            
            if (!companyId) {
                throw new AppError('Empresa não identificada', 401, 'UNAUTHORIZED');
            }

            const { name, role, active } = req.body;

            if (role && !['admin', 'gestor', 'rh'].includes(role)) {
                throw new AppError('Role inválida', 400, 'INVALID_ROLE');
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (role !== undefined) updateData.role = role;
            if (active !== undefined) updateData.active = active;

            const user = await updateUser(userId, companyId, updateData);
            return res.json(user);
        } catch (error) {
            throw error;
        }
    },

    /**
     * GET /users/:id
     * Get user details
     */
    async getById(req: AuthRequest, res: Response) {
        try {
            const companyId = req.user?.company_id;
            const userId = req.params.id;
            
            if (!companyId) {
                throw new AppError('Empresa não identificada', 401, 'UNAUTHORIZED');
            }

            const user = await getUserById(userId, companyId);
            return res.json(user);
        } catch (error) {
            throw error;
        }
    }
};
