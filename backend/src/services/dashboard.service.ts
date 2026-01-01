import { supabase } from '../lib/supabase';

export const getOverviewStats = async () => {
    // Get total break types (capacity)
    const { data: breakTypes, error: breakTypesError } = await supabase
        .from('break_types')
        .select('id')
        .eq('active', true);

    if (breakTypesError) throw new Error(breakTypesError.message);

    const totalSlots = breakTypes?.length || 0;

    // Get active breaks count
    const { data: activeBreaks, error: activeBreaksError } = await supabase
        .from('break_events')
        .select('id')
        .eq('status', 'active');

    if (activeBreaksError) throw new Error(activeBreaksError.message);

    const activePauses = activeBreaks?.length || 0;
    const freeSlots = Math.max(0, totalSlots - activePauses);

    // Calculate average time for today's completed breaks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: completedToday, error: completedError } = await supabase
        .from('break_events')
        .select('duration_minutes')
        .in('status', ['finished', 'exceeded'])
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
        .select('status')
        .in('status', ['finished', 'exceeded'])
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

export const getActiveBreaks = async () => {
    const { data, error } = await supabase
        .from('break_events')
        .select(`
      id,
      started_at,
      employees (
        name,
        role
      ),
      break_types (
        name,
        max_minutes
      )
    `)
        .eq('status', 'active')
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
