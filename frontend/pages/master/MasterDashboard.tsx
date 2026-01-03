import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterLayout from '../../components/layouts/MasterLayout';
import { getDashboardOverview, updateCompany } from '../../services/masterApi';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

interface Company {
    id: string;
    name: string;
    status: 'active' | 'suspended' | 'trial';
    plan: {
        name: string;
    } | null;
    employees_used: number;
    employees_limit: number;
    plates_used: number;
    plates_limit: number;
    over_limit: boolean;
}

interface OverviewData {
    totals: {
        companies_active: number;
        companies_suspended: number;
        companies_trial: number;
        mrr: number;
    };
    alerts: {
        no_plan_count: number;
        over_limit_count: number;
    };
    companies: Company[];
}

const MasterDashboard: React.FC = () => {
    const navigate = useNavigate();
    // Initialize with safe default structure to avoid undefined errors during render if loading is bypassed or errors occur
    const [data, setData] = useState<OverviewData>({
        totals: { companies_active: 0, companies_suspended: 0, companies_trial: 0, mrr: 0 },
        alerts: { no_plan_count: 0, over_limit_count: 0 },
        companies: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getDashboardOverview();
            // Ensure we handle nested data structure if backend wraps it
            const payload = res.data || res; 
            setData(payload || {
                totals: { companies_active: 0, companies_suspended: 0, companies_trial: 0, mrr: 0 },
                alerts: { no_plan_count: 0, over_limit_count: 0 },
                companies: []
            });
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (company: Company) => {
        if (!confirm(`Deseja ${company.status === 'suspended' ? 'reativar' : 'suspender'} a empresa ${company.name}?`)) return;
        
        try {
            await updateCompany(company.id, { status: company.status === 'suspended' ? 'active' : 'suspended' });
            fetchData();
        } catch (err: any) {
            alert('Erro ao atualizar status');
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);
    };

    const companiesSafe = data?.companies || [];
    const filteredCompanies = companiesSafe.filter(comp => {
        const matchesName = (comp.name || '').toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
        return matchesName && matchesStatus;
    }) || [];

    if (loading) {
        return (
            <MasterLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="animate-spin size-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            </MasterLayout>
        );
    }

    if (error) {
        return (
            <MasterLayout>
                <div className="p-8">
                    <div className="bg-red-50 p-4 rounded-lg text-red-600">Erro: {error}</div>
                    <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tentar novamente</button>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <main className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <header className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">Visão Geral</h1>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">Acompanhe métricas em tempo real</p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-soft">
                        <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Empresas Ativas</p>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{data?.totals?.companies_active || 0}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-soft">
                        <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">MRR Mensal</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(data?.totals?.mrr || 0)}</p>
                    </div>
                     <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-soft">
                        <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Trial / Suspensas</p>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-2xl font-black text-[var(--text-primary)]">{data?.totals?.companies_trial || 0}</span>
                                <span className="text-xs text-[var(--text-secondary)] ml-1">Trial</span>
                            </div>
                            <div className="w-px bg-[var(--border-primary)]"></div>
                            <div>
                                <span className="text-2xl font-black text-red-600 dark:text-red-400">{data?.totals?.companies_suspended || 0}</span>
                                <span className="text-xs text-[var(--text-secondary)] ml-1">Susp.</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-soft">
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Alertas</p>
                        <div className="flex gap-2">
                             {(data?.alerts?.over_limit_count || 0) > 0 && (
                                <span className="bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                    {data?.alerts?.over_limit_count} Over Limit
                                </span>
                             )}
                             {(data?.alerts?.no_plan_count || 0) > 0 && (
                                <span className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                    {data?.alerts?.no_plan_count} Sem Plano
                                </span>
                             )}
                             {(data?.alerts?.over_limit_count || 0) === 0 && (data?.alerts?.no_plan_count || 0) === 0 && (
                                 <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black flex items-center gap-1">
                                     <span className="material-symbols-outlined text-sm">check_circle</span> Tudo OK
                                 </span>
                             )}
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-soft overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-[var(--border-primary)] flex flex-col gap-4">
                        <h2 className="text-lg font-black text-[var(--text-primary)]">Todas as Empresas</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text" 
                                placeholder="Buscar empresa..." 
                                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 w-full sm:flex-1 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <select 
                                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto text-[var(--text-primary)]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Todos Status</option>
                                <option value="active">Ativas</option>
                                <option value="suspended">Suspensas</option>
                                <option value="trial">Trial</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[var(--bg-primary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                <tr className="border-b border-[var(--border-primary)]">
                                    <th className="px-6 py-4">Empresa</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Plano</th>
                                    <th className="px-6 py-4 text-center">Funcionários</th>
                                    <th className="px-6 py-4 text-center">Placas</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)] text-sm">
                                {filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            Nenhuma empresa encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[var(--text-primary)]">{comp.name}</div>
                                                <div className="text-xs text-[var(--text-secondary)] font-mono">{comp.id.split('-')[0]}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                                    comp.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                    comp.status === 'suspended' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {comp.plan ? (
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{comp.plan.name}</span>
                                                ) : (
                                                    <span className="text-[var(--text-secondary)] italic">Sem plano</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-black ${comp.employees_used > comp.employees_limit ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                                                        {comp.employees_used} <span className="text-[var(--text-secondary)] font-normal">/ {comp.employees_limit}</span>
                                                    </span>
                                                    <div className="w-16 h-1.5 bg-[var(--border-primary)] rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${comp.employees_used > comp.employees_limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min((comp.employees_used/comp.employees_limit)*100, 100) || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-black ${comp.plates_used > comp.plates_limit ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                                                        {comp.plates_used} <span className="text-[var(--text-secondary)] font-normal">/ {comp.plates_limit}</span>
                                                    </span>
                                                     <div className="w-16 h-1.5 bg-[var(--border-primary)] rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${comp.plates_used > comp.plates_limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min((comp.plates_used/comp.plates_limit)*100, 100) || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 outline-none">
                                                    <button 
                                                        onClick={() => navigate(`/alfabiz/companies/${comp.id}/edit`)}
                                                        className="size-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-800 focus:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 outline-none"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(comp)}
                                                        className={`size-9 rounded-xl flex items-center justify-center transition-all border focus:ring-2 ring-offset-2 dark:ring-offset-slate-900 outline-none ${
                                                            comp.status === 'suspended' 
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-100 dark:border-emerald-800 ring-emerald-500' 
                                                            : 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border-red-100 dark:border-red-800 ring-red-500'
                                                        }`}
                                                        title={comp.status === 'suspended' ? 'Reativar' : 'Suspender'}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            {comp.status === 'suspended' ? 'play_arrow' : 'pause'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </MasterLayout>
    );
};

export default MasterDashboard;
