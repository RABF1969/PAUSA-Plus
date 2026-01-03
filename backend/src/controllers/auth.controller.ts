import { Request, Response } from 'express';
import { login } from '../services/auth.service';
import { changeUserPassword } from '../services/users.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/AppError';

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: { 
                    code: 'MISSING_FIELDS', 
                    message: 'Email e senha são obrigatórios' 
                } 
            });
        }

        const result = await login(email, password);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(401).json({ 
            error: { 
                code: 'INVALID_CREDENTIALS', 
                message: error.message 
            } 
        });
    }
};

export const getMeController = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: { 
                code: 'UNAUTHORIZED', 
                message: 'Não autenticado' 
            } 
        });
    }
    return res.status(200).json(req.user);
};

export const changePasswordController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            throw new AppError('Usuário não autenticado', 401, 'UNAUTHORIZED');
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new AppError('Senha atual e nova senha são obrigatórias', 400, 'MISSING_FIELDS');
        }

        await changeUserPassword(userId, currentPassword, newPassword);

        return res.json({ 
            message: 'Senha alterada com sucesso' 
        });
    } catch (error) {
        throw error;
    }
};
