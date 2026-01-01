import { Request, Response } from 'express';
import { getOverviewStats, getActiveBreaks } from '../services/dashboard.service';

export const getOverviewController = async (req: Request, res: Response) => {
    try {
        const result = await getOverviewStats();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getActiveBreaksController = async (req: Request, res: Response) => {
    try {
        const result = await getActiveBreaks();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
