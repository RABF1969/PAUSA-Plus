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

export const endBreak = async (params: { badge_code?: string, break_id?: string }): Promise<EndBreakResponse> => {
    const response = await api.post<EndBreakResponse>('/breaks/end', params);
    return response.data;
};

export interface BreakType {
    id: string;
    company_id: string;
    name: string;
    max_minutes: number;
    active: boolean;
    capacity: number;
    active_count: number;
    created_at: string;
}

export const listBreakTypes = async (): Promise<BreakType[]> => {
    const response = await api.get<BreakType[]>('/breaks/types');
    return response.data;
};

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        company_id: string;
    };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export interface HistoryItem {
    id: string;
    employee_name: string;
    break_type_name: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    status: 'finished' | 'exceeded';
}

export interface HistoryResponse {
    data: HistoryItem[];
    total: number;
    page: number;
    totalPages: number;
}

export const getBreakHistory = async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    breakTypeId?: string;
}): Promise<HistoryResponse> => {
    const response = await api.get<HistoryResponse>('/reports/history', { params });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.hash.includes('kiosk')) {
        window.location.hash = '#/login';
    }
};

// Request interceptor to add the token to the Authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.hash.includes('kiosk')) {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

export interface DashboardOverview {
    totalSlots: number;
    freeSlots: number;
    activePauses: number;
    averageTimeMinutes: number;
    efficiency: number;
}

export interface ActiveBreak {
    id: string;
    employee_name: string;
    employee_role: string;
    break_type_name: string;
    started_at: string;
    elapsed_minutes: number;
    max_minutes: number;
    status: 'normal' | 'alert';
}

export const getActiveBreaks = async (): Promise<ActiveBreak[]> => {
    const response = await api.get<ActiveBreak[]>('/dashboard/active');
    return response.data;
};

export interface Employee {
    id: string;
    company_id: string;
    name: string;
    badge_code: string;
    role: string;
    active: boolean;
    created_at: string;
}

export const listEmployees = async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
};

export const createEmployee = async (data: {
    name: string;
    role: string;
    badge_code?: string;
}): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
};

export const updateEmployee = async (id: string, data: { name: string; role: string }): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, data);
    return response.data;
};

export const setEmployeeActive = async (id: string, active: boolean): Promise<Employee> => {
    const response = await api.patch<Employee>(`/employees/${id}/active`, { active });
    return response.data;
};

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
    const response = await api.get<DashboardOverview>('/dashboard/overview');
    return response.data;
};

export default api;
