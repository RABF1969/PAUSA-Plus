
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

  /**
   * Get Master Dashboard Overview data
   */
  async getDashboardOverview() {
    // Fetch all companies with their plans and counts
    // Note: 'count' on foreign tables is supported by PostgREST if using appropriate syntax or views.
    // Since we are using basic client, we might need a workaround if 'active_count' isn't maintained on companies table.
    // For MVP/Robustness, we will fetch raw data and aggregate in JS or use available counters.
    // Optimization: If dataset is large, move this to a Database View or RPC.
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*, plans(id, name, price_cents, employee_limit, plate_limit), employees(id), plates(id)');

    if (error) throw new Error(error.message);

    // Aggregations
    const totals = {
        companies_active: 0,
        companies_suspended: 0,
        companies_trial: 0,
        mrr: 0
    };

    const alerts = {
        no_plan_count: 0,
        over_limit_count: 0
    };

    const companiesWithUsage = companies.map((comp: any) => {
        // Status counts
        if (comp.status === 'active') totals.companies_active++;
        else if (comp.status === 'suspended') totals.companies_suspended++;
        else if (comp.status === 'trial') totals.companies_trial++;

        // MRR (only for active companies with plans)
        if (comp.status === 'active' && comp.plans?.price_cents) {
            totals.mrr += comp.plans.price_cents;
        }

        // Usage calculation
        // Filter out inactive employees/plates if we want "active usage". 
        // Assuming getting all for now as limit applies to total registered usually, or active.
        // Let's assume limits apply to Active. If 'employees' array contains all, we might count all.
        // Ideally we should filter in the select, but let's count only active if we can check 'active' prop.
        // Use raw array length for MVP (Total registered).
        const employees_used = comp.employees?.length || 0;
        const plates_used = comp.plates?.length || 0;
        
        const employees_limit = comp.max_employees || comp.plans?.employee_limit || 0;
        const plates_limit = comp.max_plates || comp.plans?.plate_limit || 0;

        // Alerts per company
        let hasAlert = false;
        if (!comp.plans) {
            alerts.no_plan_count++;
            hasAlert = true;
        } else {
            if (employees_used > employees_limit || plates_used > plates_limit) {
                alerts.over_limit_count++;
                hasAlert = true;
            }
        }

        return {
            id: comp.id,
            name: comp.name,
            status: comp.status,
            plan: comp.plans, // { name, ... }
            employees_used,
            employees_limit,
            plates_used,
            plates_limit,
            over_limit: hasAlert // Flag for frontend highlighting
        };
    });

    return {
        totals,
        alerts,
        companies: companiesWithUsage
    };
  }
}
