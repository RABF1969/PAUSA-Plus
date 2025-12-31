import { supabase } from '../lib/supabase';

interface StartBreakParams {
    badge_code: string;
    break_type_id: string;
}

export const startBreak = async ({ badge_code, break_type_id }: StartBreakParams) => {
    // 1. Get Break Type to find the company_id and max_minutes
    const { data: breakType, error: breakTypeError } = await supabase
        .from('break_types')
        .select('id, company_id, max_minutes, active')
        .eq('id', break_type_id)
        .single();

    if (breakTypeError || !breakType) {
        throw new Error('Break type not found');
    }

    if (!breakType.active) {
        throw new Error('This break type is currently inactive');
    }

    // 2. Find Employee by badge_code AND company_id
    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, active')
        .eq('badge_code', badge_code)
        .eq('company_id', breakType.company_id)
        .single();

    if (employeeError || !employee) {
        throw new Error('Employee not found');
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
    badge_code: string;
}

export const endBreak = async ({ badge_code }: EndBreakParams) => {
    // 1. Find Employee
    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('badge_code', badge_code)
        .single();

    if (employeeError || !employee) {
        throw new Error('Employee not found');
    }

    // 2. Find ACTIVE break for this employee
    const { data: activeBreak, error: activeBreakError } = await supabase
        .from('break_events')
        .select(`
      id, 
      started_at, 
      break_types (
        max_minutes
      )
    `)
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .single();

    if (activeBreakError || !activeBreak) {
        throw new Error('No active break found for this employee');
    }

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
        employee_name: employee.name,
        limit_minutes: maxMinutes,
        exceeded_minutes: Math.max(0, durationMinutes - maxMinutes)
    };
};

export const listBreakTypes = async () => {
    const { data, error } = await supabase
        .from('break_types')
        .select('*')
        .eq('active', true);

    if (error) throw new Error(error.message);
    return data;
};
