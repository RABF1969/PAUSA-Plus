import { Request, Response } from 'express';
import { login } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const result = await login(email, password);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(401).json({ error: error.message });
    }
};

export const getMeController = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    return res.status(200).json(req.user);
};
