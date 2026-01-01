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
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Relatórios de Pausas</h1>
                    <p className="text-gray-500 font-medium">Consulte e exporte o histórico completo da empresa.</p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={data.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Exportar CSV
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5ece9] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Início</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Fim</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tipo de Pausa</label>
                    <select
                        name="breakTypeId"
                        value={filters.breakTypeId}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
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
                        className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#e5ece9] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Funcionário</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Tipo</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Início</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Fim</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Duração</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                                    Carregando dados...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">
                                                {item.employee_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{item.employee_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase">
                                            {item.break_type_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-mono text-gray-500">
                                        {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <p className="text-[10px]">{new Date(item.started_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-mono text-gray-500">
                                        {item.ended_at ? new Date(item.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        {item.ended_at && <p className="text-[10px]">{new Date(item.ended_at).toLocaleDateString()}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                                        {item.duration_minutes || 0} min
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'exceeded' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
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

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                        Mostrando <span className="font-bold">{data.length}</span> de <span className="font-bold">{total}</span> registros
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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
