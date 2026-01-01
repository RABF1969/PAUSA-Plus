import { Response } from 'express';
import { getBreakHistory } from '../services/reports.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getHistoryController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const {
            page,
            limit,
            startDate,
            endDate,
            employeeId,
            breakTypeId
        } = req.query;

        const result = await getBreakHistory({
            companyId,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            startDate: startDate as string,
            endDate: endDate as string,
            employeeId: employeeId as string,
            breakTypeId: breakTypeId as string
        });

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
