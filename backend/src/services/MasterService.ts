
import { supabase } from '../lib/supabase';

export interface CreateCompanyDTO {
  name: string;
  plan_id?: string;
  status?: 'active' | 'suspended';
  max_employees?: number;
  max_plates?: number;
}

export interface UpdateCompanyDTO {
  plan_id?: string;
  status?: 'active' | 'suspended';
  max_employees?: number;
  max_plates?: number; // Send 0 or null to remove override
  name?: string;
}

export class MasterService {
  /**
   * Create a new company with specific plan and limits.
   */
  async createCompany(data: CreateCompanyDTO) {
    const { data: company, error } = await supabase
      .from('companies')
      .insert([
        {
          name: data.name,
          plan_id: data.plan_id,
          status: data.status || 'active',
          max_employees: data.max_employees,
          max_plates: data.max_plates
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return company;
  }

  /**
   * List all companies (for Master Admin Dashboard). Includes Plan data.
   */
  async listCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*, plans(name, code)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update existing company (upgrade/downgrade/suspend)
   */
  async updateCompany(id: string, data: UpdateCompanyDTO) {
     const updateData: any = { ...data };
     
     // Handle cases where we want to clear overrides (if UI sends null/0 specifically for this purpose, logic might vary).
     // Ideally, frontend sends null to clear override. Supabase handles null update correctly.
     
    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return company;
  }
}
