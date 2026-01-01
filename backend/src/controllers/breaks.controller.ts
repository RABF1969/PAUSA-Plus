import { Response } from 'express';
import { startBreak, endBreak, listBreakTypes, getActiveBreakByBadge, createBreakType, updateBreakType } from '../services/breaks.service';
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
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const result = await endBreak({ badge_code, break_id, company_id: companyId });

        return res.status(200).json(result);
    } catch (error: any) {
        const status = error.status || 400;
        return res.status(status).json({ error: error.message });
    }
};

export const listBreakTypesController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const includeInactive = req.query.include_inactive === 'true';

        const result = await listBreakTypes(companyId, includeInactive);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const createBreakTypeController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const { name, max_minutes, capacity } = req.body;
        const result = await createBreakType({ company_id: companyId, name, max_minutes, capacity });

        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const updateBreakTypeController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const { id } = req.params;
        const updates = req.body;

        const result = await updateBreakType(id, companyId, updates);
        return res.status(200).json(result);
    } catch (error: any) {
        const status = error.status || 400;
        return res.status(status).json({ error: error.message });
    }
};

export const getActiveBreakController = async (req: AuthRequest, res: Response) => {
    try {
        const { badge_code } = req.query;
        const companyId = req.user?.company_id;

        if (!companyId) throw new Error('Company ID not found in token');
        if (!badge_code) return res.status(400).json({ error: 'Badge code is required' });

        const result = await getActiveBreakByBadge(badge_code as string, companyId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};
