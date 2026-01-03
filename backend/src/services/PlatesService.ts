import { supabase } from '../lib/supabase';
import { CompanyGuardService } from './CompanyGuardService';

export interface OperationalPlate {
  id: string;
  company_id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: Date;
}

export const PlatesService = {
  async createPlate(companyId: string, name: string, allowedBreakTypeIds?: string[]): Promise<OperationalPlate> {
    // 1. Validate Company Access (centralized guard with limit check)
    await CompanyGuardService.validateCompanyAccess(companyId, 'CREATE_PLATE');

    // 2. Generate a simple code like PLACA-XXXX
    const { count, error: countError } = await supabase
      .from('operational_plates')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (countError) throw new Error(countError.message);

    const nextNum = (count || 0) + 1;
    const code = `PLACA-${nextNum.toString().padStart(4, '0')}`;

    const { data: plate, error } = await supabase
      .from('operational_plates')
      .insert({
        company_id: companyId,
        name,
        code
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Insert allowed break types if provided
    if (allowedBreakTypeIds && allowedBreakTypeIds.length > 0) {
      const pivots = allowedBreakTypeIds.map(btId => ({
        plate_id: plate.id,
        break_type_id: btId
      }));

      const { error: pivotError } = await supabase
        .from('plate_break_types')
        .insert(pivots);

      if (pivotError) {
        console.error('Error linking break types:', pivotError);
      }
    }

    return plate;
  },

  async listPlates(companyId: string): Promise<OperationalPlate[]> {
    const { data, error } = await supabase
      .from('operational_plates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async toggleActive(id: string, companyId: string, active: boolean): Promise<OperationalPlate> {
    const { data, error } = await supabase
      .from('operational_plates')
      .update({ active })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Plate not found');
    
    return data;
  },

  async resolveByCode(code: string): Promise<OperationalPlate & { company_name: string, allowed_break_types: string[] }> {
    const { data, error } = await supabase
      .from('operational_plates')
      .select(`
        *,
        companies ( name ),
        plate_break_types ( break_type_id )
      `)
      .eq('code', code)
      .eq('active', true)
      .single();

    if (error || !data) {
      throw new Error('Placa não encontrada ou inativa');
    }

    return {
      ...data,
      company_name: data.companies?.name || 'Empresa desconhecida',
      allowed_break_types: data.plate_break_types?.map((p: any) => p.break_type_id) || []
    };
  }
};
