import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PlatesService } from '../services/PlatesService';

export const PlatesController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.company_id;
      if (!companyId) return res.status(403).json({ error: 'Empresa não identificada' });
      
      const plates = await PlatesService.listPlates(companyId);
      res.json(plates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.company_id;
      const { name, allowed_break_type_ids } = req.body;
      if (!companyId) return res.status(403).json({ error: 'Empresa não identificada' });
      
      const plate = await PlatesService.createPlate(companyId, name, allowed_break_type_ids);
      res.status(201).json(plate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async toggleActive(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.company_id;
      const { id } = req.params;
      const { active } = req.body;
      
      if (!companyId) return res.status(403).json({ error: 'Empresa não identificada' });

      const plate = await PlatesService.toggleActive(id, companyId, active);
      res.json(plate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async resolve(req: AuthRequest, res: Response) {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ error: 'Código (code) obrigatório' });
      
      const plate = await PlatesService.resolveByCode(code);
      res.json(plate);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};
