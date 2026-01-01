import React, { useState, useEffect } from 'react';
import { getDashboardOverview, getActiveBreaks, DashboardOverview, ActiveBreak } from '../services/api';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activeBreaks, setActiveBreaks] = useState<ActiveBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('wc') || lowerType.includes('banheiro')) return 'wc';
    if (lowerType.includes('lanche') || lowerType.includes('café')) return 'coffee';
    if (lowerType.includes('descanso')) return 'bolt';
    if (lowerType.includes('atendimento')) return 'support_agent';
    return 'pause';
  };

  const getColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('wc') || lowerType.includes('banheiro')) return 'blue';
    if (lowerType.includes('lanche') || lowerType.includes('café')) return 'orange';
    if (lowerType.includes('descanso')) return 'emerald';
    if (lowerType.includes('atendimento')) return 'purple';
    return 'gray';
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="size-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600"
          >
            Tentar Novamente
          </button>
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AO VIVO
            </span>
            <p className="text-gray-500 text-sm font-medium">PAUSA+ • {currentTime.toLocaleTimeString()}</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Visão Geral Operacional</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <span className="material-symbols-outlined text-[20px]">print</span> Relatório
          </button>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span> Atualizar
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#e5ece9] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${stat.color}-50 rounded-xl text-${stat.color}-600`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider bg-${stat.color}-50 text-${stat.color}-600 px-2 py-1 rounded-lg`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Breaks */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">grid_view</span> Pausas Ativas
            </h3>
          </div>

          {activeBreaks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">check_circle</span>
              <p className="text-gray-500 font-bold">Nenhuma pausa ativa no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBreaks.map((breakItem) => {
                const color = getColor(breakItem.break_type_name);
                const icon = getIcon(breakItem.break_type_name);

                return (
                  <div
                    key={breakItem.id}
                    className={`relative bg-white rounded-2xl p-5 border-l-4 shadow-sm group transition-all ${breakItem.status === 'alert' ? 'border-red-500 ring-2 ring-red-50' : `border-${color}-500`
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${breakItem.status === 'alert' ? 'text-red-600' : `text-${color}-600`
                          }`}>
                          {breakItem.status === 'alert' ? 'Alerta Tempo' : breakItem.break_type_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-${color}-500 text-xl`}>
                            {icon}
                          </span>
                          <h4 className="text-lg font-black text-gray-900">{breakItem.break_type_name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black font-mono tracking-tight ${breakItem.status === 'alert' ? 'text-red-500 animate-pulse' : 'text-gray-900'
                          }`}>
                          {formatTime(breakItem.elapsed_minutes)}
                        </span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Decorrido</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                          {breakItem.employee_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{breakItem.employee_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{breakItem.employee_role}</p>
                        </div>
                      </div>
                      {breakItem.status === 'alert' && (
                        <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                          Excedeu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">history</span> Atividade Recente
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5ece9] overflow-hidden flex flex-col h-[520px]">
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
              <div className="grid grid-cols-12 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="col-span-6">Colaborador</div>
                <div className="col-span-4 text-center">Tipo</div>
                <div className="col-span-2 text-right">Tempo</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeBreaks.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm font-medium">Nenhuma atividade recente</p>
                </div>
              ) : (
                activeBreaks.map((item, i) => {
                  const color = getColor(item.break_type_name);
                  const icon = getIcon(item.break_type_name);

                  return (
                    <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">
                            {item.employee_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.employee_name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Há {item.elapsed_minutes} min</p>
                          </div>
                        </div>
                        <div className="col-span-4 flex justify-center">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-${color}-50 text-${color}-600`}>
                            <span className="material-symbols-outlined text-xs">{icon}</span>
                            <span className="text-[10px] font-black uppercase whitespace-nowrap">{item.break_type_name}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`text-sm font-bold ${item.status === 'alert' ? 'text-red-500' : 'text-gray-900'}`}>
                            {formatTime(item.elapsed_minutes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Ver Histórico Completo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
