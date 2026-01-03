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
            <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visão Geral</h1>
                    <p className="text-slate-500">Acompanhe métricas em tempo real</p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Empresas Ativas</p>
                        <p className="text-3xl font-black text-emerald-600">{data?.totals?.companies_active || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">MRR Mensal</p>
                        <p className="text-3xl font-black text-blue-600">{formatCurrency(data?.totals?.mrr || 0)}</p>
                    </div>
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trial / Suspensas</p>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-2xl font-black text-slate-900">{data?.totals?.companies_trial || 0}</span>
                                <span className="text-xs text-slate-500 ml-1">Trial</span>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div>
                                <span className="text-2xl font-black text-red-600">{data?.totals?.companies_suspended || 0}</span>
                                <span className="text-xs text-slate-500 ml-1">Susp.</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Alertas</p>
                        <div className="flex gap-2">
                             {(data?.alerts?.over_limit_count || 0) > 0 && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                    {data?.alerts?.over_limit_count} Over Limit
                                </span>
                             )}
                             {(data?.alerts?.no_plan_count || 0) > 0 && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
                                    {data?.alerts?.no_plan_count} Sem Plano
                                </span>
                             )}
                             {(data?.alerts?.over_limit_count || 0) === 0 && (data?.alerts?.no_plan_count || 0) === 0 && (
                                 <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                                     <span className="material-symbols-outlined text-sm">check_circle</span> Tudo OK
                                 </span>
                             )}
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Todas as Empresas</h2>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <input 
                                type="text" 
                                placeholder="Buscar empresa..." 
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
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
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Empresa</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Plano</th>
                                    <th className="px-6 py-4 text-center">Funcionários</th>
                                    <th className="px-6 py-4 text-center">Placas</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Nenhuma empresa encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{comp.name}</div>
                                                <div className="text-xs text-slate-400 font-mono">{comp.id.split('-')[0]}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    comp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    comp.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {comp.plan ? (
                                                    <span className="font-medium text-blue-600">{comp.plan.name}</span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sem plano</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-bold ${comp.employees_used > comp.employees_limit ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {comp.employees_used} <span className="text-slate-400 font-normal">/ {comp.employees_limit}</span>
                                                    </span>
                                                    <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${comp.employees_used > comp.employees_limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min((comp.employees_used/comp.employees_limit)*100, 100) || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-bold ${comp.plates_used > comp.plates_limit ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {comp.plates_used} <span className="text-slate-400 font-normal">/ {comp.plates_limit}</span>
                                                    </span>
                                                     <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${comp.plates_used > comp.plates_limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min((comp.plates_used/comp.plates_limit)*100, 100) || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => navigate(`/alfabiz/companies/${comp.id}/edit`)}
                                                        className="size-8 rounded flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(comp)}
                                                        className={`size-8 rounded flex items-center justify-center transition-colors ${
                                                            comp.status === 'suspended' 
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }`}
                                                        title={comp.status === 'suspended' ? 'Reativar' : 'Suspender'}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
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
