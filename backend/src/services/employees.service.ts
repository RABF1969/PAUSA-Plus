import { supabase } from '../lib/supabase';

export const listEmployees = async (companyId: string) => {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const generateNextBadgeCode = async (companyId: string): Promise<string> => {
    const { data: employees, error } = await supabase
        .from('employees')
        .select('badge_code')
        .eq('company_id', companyId);

    if (error) return '0001';

    let maxNum = 0;
    employees?.forEach(emp => {
        // Extract only numeric digits (e.g., 'FUNC0001' -> '0001')
        const numericPart = emp.badge_code.replace(/\D/g, '');
        const num = parseInt(numericPart, 10);
        if (!isNaN(num) && num > maxNum) {
            maxNum = num;
        }
    });

    const nextNum = maxNum + 1;
    return nextNum.toString().padStart(4, '0');
};

export const createEmployee = async (data: {
    company_id: string;
    name: string;
    role: string;
    badge_code?: string;
}) => {
    let badge_code = data.badge_code;
    if (!badge_code) {
        badge_code = await generateNextBadgeCode(data.company_id);
    } else {
        const { data: existing } = await supabase
            .from('employees')
            .select('id')
            .eq('badge_code', badge_code)
            .eq('company_id', data.company_id)
            .single();

        if (existing) {
            throw new Error('Já existe um funcionário cadastrado com esta matrícula nesta empresa.');
        }
    }

    const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert({
            ...data,
            badge_code,
            active: true
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return newEmployee;
};

export const updateEmployee = async (id: string, company_id: string, data: { name: string; role: string }) => {
    const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .eq('company_id', company_id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') throw new Error('Funcionário não encontrado ou você não tem permissão.');
        throw new Error(error.message);
    }
    return updatedEmployee;
};

export const setEmployeeStatus = async (id: string, company_id: string, active: boolean) => {
    const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update({ active })
        .eq('id', id)
        .eq('company_id', company_id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') throw new Error('Funcionário não encontrado ou você não tem permissão.');
        throw new Error(error.message);
    }
    return updatedEmployee;
};
