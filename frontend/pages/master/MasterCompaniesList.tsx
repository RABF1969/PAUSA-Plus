
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import masterApi from '../../services/masterApi';
import MasterLayout from '../../components/layouts/MasterLayout';

interface Company {
    id: string;
    name: string;
    status: 'active' | 'suspended';
    plan: 'trial' | 'basic' | 'pro' | 'enterprise';
    max_employees: number;
    max_plates: number;
    created_at: string;
}

const MasterCompaniesList: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await masterApi.get('/master/companies');
            setCompanies(response.data);
        } catch (err: any) {
            setError('Erro ao carregar empresas. Verifique sua conexão ou token.');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                    <h2 className="text-2xl font-bold text-slate-800">Empresas</h2>
                    <Link 
                        to="/alfabiz/companies/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span>+</span> Nova Empresa
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4 text-center">Func. (Max)</th>
                                <th className="px-6 py-4 text-center">Placas (Max)</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {company.name}
                                        <div className="text-[10px] text-slate-400 font-mono mt-1">{company.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            company.status === 'active' 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded border text-xs font-semibold ${
                                            company.plan === 'pro' || company.plan === 'enterprise'
                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 font-mono">
                                        {company.max_employees}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 font-mono">
                                        {company.max_plates}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            to={`/alfabiz/companies/${company.id}/edit`}
                                            className="text-blue-600 hover:text-blue-900 font-medium text-xs uppercase"
                                        >
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {companies.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Nenhuma empresa encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </MasterLayout>
    );
};

export default MasterCompaniesList;
