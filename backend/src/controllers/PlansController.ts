import { Request, Response } from 'express';
import { PlansService } from '../services/PlansService';

export const PlansController = {
  async list(req: Request, res: Response) {
    try {
      const plans = await PlansService.listPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const plan = await PlansService.createPlan(req.body);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const plan = await PlansService.updatePlan(req.params.id, req.body);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
