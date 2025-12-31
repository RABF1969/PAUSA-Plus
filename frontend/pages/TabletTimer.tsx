import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { endBreak, StartBreakResponse } from '../services/api';

const TabletTimer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get break data from navigation state
  const breakData = (location.state as any)?.breakData as StartBreakResponse | undefined;

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndBreak = async () => {
    if (!breakData) {
      setError('Dados da pausa não encontrados');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extract badge_code from employee data or use hardcoded for now
      const badge_code = 'FUNC001'; // TODO: Get from breakData or context

      const result = await endBreak(badge_code);

      // Show success and navigate back
      alert(`Pausa encerrada! Duração: ${result.duration_minutes} min${result.status === 'exceeded' ? ' (excedeu o limite)' : ''}`);
      navigate('/kiosk/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao encerrar pausa');
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const maxMinutes = breakData?.max_minutes || 15;
  const progress = Math.min(seconds / (maxMinutes * 60), 1);
  const isExceeded = seconds > maxMinutes * 60;

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
            <p className="text-sm font-black text-gray-900 leading-tight">
              {breakData?.employee_name || 'Funcionário'}
            </p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Em Pausa</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fcfdfd]">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${isExceeded ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isExceeded ? 'Tempo Excedido' : 'Descanso Rápido'}
            </span>
            <h2 className="text-5xl font-black tracking-tight text-gray-900 mb-4">Aproveite seu descanso</h2>
            <p className="text-gray-500 text-lg font-medium">O registro é automático. Use este tempo para recarregar as energias.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 mb-6">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          )}

          <div className="relative size-72 mx-auto mb-12 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle cx="144" cy="144" r="130" className="stroke-gray-100 fill-none" strokeWidth="12" />
              <circle
                cx="144"
                cy="144"
                r="130"
                className={`fill-none transition-all duration-1000 ${isExceeded ? 'stroke-red-500' : 'stroke-emerald-500'}`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="816"
                strokeDashoffset={816 - (progress * 816)}
              />
            </svg>

            <div className="flex flex-col items-center">
              <span className={`text-7xl font-black font-mono tracking-tighter ${isExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(seconds)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Decorrido</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Recomendado</p>
              <p className="text-lg font-black text-gray-900">{formatTime((maxMinutes * 60) * 0.66)}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Máximo</p>
              <p className="text-lg font-black text-gray-900">{formatTime(maxMinutes * 60)}</p>
            </div>
          </div>

          <button
            onClick={handleEndBreak}
            disabled={loading}
            className={`w-full max-w-md h-20 rounded-3xl text-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-4 ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 active:scale-95'
              }`}
          >
            {loading ? 'ENCERRANDO...' : 'ENCERRAR PAUSA'}
            <span className="material-symbols-outlined text-4xl">check_circle</span>
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
