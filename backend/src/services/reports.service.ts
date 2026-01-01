import { supabase } from '../lib/supabase';

export interface HistoryFilter {
    companyId: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    breakTypeId?: string;
}

export const getBreakHistory = async (filter: HistoryFilter) => {
    const {
        companyId,
        page = 1,
        limit = 10,
        startDate,
        endDate,
        employeeId,
        breakTypeId
    } = filter;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
        .from('break_events')
        .select(`
      id,
      started_at,
      ended_at,
      duration_minutes,
      status,
      employees!inner(
        name,
        company_id
      ),
      break_types (
        name
      )
    `, { count: 'exact' })
        .eq('employees.company_id', companyId)
        .neq('status', 'active'); // Only historical (finished/exceeded)

    // Apply filters
    if (startDate) {
        query = query.gte('started_at', startDate);
    }
    if (endDate) {
        query = query.lte('started_at', endDate);
    }
    if (employeeId) {
        query = query.eq('employee_id', employeeId);
    }
    if (breakTypeId) {
        query = query.eq('break_type_id', breakTypeId);
    }

    // Pagination & Order
    const { data, count, error } = await query
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
        data: (data || []).map((item: any) => ({
            id: item.id,
            employee_name: item.employees?.name || 'Desconhecido',
            break_type_name: item.break_types?.name || 'Pausa',
            started_at: item.started_at,
            ended_at: item.ended_at,
            duration_minutes: item.duration_minutes,
            status: item.status
        })),
        total,
        page,
        totalPages
    };
};
