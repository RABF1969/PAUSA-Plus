import { supabase } from '../lib/supabase';

export interface Company {
  id: string;
  name: string;
  created_at: Date;
}

export const CompaniesService = {
  async createCompany(name: string): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({ name })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateCompany(id: string, name: string): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getCompanyById(id: string): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};
