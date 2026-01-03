import { supabase } from '../lib/supabase';

interface StartBreakParams {
    badge_code: string;
    break_type_id: string;
    plate_id?: string;
}

export const startBreak = async ({ badge_code, break_type_id, plate_id }: StartBreakParams) => {
    // 1. Get Break Type to find the company_id, max_minutes and capacity
    const { data: breakType, error: breakTypeError } = await supabase
        .from('break_types')
        .select('*')
        .eq('id', break_type_id)
        .single();



    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, active, company_id, companies(status)')
        .eq('badge_code', badge_code)
        .eq('company_id', breakType.company_id)
        .single();


    if (employeeError || !employee) {
        throw new Error('Employee not found');
    }

    if (!employee.active) {
        throw new Error('Employee is inactive');
    }

    // 1.1 Capacity Check
    const { count, error: countError } = await supabase
        .from('break_events')
        .select('id', { count: 'exact', head: true })
        .eq('break_type_id', break_type_id)
        .eq('status', 'active');

    if (countError) {
        throw new Error(`Failed to check capacity: ${countError.message}`);
    }

    const currentActive = count || 0;
    const capacity = breakType.capacity || 1;

    if (currentActive >= capacity) {
        const error = new Error('Capacidade máxima de pausa atingida');
        (error as any).status = 409;
        throw error;
    }

    if (!employee.active) {
        throw new Error('Employee is inactive');
    }

    // 3. Check for active breaks for this employee
    const { data: activeBreak } = await supabase
        .from('break_events')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .single();

    if (activeBreak) {
        throw new Error('Employee already has an active break');
    }

    // 4. Validate Company Status
    const company = (employee as any).companies;
    if (company && company.status !== 'active') {
        const error = new Error('Empresa suspensa ou inativa. Contate o suporte.');
        (error as any).status = 403;
        throw error;
    }

    // 5. Validate Plate (if provided)
    if (plate_id) {
        const { data: plate, error: plateError } = await supabase
            .from('operational_plates')
            .select('id, active, company_id')
            .eq('id', plate_id)
            .single();

        if (plateError || !plate) {
             throw new Error('Ponto operacional inválido');
        }

        if (!plate.active) {
            throw new Error('Este ponto operacional está inativo');
        }

        if (plate.company_id !== employee.company_id) {
            throw new Error('Ponto operacional não pertence à empresa do colaborador');
        }

        // 5.1 Check if Plate allows this Break Type
        // We need to check the pivot table `plate_break_types`
        const { data: allowed, error: allowedError } = await supabase
            .from('plate_break_types')
            .select('plate_id')
            .eq('plate_id', plate_id)
            .eq('break_type_id', break_type_id)
            .single();

        // If no record found AND we are enforcing strict rules...
        // Assuming strict rules: If the pivot table is used, we must check it.
        // If the query returns nothing, the break type is NOT allowed for this plate.
        if (!allowed) {
            throw new Error('Este tipo de pausa não é permitido neste ponto operacional');
        }
    }

    // 6. Start new break
    const { data: newBreak, error: createError } = await supabase
        .from('break_events')
        .insert({
            employee_id: employee.id,
            break_type_id: break_type_id,
            started_at: new Date().toISOString(),
            status: 'active',
            plate_id: plate_id || null
        })

        .select()
        .single();

    if (createError) {
        throw new Error(`Failed to start break: ${createError.message}`);
    }

    return {
        ...newBreak,
        max_minutes: breakType.max_minutes,
        employee_name: employee.name
    };
};

interface EndBreakParams {
    badge_code?: string;
    break_id?: string;
    company_id?: string;
}

