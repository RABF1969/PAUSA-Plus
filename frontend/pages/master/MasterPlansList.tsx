import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPlans } from '../../services/masterApi';
import MasterLayout from '../../components/layouts/MasterLayout';
import { getApiErrorMessage, logErrorInDev } from '../../utils/getApiErrorMessage';

interface Plan {
    id: string;
    name: string;
    code: string;
    employee_limit: number;
    plate_limit: number;
    price_cents: number;
    billing_cycle: 'monthly' | 'yearly';
    is_active: boolean;
}

const MasterPlansList: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await getPlans();
            setPlans(response.data);
            setError(''); // Clear any previous errors
        } catch (err: any) {
            const { message, code } = getApiErrorMessage(err);
            setError(`Erro ao carregar planos: ${message}`);
            logErrorInDev(err, 'MasterPlansList - Load');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(cents / 100);
    };

    if (loading) return (
        <MasterLayout>
            <div className="p-8 text-center text-slate-500">Carregando...</div>
        </MasterLayout>
    );

    return (
        <MasterLayout>

            {/* Content */}
            <main className="max-w-7xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Planos & Preços</h2>
                    <Link 
                        to="/alfabiz/plans/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span>+</span> Novo Plano
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-[var(--bg-secondary)] rounded-xl shadow-soft border p-6 hover:shadow-lg transition-all ${plan.is_active ? 'border-[var(--border-primary)]' : 'border-red-500/20 bg-red-500/5'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-[var(--text-primary)]">{plan.name}</h3>
                                    <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold tracking-widest">{plan.code}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${plan.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                    {plan.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            
                            <div className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tight">
                                {formatPrice(plan.price_cents)}
                                <span className="text-sm font-bold text-[var(--text-secondary)] ml-1">/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-secondary)] font-medium">Funcionários</span>
                                    <span className="font-black text-[var(--text-primary)]">{plan.employee_limit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-secondary)] font-medium">Placas</span>
                                    <span className="font-black text-[var(--text-primary)]">{plan.plate_limit}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/alfabiz/plans/${plan.id}/edit`}
                                className="block w-full text-center py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:border-blue-500/30 font-black uppercase tracking-widest text-xs transition-all"
                            >
                                Editar Plano
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </MasterLayout>
    );
};

export default MasterPlansList;
