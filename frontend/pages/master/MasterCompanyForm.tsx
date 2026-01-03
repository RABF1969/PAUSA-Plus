import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import masterApi, { getPlans, createCompany, getCompanies } from '../../services/masterApi';
import MasterLayout from '../../components/layouts/MasterLayout';
import { getApiErrorMessage, logErrorInDev } from '../../utils/getApiErrorMessage';

interface CompanyFormData {
    name: string;
    status: 'active' | 'suspended';
    plan_id: string; // Updated to be ID
    max_employees: number | ''; // Allow empty for override clear
    max_plates: number | ''; 
}

interface Plan {
    id: string;
    name: string;
    price_cents: number;
}

const MasterCompanyForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        status: 'active',
        plan_id: '',
        max_employees: '', // Default to standard inheritance (no override)
        max_plates: ''
    });
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setFetching(true);
        try {
            // 1. Fetch Plans
            const plansRes = await getPlans();
            const activePlans = plansRes.data.filter((p: any) => p.is_active);
            setPlans(activePlans);

            // 2. Fetch Company if Edit
            if (isEdit) {
                const response = await getCompanies();
                const found = response.data.find((c: any) => c.id === id);
                
                if (found) {
                    setFormData({
                        name: found.name,
                        status: found.status,
                        plan_id: found.plan_id || '',
                        max_employees: found.max_employees || '', // Using empty string to denote no override in UI
                        max_plates: found.max_plates || ''
                    });
                } else {
                    setError('Empresa não encontrada.');
                }
            } else {
                 // Set default plan to first available or specific one
                 if (activePlans.length > 0) {
                     const defaultPlan = activePlans.find((p:any) => p.code === 'trial') || activePlans[0];
                     setFormData(prev => ({ ...prev, plan_id: defaultPlan.id }));
                 }
            }
        } catch (err: any) {
            setError('Erro ao carregar dados.');
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: any = {
                name: formData.name,
                status: formData.status,
                plan_id: formData.plan_id,
                // If user leaves empty in UI, send null to backend to clear override (inheriting from plan)
                // However, our backend DTO might need updating to handle null explicity, or passing undefined.
                // In MasterService updateCompany, we pass data directly.
                // Ensure backend treats null as "set to null" not "ignore".
                max_employees: formData.max_employees === '' ? null : Number(formData.max_employees),
                max_plates: formData.max_plates === '' ? null : Number(formData.max_plates)
            };

            if (isEdit) {
                await masterApi.patch(`/master/companies/${id}`, payload);
            } else {
                await createCompany(payload);
            }
            navigate('/alfabiz/companies');
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'MasterCompanyForm - Save');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <MasterLayout>
            <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        </MasterLayout>
    );

    return (
        <MasterLayout>
            <div className="flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl overflow-hidden mt-8">
                    <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-white">
                            {isEdit ? 'Editar Empresa' : 'Nova Empresa'}
                        </h1>
                        <button 
                            onClick={() => navigate('/alfabiz/companies')}
                            className="text-slate-400 hover:text-white text-sm"
                        >
                            Cancelar
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Plan Select */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-slate-700">Plano</label>
                                        <Link 
                                            to="/alfabiz/plans"
                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Gerenciar Planos →
                                        </Link>
                                    </div>
                                    {plans.length > 0 ? (
                                        <select
                                            value={formData.plan_id}
                                            onChange={e => setFormData({ ...formData, plan_id: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        >
                                            <option value="" disabled>Selecione um plano...</option>
                                            {plans.map(plan => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} - {(plan.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                                            <p className="text-sm text-yellow-800 mb-2">Nenhum plano cadastrado.</p>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/alfabiz/plans/new')}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                + Cadastrar Plano
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="active">Ativo (Active)</option>
                                        <option value="suspended">Suspenso (Suspended)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <h3 className="text-sm font-bold text-slate-800 mb-2">Overrides (Opcional)</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Preencha apenas se quiser <strong>substituir</strong> os limites padrão do Plano selecionado.
                                    Deixe em branco para usar os limites do plano.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Max Employees */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Limite Funcionários</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_employees}
                                            onChange={e => setFormData({ ...formData, max_employees: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white placeholder-slate-400"
                                            placeholder="Padrão do Plano"
                                        />
                                    </div>

                                    {/* Max Plates */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Limite Placas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_plates}
                                            onChange={e => setFormData({ ...formData, max_plates: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white placeholder-slate-400"
                                            placeholder="Padrão do Plano"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/alfabiz/companies')}
                                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default MasterCompanyForm;

