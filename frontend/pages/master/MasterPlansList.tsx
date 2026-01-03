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
                        <div key={plan.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${plan.is_active ? 'border-slate-200' : 'border-red-100 bg-red-50/10'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                    <span className="text-xs font-mono text-slate-400 uppercase">{plan.code}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${plan.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {plan.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            
                            <div className="text-3xl font-bold text-slate-900 mb-6">
                                {formatPrice(plan.price_cents)}
                                <span className="text-sm font-normal text-slate-500">/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Funcionários</span>
                                    <span className="font-medium text-slate-900">{plan.employee_limit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Placas</span>
                                    <span className="font-medium text-slate-900">{plan.plate_limit}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/alfabiz/plans/${plan.id}/edit`}
                                className="block w-full text-center py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
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
