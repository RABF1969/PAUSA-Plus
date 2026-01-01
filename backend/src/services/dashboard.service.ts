import { supabase } from '../lib/supabase';

export const getOverviewStats = async (companyId: string) => {
    // Get total break types (capacity)
    const { data: breakTypes, error: breakTypesError } = await supabase
        .from('break_types')
        .select('id')
        .eq('company_id', companyId)
        .eq('active', true);

    if (breakTypesError) throw new Error(breakTypesError.message);

    const totalSlots = breakTypes?.length || 0;

    // Get active breaks count
    // We need to filter break_events by company_id, but the table doesn't have it directly.
    // We can join with employees or break_types.
    const { data: activeBreaks, error: activeBreaksError } = await supabase
        .from('break_events')
        .select(`
      id,
      employees!inner(company_id)
    `)
        .eq('status', 'active')
        .eq('employees.company_id', companyId);

    if (activeBreaksError) throw new Error(activeBreaksError.message);

    const activePauses = activeBreaks?.length || 0;
    const freeSlots = Math.max(0, totalSlots - activePauses);

    // Calculate average time for today's completed breaks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: completedToday, error: completedError } = await supabase
        .from('break_events')
        .select(`
      duration_minutes,
      employees!inner(company_id)
    `)
        .in('status', ['finished', 'exceeded'])
        .eq('employees.company_id', companyId)
        .gte('created_at', today.toISOString());

    if (completedError) throw new Error(completedError.message);

    let averageTimeMinutes = 0;
    if (completedToday && completedToday.length > 0) {
        const total = completedToday.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);
        averageTimeMinutes = Math.round(total / completedToday.length);
    }

    // Calculate efficiency (breaks within limit / total breaks today)
    const { data: allToday, error: allTodayError } = await supabase
        .from('break_events')
        .select(`
      status,
      employees!inner(company_id)
    `)
        .in('status', ['finished', 'exceeded'])
        .eq('employees.company_id', companyId)
        .gte('created_at', today.toISOString());

    if (allTodayError) throw new Error(allTodayError.message);

    let efficiency = 100;
    if (allToday && allToday.length > 0) {
        const withinLimit = allToday.filter(b => b.status === 'finished').length;
        efficiency = Math.round((withinLimit / allToday.length) * 100);
    }

    return {
        totalSlots,
        freeSlots,
        activePauses,
        averageTimeMinutes,
        efficiency,
    };
};

export const getActiveBreaks = async (companyId: string) => {
    const { data, error } = await supabase
        .from('break_events')
        .select(`
      id,
      started_at,
      employees!inner(
        name,
        role,
        company_id
      ),
      break_types (
        name,
        max_minutes
      )
    `)
        .eq('status', 'active')
        .eq('employees.company_id', companyId)
        .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Calculate elapsed time and status
    const now = new Date();
    return (data || []).map((breakEvent: any) => {
        const startTime = new Date(breakEvent.started_at);
        const elapsedMs = now.getTime() - startTime.getTime();
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        const employee = breakEvent.employees;
        const breakType = breakEvent.break_types;

        const maxMinutes = breakType?.max_minutes || 15;
        const status = elapsedMinutes > maxMinutes ? 'alert' : 'normal';

        return {
            id: breakEvent.id,
            employee_name: employee?.name || 'Desconhecido',
            employee_role: employee?.role || 'operador',
            break_type_name: breakType?.name || 'Pausa',
            started_at: breakEvent.started_at,
            elapsed_minutes: elapsedMinutes,
            max_minutes: maxMinutes,
            status,
        };
    });
};
