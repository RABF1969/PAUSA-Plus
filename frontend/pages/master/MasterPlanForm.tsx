import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import masterApi, { getPlans, createPlan, updatePlan } from '../../services/masterApi';
import MasterLayout from '../../components/layouts/MasterLayout';

interface PlanFormData {
    name: string;
    code: string;
    employee_limit: number;
    plate_limit: number;
    price_real: string; // Input string for easier currency handling
    billing_cycle: 'monthly' | 'yearly';
    is_active: boolean;
}

const MasterPlanForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState<PlanFormData>({
        name: '',
        code: '',
        employee_limit: 10,
        plate_limit: 1,
        price_real: '0,00',
        billing_cycle: 'monthly',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchPlan();
        }
    }, [id]);

    const fetchPlan = async () => {
        setFetching(true);
        try {
            const response = await getPlans();
            const found = response.data.find((p: any) => p.id === id);
            
            if (found) {
                setFormData({
                    name: found.name,
                    code: found.code,
                    employee_limit: found.employee_limit,
                    plate_limit: found.plate_limit,
                    price_real: (found.price_cents / 100).toFixed(2).replace('.', ','),
                    billing_cycle: found.billing_cycle,
                    is_active: found.is_active
                });
            } else {
                setError('Plano não encontrado.');
            }
        } catch (err: any) {
            setError('Erro ao carregar dados do plano.');
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
            // Convert price string "99,90" to cents 9990
            const priceClean = formData.price_real.replace(/\./g, '').replace(',', '.');
            const priceCents = Math.round(parseFloat(priceClean) * 100);

            if (isNaN(priceCents) || priceCents < 0) {
                throw new Error('Preço inválido.');
            }

            const payload = {
                ...formData,
                price_cents: priceCents
            };
            // Remove helper field
            delete (payload as any).price_real;

            if (isEdit) {
                await updatePlan(id!, payload);
            } else {
                await createPlan(payload);
            }
            navigate('/alfabiz/plans');
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;
            console.error('save plan failed', status, data);
            setError(data?.error || err.message || `Erro ao salvar plano (${status})`);
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
                            {isEdit ? 'Editar Plano' : 'Novo Plano'}
                        </h1>
                        <button 
                            onClick={() => navigate('/alfabiz/plans')}
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
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Plano</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                                        placeholder="Ex: Basic"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Código (Único)</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                                        placeholder="Ex: basic-plan"
                                        required
                                        disabled={isEdit} 
                                    />
                                    {isEdit && <p className="text-xs text-slate-400 mt-1">Código não pode ser alterado.</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                                    <input
                                        type="text"
                                        value={formData.price_real}
                                        onChange={e => setFormData({ ...formData, price_real: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo</label>
                                    <select
                                        value={formData.billing_cycle}
                                        onChange={e => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="monthly">Mensal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.is_active ? 'true' : 'false'}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="true">Ativo</option>
                                        <option value="false">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">Limites do Plano</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Funcionários</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.employee_limit}
                                            onChange={e => setFormData({ ...formData, employee_limit: parseInt(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Placas</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.plate_limit}
                                            onChange={e => setFormData({ ...formData, plate_limit: parseInt(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/alfabiz/plans')}
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

export default MasterPlanForm;
