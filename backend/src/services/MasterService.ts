
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
  /**
   * Get Master Dashboard Overview data
   */
  async getDashboardOverview() {
    // 1. Fetch Companies with Plans
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*, plans(id, name, price_cents, employee_limit, plate_limit)');

    if (companiesError) {
        console.error('MasterService: Error fetching companies', companiesError); // Dev Log
        throw new Error('Failed to fetch companies'); 
    }

    // 2. Fetch ALL Active Employees (id, company_id) to count manually
    // We avoid foreign key join issues by fetching raw list.
    // If dataset grows huge, this should be replaced by a RPC or View in Postgres.
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('active', true);

    if (empError) {
         console.error('MasterService: Error fetching employees', empError);
         // Don't crash, just assume 0
    }

    // 3. Fetch ALL Active Operational Plates (id, company_id)
    // Table is 'operational_plates', NOT 'plates'
    const { data: plates, error: platesError } = await supabase
      .from('operational_plates')
      .select('id, company_id')
      .eq('active', true);

    if (platesError) {
         console.error('MasterService: Error fetching plates', platesError);
         // Don't crash
    }

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

    // Helper to count using the fetched arrays
    const countByCompany = (dataset: any[], companyId: string) => 
        dataset ? dataset.filter((d: any) => d.company_id === companyId).length : 0;

    const companiesWithUsage = companies.map((comp: any) => {
        // Status counts
        if (comp.status === 'active') totals.companies_active++;
        else if (comp.status === 'suspended') totals.companies_suspended++;
        else if (comp.status === 'trial') totals.companies_trial++;

        // MRR
        if (comp.status === 'active' && comp.plans?.price_cents) {
            totals.mrr += comp.plans.price_cents;
        }

        // Usage calculation (Manual aggregation)
        const employees_used = countByCompany(employees || [], comp.id);
        const plates_used = countByCompany(plates || [], comp.id);
        
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
            plan: comp.plans,
            employees_used,
            employees_limit,
            plates_used,
            plates_limit,
            over_limit: hasAlert
        };
    });

    return {
        totals,
        alerts,
        companies: companiesWithUsage
    };
  }
}
