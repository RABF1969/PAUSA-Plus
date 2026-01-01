import { supabase } from '../lib/supabase';

interface StartBreakParams {
    badge_code: string;
    break_type_id: string;
}

export const startBreak = async ({ badge_code, break_type_id }: StartBreakParams) => {
    // 1. Get Break Type to find the company_id, max_minutes and capacity
    const { data: breakType, error: breakTypeError } = await supabase
        .from('break_types')
        .select('*')
        .eq('id', break_type_id)
        .single();

    if (process.env.NODE_ENV !== 'production') {
        if (breakTypeError) console.error(`[DEBUG] Database error finding break_type:`, breakTypeError);
        if (breakType) console.log(`[DEBUG] Break type used:`, { id: breakType.id, company_id: breakType.company_id, name: breakType.name });
        else console.warn(`[DEBUG] No break type found for ID: "${break_type_id}"`);
    }

    if (breakTypeError || !breakType) {
        throw new Error(`Break type not found (ID: ${break_type_id})`);
    }

    // 1.1 Capacity Check... (existing)

    // Global check for debugging only
    if (process.env.NODE_ENV !== 'production') {
        const { count: globalActive } = await supabase.from('break_events').select('id', { count: 'exact', head: true }).eq('status', 'active');
        console.log(`[DEBUG] GLOBAL active breaks in DB before insert: ${globalActive || 0}`);
    }

    // 2. Find Employee by badge_code AND company_id
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEBUG] Looking for employee with badge: "${badge_code}" in company: "${breakType.company_id}"`);
    }

    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, active, company_id')
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

    // 4. Start new break
    const { data: newBreak, error: createError } = await supabase
        .from('break_events')
        .insert({
            employee_id: employee.id,
            break_type_id: break_type_id,
            started_at: new Date().toISOString(),
            status: 'active'
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
}

export const endBreak = async ({ badge_code, break_id }: EndBreakParams) => {
    let activeBreak: any;

    if (break_id) {
        // 1a. Find break by ID directly
        const { data, error } = await supabase
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
            .eq('id', break_id)
            .eq('status', 'active')
            .single();

        if (error || !data) {
            throw new Error('Active break not found with the provided ID');
        }
        activeBreak = data;
    } else if (badge_code) {
        // 1b. Legacy behavior: Find Employee then find their active break
        const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('id, name')
            .eq('badge_code', badge_code)
            .single();

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

export const listBreakTypes = async (companyId?: string) => {
    let query = supabase
        .from('break_types')
        .select(`
            *,
            active_events:break_events(id, status)
        `)
        .eq('active', true);

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Transform to include occupancy, filtering only 'active' status in the child array
    return (data || []).map((type: any) => ({
        ...type,
        active_count: type.active_events?.filter((e: any) => e.status === 'active').length || 0,
        capacity: type.capacity ?? 1 // Nullish coalescing for missing column
    }));
};
