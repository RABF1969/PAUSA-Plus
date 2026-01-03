import { supabase } from '../lib/supabase';
// Removed local dotenv and createClient


export const PlansService = {
  async listPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },

  async createPlan(data: { name: string; code: string; employee_limit: number; plate_limit: number; price_cents: number; billing_cycle: 'monthly' | 'yearly'; is_active: boolean }) {
    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newPlan;
  },

  async updatePlan(id: string, data: Partial<{ name: string; code: string; employee_limit: number; plate_limit: number; price_cents: number; billing_cycle: 'monthly' | 'yearly'; is_active: boolean }>) {
    const { data: updatedPlan, error } = await supabase
      .from('plans')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedPlan;
  },
  
  async getPlanById(id: string) {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw new Error(error.message);
      return data;
  }
};
