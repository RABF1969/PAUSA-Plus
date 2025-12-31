import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface StartBreakResponse {
    id: string;
    employee_id: string;
    break_type_id: string;
    started_at: string;
    status: 'active';
    max_minutes: number;
    employee_name: string;
}

export interface EndBreakResponse {
    id: string;
    employee_id: string;
    break_type_id: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    status: 'finished' | 'exceeded';
    employee_name: string;
    limit_minutes: number;
    exceeded_minutes: number;
}

export const startBreak = async (badge_code: string, break_type_id: string): Promise<StartBreakResponse> => {
    const response = await api.post<StartBreakResponse>('/breaks/start', {
        badge_code,
        break_type_id,
    });
    return response.data;
};

export const endBreak = async (badge_code: string): Promise<EndBreakResponse> => {
    const response = await api.post<EndBreakResponse>('/breaks/end', {
        badge_code,
    });
    return response.data;
};

export interface BreakType {
    id: string;
    company_id: string;
    name: string;
    max_minutes: number;
    active: boolean;
    created_at: string;
}

export const listBreakTypes = async (): Promise<BreakType[]> => {
    const response = await api.get<BreakType[]>('/breaks/types');
    return response.data;
};

export default api;
