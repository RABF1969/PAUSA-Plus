
import { Request, Response } from 'express';
import { MasterService } from '../services/MasterService';

const masterService = new MasterService();

export class MasterController {
  
  async createCompany(req: Request, res: Response) {
    try {
      const { name, plan, status, max_employees, max_plates } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Optional: Add strict Enum validation here if desired, otherwise DB will catch it.
      
      const company = await masterService.createCompany({
        name,
        plan,
        status,
        max_employees,
        max_plates
      });

      return res.status(201).json(company);
    } catch (error: any) {
      console.error('Master Create Error:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  async listCompanies(req: Request, res: Response) {
    try {
      const companies = await masterService.listCompanies();
      return res.json(companies);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Filter allowed updates
      const allowedKeys = ['name', 'plan', 'status', 'max_employees', 'max_plates'];
      const filteredUpdates: any = {};
      
      for (const key of allowedKeys) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      const company = await masterService.updateCompany(id, filteredUpdates);
      return res.json(company);
    } catch (error: any) {
      console.error('Master Update Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