export const endBreak = async ({ badge_code, break_id, company_id }: EndBreakParams) => {
    let activeBreak: any;

    if (break_id) {
        // 1a. Find break by ID directly
        const query = supabase
            .from('break_events')
            .select(`
                id, 
                started_at, 
                employee_id,
                employees!inner (
                    name,
                    company_id
                ),
                break_types (
                    max_minutes
                )
            `)
            .eq('id', break_id)
            .eq('status', 'active');

        if (company_id) {
            query.eq('employees.company_id', company_id);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            throw new Error('Active break not found');
        }
        activeBreak = data;
    } else if (badge_code) {
        // 1b. Legacy behavior: Find Employee then find their active break
        const empQuery = supabase
            .from('employees')
            .select('id, name')
            .eq('badge_code', badge_code);

        if (company_id) {
            empQuery.eq('company_id', company_id);
        }

        const { data: employee, error: employeeError } = await empQuery.single();

        if (employeeError || !employee) {
            throw new Error('Employee not found');
        }

        const { data, error: activeBreakError } = await supabase
            .from('break_events')
            .select(`
                id, 
                started_at,
                employee_id,
                employees (
                    name
                ),
                break_types (
                    max_minutes
                )
            `)
            .eq('employee_id', employee.id)
            .eq('status', 'active')
            .single();

        if (activeBreakError || !data) {
            throw new Error('No active break found for this employee');
        }
        activeBreak = data;
    } else {
        throw new Error('Either break_id or badge_code must be provided');
    }

    const employeeName = activeBreak.employees?.name || 'Funcionário';

    // 3. Calculate duration and status
    const now = new Date();
    const startTime = new Date(activeBreak.started_at);
    const durationMs = now.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    // Handle joined data safely
    const breakType = activeBreak.break_types as any;
    const maxMinutes = breakType?.max_minutes || 0;

    const status = durationMinutes > maxMinutes ? 'exceeded' : 'finished';

    // 4. Update break event
    const { data: updatedBreak, error: updateError } = await supabase
        .from('break_events')
        .update({
            ended_at: now.toISOString(),
            duration_minutes: durationMinutes,
            status: status
        })
        .eq('id', activeBreak.id)
        .select()
        .single();

    if (updateError) {
        throw new Error(`Failed to end break: ${updateError.message}`);
    }

    return {
        ...updatedBreak,
        employee_name: employeeName,
        limit_minutes: maxMinutes,
        exceeded_minutes: Math.max(0, durationMinutes - maxMinutes)
    };
};

export const listBreakTypes = async (companyId: string, includeInactive: boolean = false) => {
    let query = supabase
        .from('break_types')
        .select(`
            *,
            active_events:break_events(id, status)
        `);

    if (!includeInactive) {
        query = query.eq('active', true);
    }

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Transform to include occupancy, filtering only 'active' status in the child array
    return (data || []).map((type: any) => ({
        ...type,
        active_count: type.active_events?.filter((e: any) => e.status === 'active').length || 0,
        capacity: type.capacity ?? 1
    })).sort((a, b) => a.name.localeCompare(b.name));
};

export const createBreakType = async (params: { company_id: string; name: string; max_minutes: number; capacity: number }) => {
    if (params.max_minutes < 1) throw new Error('O tempo máximo deve ser pelo menos 1 minuto');
    if (params.capacity < 1) throw new Error('A capacidade deve ser pelo menos 1');

    const { data, error } = await supabase
        .from('break_types')
        .insert({
            company_id: params.company_id,
            name: params.name,
            max_minutes: params.max_minutes,
            capacity: params.capacity,
            active: true
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateBreakType = async (id: string, company_id: string, updates: { name?: string; max_minutes?: number; capacity?: number; active?: boolean }) => {
    if (updates.max_minutes !== undefined && updates.max_minutes < 1) throw new Error('O tempo máximo deve ser pelo menos 1 minuto');
    if (updates.capacity !== undefined && updates.capacity < 1) throw new Error('A capacidade deve ser pelo menos 1');

    // Business Rule: Check if trying to inactivate while having active breaks
    if (updates.active === false) {
        const { count, error: countError } = await supabase
            .from('break_events')
            .select('id', { count: 'exact', head: true })
            .eq('break_type_id', id)
            .eq('status', 'active');

        if (countError) throw new Error(countError.message);
        if (count && count > 0) {
            const error: any = new Error('Não é possível inativar um tipo de pausa que possui colaboradores em pausa no momento');
            error.status = 409;
            throw error;
        }
    }

    const { data, error } = await supabase
        .from('break_types')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', company_id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const getActiveBreakByBadge = async (badge_code: string, company_id: string) => {
    // 1. Find employee in the company
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('badge_code', badge_code)
        .eq('company_id', company_id)
        .single();

    if (empError || !employee) return null;

    // 2. Find active break
    const { data: activeBreak, error: breakError } = await supabase
        .from('break_events')
        .select(`
            id,
            started_at,
            break_type_id,
            break_types (
                name,
                max_minutes
            )
        `)
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .single();

    if (breakError || !activeBreak) return null;

    return activeBreak;
};
