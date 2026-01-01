import { Response } from 'express';
import { startBreak, endBreak, listBreakTypes } from '../services/breaks.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const startBreakController = async (req: AuthRequest, res: Response) => {
    try {
        const { badge_code, break_type_id } = req.body;
        const companyId = req.user?.company_id;

        if (!companyId) throw new Error('Company ID not found in token');

        if (!badge_code || !break_type_id) {
            return res.status(400).json({ error: 'badge_code and break_type_id are required' });
        }

        const result = await startBreak({ badge_code, break_type_id });

        return res.status(201).json(result);
    } catch (error: any) {
        const status = error.status || 400;
        return res.status(status).json({ error: error.message });
    }
};

export const endBreakController = async (req: AuthRequest, res: Response) => {
    try {
        const { badge_code, break_id } = req.body;

        if (!badge_code && !break_id) {
            return res.status(400).json({ error: 'break_id or badge_code is required' });
        }

        const result = await endBreak({ badge_code, break_id });

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const listBreakTypesController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const result = await listBreakTypes(companyId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};
