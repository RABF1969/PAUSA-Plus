import React, { useState, useEffect } from 'react';
import { getBreakHistory, HistoryItem, listBreakTypes, BreakType } from '../services/api';

const Reports: React.FC = () => {
    const [data, setData] = useState<HistoryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        breakTypeId: ''
    });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await getBreakHistory({
                page,
                limit: 10,
                ...filters
            });
            setData(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const fetchBreakTypes = async () => {
        try {
            const types = await listBreakTypes();
            setBreakTypes(types);
        } catch (err) {
            console.error('Erro ao carregar tipos de pausa:', err);
        }
    };

    useEffect(() => {
        fetchBreakTypes();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [page, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const exportToCSV = () => {
        if (data.length === 0) return;

        const headers = ['Funcionário', 'Tipo', 'Início', 'Fim', 'Duração (min)', 'Status'];
        const rows = data.map(item => [
            item.employee_name,
            item.break_type_name,
            new Date(item.started_at).toLocaleString(),
            item.ended_at ? new Date(item.ended_at).toLocaleString() : '-',
            item.duration_minutes || 0,
            item.status === 'exceeded' ? 'Excedeu' : 'OK'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_pausas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Relatórios de Pausas</h1>
                    <p className="text-[var(--text-secondary)] font-medium">Consulte e exporte o histórico completo da empresa.</p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={data.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Exportar CSV
                </button>
            </header>

            {/* Filters */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Início</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Fim</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Tipo de Pausa</label>
                    <select
                        name="breakTypeId"
                        value={filters.breakTypeId}
                        onChange={handleFilterChange}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-all"
                    >
                        <option value="">Todos os tipos</option>
                        {breakTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setFilters({ startDate: '', endDate: '', breakTypeId: '' });
                            setPage(1);
                        }}
                        className="w-full text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-500 transition-colors py-2"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Funcionário</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">Início</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">Fim</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">Duração</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] font-medium">
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] font-medium">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-[var(--bg-accent)] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-200 dark:bg-emerald-950/30 flex items-center justify-center text-slate-900 dark:text-emerald-400 font-bold text-xs ring-1 ring-slate-300 dark:ring-0">
                                                    {item.employee_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{item.employee_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex px-2 py-1 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] text-[10px] font-black uppercase border border-[var(--border-primary)]">
                                                {item.break_type_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-mono text-[var(--text-secondary)]">
                                            {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <p className="text-[10px] opacity-70">{new Date(item.started_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-mono text-[var(--text-secondary)]">
                                            {item.ended_at ? new Date(item.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            {item.ended_at && <p className="text-[10px] opacity-70">{new Date(item.ended_at).toLocaleDateString()}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-[var(--text-primary)]">
                                            {item.duration_minutes || 0} min
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'exceeded' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                <span className={`size-1.5 rounded-full ${item.status === 'exceeded' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                {item.status === 'exceeded' ? 'Excedeu' : 'Finalizada'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-[var(--bg-accent)] px-6 py-4 flex items-center justify-between border-t border-[var(--border-primary)]">
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Mostrando <span className="font-bold text-[var(--text-primary)]">{data.length}</span> de <span className="font-bold text-[var(--text-primary)]">{total}</span> registros
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
