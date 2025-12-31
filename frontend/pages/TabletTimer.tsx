
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TabletTimer: React.FC = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-8 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-3xl">timer</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">PAUSA+</h1>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
          <img src="https://picsum.photos/seed/current/100" className="size-10 rounded-full" alt="" />
          <div>
            <p className="text-sm font-black text-gray-900 leading-tight">João Silva</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Em Atendimento</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fcfdfd]">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="material-symbols-outlined text-sm">bolt</span> Descanso Rápido
            </span>
            <h2 className="text-5xl font-black tracking-tight text-gray-900 mb-4">Aproveite seu descanso</h2>
            <p className="text-gray-500 text-lg font-medium">O registro é automático. Use este tempo para recarregar as energias.</p>
          </div>

          <div className="relative size-72 mx-auto mb-12 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle cx="144" cy="144" r="130" className="stroke-gray-100 fill-none" strokeWidth="12" />
              <circle 
                cx="144" 
                cy="144" 
                r="130" 
                className="stroke-emerald-500 fill-none transition-all duration-1000" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="816"
                strokeDashoffset={816 - (Math.min(seconds / 600, 1) * 816)} 
              />
            </svg>
            
            <div className="flex flex-col items-center">
              <span className="text-7xl font-black font-mono tracking-tighter text-gray-900">
                {formatTime(seconds)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Decorrido</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Recomendado</p>
              <p className="text-lg font-black text-gray-900">10:00</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Máximo</p>
              <p className="text-lg font-black text-gray-900">15:00</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/kiosk/login')}
            className="w-full max-w-md h-20 bg-emerald-500 text-white rounded-3xl text-2xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            ENCERRAR PAUSA <span className="material-symbols-outlined text-4xl">check_circle</span>
          </button>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-400 text-sm border-t border-gray-50">
        <p className="font-medium italic">Seus dados são protegidos pela LGPD e usados apenas para gestão operacional.</p>
      </footer>
    </div>
  );
};

export default TabletTimer;
