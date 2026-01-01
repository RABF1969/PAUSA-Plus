import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview, getActiveBreaks, endBreak, DashboardOverview, ActiveBreak } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activeBreaks, setActiveBreaks] = useState<ActiveBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!overview) setLoading(true);

      setError('');
      const [overviewData, breaksData] = await Promise.all([
        getDashboardOverview(),
        getActiveBreaks(),
      ]);
      setOverview(overviewData);
      setActiveBreaks(breaksData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEndBreak = async (id: string) => {
    try {
      await endBreak({ break_id: id });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao finalizar pausa');
    }
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] font-bold animate-pulse">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Pausas Livres',
      value: `${overview?.freeSlots || 0}/${overview?.totalSlots || 0}`,
      color: 'emerald',
      icon: 'check_circle',
      trend: overview && overview.freeSlots > 0 ? 'Capacidade OK' : 'Capacidade Cheia',
    },
    {
      label: 'Em Pausa',
      value: `${overview?.activePauses || 0}`,
      color: 'orange',
      icon: 'groups',
      trend: `${overview?.activePauses || 0} ativas agora`,
    },
    {
      label: 'Tempo Médio',
      value: formatTime(overview?.averageTimeMinutes || 0),
      color: 'blue',
      icon: 'timelapse',
      trend: 'Hoje',
    },
    {
      label: 'Eficiência',
      value: `${overview?.efficiency || 0}%`,
      color: 'emerald',
      icon: 'trending_up',
      trend: 'Meta: 95%',
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AO VIVO
            </span>
            <p className="text-[var(--text-secondary)] text-sm font-medium">PAUSA+ • {currentTime.toLocaleTimeString()}</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Visão Geral Operacional</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">bar_chart</span> Relatórios
          </button>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${refreshing
              ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed shadow-none'
              : 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${stat.color}-50 dark:bg-${stat.color}-950/30 rounded-xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider bg-${stat.color}-50 dark:bg-${stat.color}-950/30 text-${stat.color}-600 dark:text-${stat.color}-400 px-2 py-1 rounded-lg`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Breaks Container */}
        <div className="xl:col-span-2 bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-accent)]">
            <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">timer</span>
              Pausas Ativas
            </h2>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase">
              {activeBreaks.length} {activeBreaks.length === 1 ? 'COLABORADOR' : 'COLABORADORES'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-primary)]">
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Colaborador</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Pausa</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Início</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Duração</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)] text-[var(--text-primary)]">
                {activeBreaks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <span className="material-symbols-outlined text-4xl">coffee</span>
                        <p className="font-bold text-sm tracking-tight">Nenhuma pausa ativa no momento</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeBreaks.map((pausa) => (
                    <tr key={pausa.id} className="hover:bg-[var(--bg-accent)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--text-primary)] font-black`}>
                            {pausa.employee_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight">{pausa.employee_name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{pausa.employee_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-sm text-${getColor(pausa.break_type_name)}-500`}>
                            {getIcon(pausa.break_type_name)}
                          </span>
                          <span className="font-bold text-sm">{pausa.break_type_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[var(--text-secondary)]">
                          {new Date(pausa.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${pausa.status === 'alert' ? 'text-red-500' : 'text-emerald-500'}`}>
                              {formatTime(pausa.elapsed_minutes)}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold">/ {pausa.max_minutes}m</span>
                          </div>
                          <div className="w-24 h-1.5 bg-[var(--border-primary)] rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${pausa.status === 'alert' ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min((pausa.elapsed_minutes / pausa.max_minutes) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEndBreak(pausa.id)}
                          className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          Finalizar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--text-secondary)]">history</span> Atividade Recente
          </h3>
          <div className="flex flex-col gap-3">
            {activeBreaks.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 text-center border border-[var(--border-primary)] shadow-sm">
                <p className="text-[var(--text-secondary)] text-sm font-bold">Nenhum histórico recente</p>
              </div>
            ) : (
              activeBreaks.slice(0, 5).map((activity) => (
                <div key={activity.id} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary)] shadow-sm flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
                  <div className={`size-10 rounded-lg bg-[var(--bg-accent)] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold`}>
                    <span className="material-symbols-outlined text-xl">
                      {getIcon(activity.break_type_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate group-hover:text-emerald-500 transition-colors">
                      {activity.employee_name}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                      {activity.break_type_name} • {new Date(activity.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-500">
                      LIVE
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-center">
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 uppercase tracking-widest transition-colors"
            >
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('café')) return 'orange';
  if (t.includes('almoço')) return 'blue';
  if (t.includes('banheiro')) return 'purple';
  if (t.includes('descanso')) return 'emerald';
  return 'emerald';
};

const getIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('café')) return 'coffee';
  if (t.includes('almoço')) return 'restaurant';
  if (t.includes('banheiro')) return 'wc';
  if (t.includes('descanso')) return 'bedtime';
  return 'timer';
};

export default Dashboard;
