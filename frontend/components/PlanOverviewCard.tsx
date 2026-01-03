import React, { useEffect, useState } from 'react';
import { getCompanyOverview } from '../services/api';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';

interface CompanyOverview {
    company: {
        name: string;
        status: 'active' | 'suspended' | 'trial';
        plan: {
            name: string;
            employee_limit: number;
            plate_limit: number;
        } | null;
    };
    usage: {
        employees: number;
        plates: number;
    };
}

const PlanOverviewCard: React.FC = () => {
    const [data, setData] = useState<CompanyOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const response = await getCompanyOverview();
            setData(response);
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'PlanOverviewCard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
                <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Erro ao carregar informações do plano'}</p>
            </div>
        );
    }

    const { company, usage } = data;
    const employeeUsagePercent = company.plan ? (usage.employees / company.plan.employee_limit) * 100 : 0;
    const plateUsagePercent = company.plan ? (usage.plates / company.plan.plate_limit) * 100 : 0;
    const isNearLimit = employeeUsagePercent >= 80 || plateUsagePercent >= 80;

    const statusConfig = {
        active: { label: 'Ativa', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: 'check_circle' },
        trial: { label: 'Trial', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: 'schedule' },
        suspended: { label: 'Suspensa', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: 'block' }
    };

    const status = statusConfig[company.status] || statusConfig.active;

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Plano & Limites</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{company.name}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
                    <span className="material-symbols-outlined text-sm">{status.icon}</span>
                    {status.label}
                </span>
            </div>

            {/* Suspended Warning */}
            {company.status === 'suspended' && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">
                        ⚠️ Sua empresa está suspensa. Entre em contato com o administrador.
                    </p>
                </div>
            )}

            {/* Plan Info */}
            {company.plan ? (
                <>
                    <div className="mb-6">
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Plano Atual</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{company.plan.name}</p>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4">
                        {/* Employees */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-[var(--text-primary)]">Funcionários</span>
                                <span className="text-sm font-mono font-bold text-[var(--text-secondary)]">
                                    {usage.employees} / {company.plan.employee_limit}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all rounded-full ${
                                        employeeUsagePercent >= 100 ? 'bg-red-500' : 
                                        employeeUsagePercent >= 80 ? 'bg-yellow-500' : 
                                        'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(employeeUsagePercent, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Plates */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-[var(--text-primary)]">Placas Ativas</span>
                                <span className="text-sm font-mono font-bold text-[var(--text-secondary)]">
                                    {usage.plates} / {company.plan.plate_limit}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all rounded-full ${
                                        plateUsagePercent >= 100 ? 'bg-red-500' : 
                                        plateUsagePercent >= 80 ? 'bg-yellow-500' : 
                                        'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(plateUsagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Near Limit Warning */}
                    {isNearLimit && company.status === 'active' && (
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3">
                            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                                💡 Você está próximo do limite do seu plano.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Nenhum plano associado à sua empresa.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlanOverviewCard;
