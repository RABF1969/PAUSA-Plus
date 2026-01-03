
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
            <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Empresas</h2>
                    <Link 
                        to="/alfabiz/companies/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <span>+</span> Nova Empresa
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-500/20 font-bold">
                        {error}
                    </div>
                )}

                <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-soft border border-[var(--border-primary)] overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4 text-center">Func. (Max)</th>
                                <th className="px-6 py-4 text-center">Placas (Max)</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors group">
                                    <td className="px-6 py-4 font-black text-[var(--text-primary)]">
                                        {company.name}
                                        <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5 uppercase tracking-tighter">{company.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                            company.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                        }`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${
                                            company.plan === 'pro' || company.plan === 'enterprise'
                                                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50'
                                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/50'
                                        }`}>
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">
                                        {company.max_employees}
                                    </td>
                                    <td className="px-6 py-4 text-center text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">
                                        {company.max_plates}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/alfabiz/companies/${company.id}/edit`)}
                                            className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-800 focus:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 outline-none"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {companies.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] uppercase tracking-widest text-xs font-bold">
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
