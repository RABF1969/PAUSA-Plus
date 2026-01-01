import { Response } from 'express';
import { getOverviewStats, getActiveBreaks } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getOverviewController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const result = await getOverviewStats(companyId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getActiveBreaksController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const result = await getActiveBreaks(companyId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
