
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TabletLogin: React.FC = () => {
  const [matricula, setMatricula] = useState('');
  const navigate = useNavigate();

  const handleKeypadPress = (val: string) => {
    setMatricula(prev => (prev.length < 6 ? prev + val : prev));
  };

  const handleBackspace = () => {
    setMatricula(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setMatricula('');
  };

  const handleLogin = () => {
    if (matricula) {
      // In a real app, we'd verify the matricula here or pass it to scan
      navigate('/kiosk/scan', { state: { badgeCode: matricula } });
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#fcfdfd]">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <div className="size-16 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-200">
              <span className="material-symbols-outlined text-4xl">person_pin</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Identifique-se</h1>
            <p className="text-gray-500 font-medium">Digite sua matrícula para gerenciar suas pausas.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/20 transition-all">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Matrícula Operacional</label>
              <div className="text-4xl font-black tracking-[0.3em] h-10 text-gray-900 flex items-center justify-center">
                {matricula || <span className="text-gray-200">0000</span>}
              </div>
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleKeypadPress(num.toString())}
                className="h-20 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-black text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-20 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-20 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-black text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-20 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-3xl">backspace</span>
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={!matricula}
            className="w-full mt-8 h-20 bg-emerald-500 text-white rounded-[24px] text-xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
          >
            CONTINUAR <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Hero Area */}
      <div className="hidden lg:flex w-1/2 bg-emerald-500 items-center justify-center p-12 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-md text-center">
          <div className="size-32 bg-white/20 rounded-[40px] mx-auto flex items-center justify-center backdrop-blur-md mb-10 border border-white/30">
            <span className="material-symbols-outlined text-6xl">hourglass_empty</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-6 leading-[0.9]">Gestão de Pausas Inteligente</h2>
          <p className="text-xl text-emerald-50 font-medium leading-relaxed opacity-80">
            Mantenha o equilíbrio produtivo e seu bem-estar. Registre suas pausas de forma simples e rápida.
          </p>
          <div className="mt-12 pt-12 border-t border-white/20 flex justify-center gap-8 opacity-50">
            <div className="text-center">
              <p className="text-2xl font-black">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">Seguro</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">Ético</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">Transparente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletLogin;
