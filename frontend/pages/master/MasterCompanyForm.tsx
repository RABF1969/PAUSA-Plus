
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import masterApi from '../../services/masterApi';
import MasterLayout from '../../components/layouts/MasterLayout';

interface CompanyFormData {
    name: string;
    status: 'active' | 'suspended';
    plan: 'trial' | 'basic' | 'pro' | 'enterprise';
    max_employees: number;
    max_plates: number;
}

const MasterCompanyForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        status: 'active',
        plan: 'basic',
        max_employees: 10,
        max_plates: 2
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchCompany();
        }
    }, [id]);

    const fetchCompany = async () => {
        setFetching(true);
        try {
            const response = await masterApi.get('/master/companies');
            const found = response.data.find((c: any) => c.id === id);
            
            if (found) {
                setFormData({
                    name: found.name,
                    status: found.status,
                    plan: found.plan,
                    max_employees: found.max_employees,
                    max_plates: found.max_plates
                });
            } else {
                setError('Empresa não encontrada.');
            }
        } catch (err: any) {
            setError('Erro ao carregar dados da empresa.');
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
            if (formData.max_employees < 1 || formData.max_plates < 1) {
                throw new Error('Limites devem ser maiores que 0');
            }

            if (isEdit) {
                await masterApi.patch(`/master/companies/${id}`, formData);
            } else {
                await masterApi.post('/master/companies', formData);
            }
            navigate('/alfabiz/companies');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erro ao salvar empresa.');
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
                                {/* Plan */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Plano</label>
                                    <select
                                        value={formData.plan}
                                        onChange={e => setFormData({ ...formData, plan: e.target.value as any })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="basic">Basic</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
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

                            <div className="grid grid-cols-2 gap-6">
                                {/* Max Employees */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Limite Funcionários</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_employees}
                                        onChange={e => setFormData({ ...formData, max_employees: parseInt(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Total de contas ativas permitidas.</p>
                                </div>

                                {/* Max Plates */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Limite Placas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_plates}
                                        onChange={e => setFormData({ ...formData, max_plates: parseInt(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Total de pontos operacionais físicos.</p>
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
