import { Response } from 'express';
import { listEmployees, createEmployee, updateEmployee, setEmployeeStatus } from '../services/employees.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const listEmployeesController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const result = await listEmployees(companyId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const createEmployeeController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
        }

        const result = await createEmployee({
            company_id: companyId,
            name,
            role
        });

        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const updateEmployeeController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const { id } = req.params;
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
        }

        const validRoles = ['operador', 'gestor', 'rh'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Cargo inválido' });
        }

        const result = await updateEmployee(id, companyId, { name, role });
        return res.status(200).json(result);
    } catch (error: any) {
        const status = error.message.includes('não encontrado') ? 404 : 400;
        return res.status(status).json({ error: error.message });
    }
};

export const toggleEmployeeActiveController = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) throw new Error('Company ID not found in token');

        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== 'boolean') {
            return res.status(400).json({ error: 'Status (active) deve ser um booleano' });
        }

        const result = await setEmployeeStatus(id, companyId, active);
        return res.status(200).json(result);
    } catch (error: any) {
        const status = error.message.includes('não encontrado') ? 404 : 400;
        return res.status(status).json({ error: error.message });
    }
};
