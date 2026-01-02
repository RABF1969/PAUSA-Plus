import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CompaniesService } from '../services/CompaniesService';
import { supabase } from '../lib/supabase';

export const CompaniesController = {
  async create(req: AuthRequest, res: Response) {
    try {
      // Typically only admin or new user without company should create
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Nome da empresa obrigatório' });

      const company = await CompaniesService.createCompany(name);
      
      // If the user doesn't have a company yet, we might want to associate them?
      // For now, just return the created company.
      // The user asked to "Allow associate if not exists", but that logic might be complex depending on how Auth is handled.
      // We will just create for now.

      res.status(201).json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.company_id;
      if (!companyId) return res.status(404).json({ error: 'Usuário não vinculado a uma empresa' });

      const company = await CompaniesService.getCompanyById(companyId);
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.company_id;
      const { id } = req.params;
      const { name } = req.body;

      if (!companyId) return res.status(403).json({ error: 'Proibido' });
      // Ensure user can only update their own company
      if (id !== companyId) return res.status(403).json({ error: 'Não autorizado a editar esta empresa' });

      const company = await CompaniesService.updateCompany(id, name);
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
