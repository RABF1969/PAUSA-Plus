
import { supabase } from '../lib/supabase';

export interface CreateCompanyDTO {
  name: string;
  plan?: 'trial' | 'basic' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  max_employees?: number;
  max_plates?: number;
}

export interface UpdateCompanyDTO {
  plan?: 'trial' | 'basic' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  max_employees?: number;
  max_plates?: number;
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
          plan: data.plan || 'basic',
          status: data.status || 'active',
          max_employees: data.max_employees || 10,
          max_plates: data.max_plates || 2
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
   * List all companies (for Master Admin Dashboard)
   */
  async listCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
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
    const { data: company, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return company;
  }
}
