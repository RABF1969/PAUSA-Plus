import { Request, Response } from 'express';
import { startBreak, endBreak, listBreakTypes } from '../services/breaks.service';

export const startBreakController = async (req: Request, res: Response) => {
    try {
        const { badge_code, break_type_id } = req.body;

        if (!badge_code || !break_type_id) {
            return res.status(400).json({ error: 'badge_code and break_type_id are required' });
        }

        const result = await startBreak({ badge_code, break_type_id });

        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const endBreakController = async (req: Request, res: Response) => {
    try {
        const { badge_code } = req.body;

        if (!badge_code) {
            return res.status(400).json({ error: 'badge_code is required' });
        }

        const result = await endBreak({ badge_code });

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const listBreakTypesController = async (req: Request, res: Response) => {
    try {
        const result = await listBreakTypes();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};
