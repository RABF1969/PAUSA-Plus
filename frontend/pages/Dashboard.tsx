
import React, { useState, useEffect } from 'react';
import { EventStatus, PauseTypeCategory } from '../types';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Pausas Livres', value: '4/10', color: 'emerald', icon: 'check_circle', trend: 'Capacidade OK' },
    { label: 'Em Pausa', value: '6', color: 'orange', icon: 'groups', trend: '+1 vs média' },
    { label: 'Tempo Médio', value: '05:12', color: 'blue', icon: 'timelapse', trend: 'Dentro da meta' },
    { label: 'Eficiência', value: '96%', color: 'emerald', icon: 'trending_up', trend: 'Meta: 95%' },
  ];

  const pausePoints = [
    { id: '1', name: 'WC Feminino 01', type: 'WC', occupant: 'Ana Silva', role: 'Operadora', time: '03:45', status: 'normal' },
    { id: '2', name: 'Sala de Descanso', type: 'Descanso', occupant: 'Marcos Oliveira', role: 'Logística', time: '08:12', status: 'normal' },
    { id: '3', name: 'Suporte Balcão 02', type: 'Atendimento', occupant: 'João Souza', role: 'Estoquista', time: '32:01', status: 'alert' },
    { id: '4', name: 'Área de Lanche', type: 'Lanche', occupant: 'Roberto Dias', role: 'Vendas', time: '08:22', status: 'normal' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'WC': return 'wc';
      case 'Lanche': return 'coffee';
      case 'Descanso': return 'bolt';
      case 'Atendimento': return 'support_agent';
      default: return 'pause';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'WC': return 'blue';
      case 'Lanche': return 'orange';
      case 'Descanso': return 'emerald';
      case 'Atendimento': return 'purple';
      default: return 'gray';
    }
  };

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
            <p className="text-gray-500 text-sm font-medium">Unidade São Paulo • {currentTime.toLocaleTimeString()}</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Visão Geral Operacional</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <span className="material-symbols-outlined text-[20px]">print</span> Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span> Solicitação
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
        {/* Visual Slots */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">grid_view</span> Pontos de Pausa
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pausePoints.map((point) => (
              <div 
                key={point.id} 
                className={`relative bg-white rounded-2xl p-5 border-l-4 shadow-sm group transition-all ${
                  point.status === 'alert' ? 'border-red-500 ring-2 ring-red-50' : `border-${getColor(point.type)}-500`
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      point.status === 'alert' ? 'text-red-600' : `text-${getColor(point.type)}-600`
                    }`}>
                      {point.status === 'alert' ? 'Alerta Tempo' : point.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-${getColor(point.type)}-500 text-xl`}>
                        {getIcon(point.type)}
                      </span>
                      <h4 className="text-lg font-black text-gray-900">{point.name}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black font-mono tracking-tight ${point.status === 'alert' ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                      {point.time}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Decorrido</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${point.occupant}/100`} className="size-10 rounded-full border border-gray-100" alt="" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{point.occupant}</p>
                      <p className="text-xs text-gray-500">{point.role}</p>
                    </div>
                  </div>
                  {point.status === 'alert' && (
                    <button className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-all">
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
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
              {[
                { name: 'Ana P.', type: 'Atendimento', time: '32:01', color: 'purple', icon: 'support_agent' },
                { name: 'Carlos M.', type: 'WC', time: '04:15', color: 'blue', icon: 'wc' },
                { name: 'Julio S.', type: 'Descanso', time: '09:05', color: 'emerald', icon: 'bolt' },
                { name: 'Mara L.', type: 'WC', time: '03:10', color: 'blue', icon: 'wc' },
                { name: 'Roberto J.', type: 'Lanche', time: '14:55', color: 'orange', icon: 'coffee' },
                { name: 'Vitor K.', type: 'Atendimento', time: '15:30', color: 'purple', icon: 'support_agent' },
              ].map((item, i) => (
                <div key={i} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-6 flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/list${i}/100`} className="size-8 rounded-full opacity-80" alt="" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Há {i * 5 + 2} min</p>
                      </div>
                    </div>
                    <div className="col-span-4 flex justify-center">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-${item.color}-50 text-${item.color}-600`}>
                        <span className="material-symbols-outlined text-xs">{item.icon}</span>
                        <span className="text-[10px] font-black uppercase whitespace-nowrap">{item.type}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-bold ${item.time.split(':')[0] > '20' ? 'text-red-500' : 'text-gray-900'}`}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
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
