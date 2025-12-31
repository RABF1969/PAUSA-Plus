
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TabletLogin: React.FC = () => {
  const [matricula, setMatricula] = useState('');
  const [pin, setPin] = useState('');
  const [activeField, setActiveField] = useState<'matricula' | 'pin'>('matricula');
  const navigate = useNavigate();

  const handleKeypadPress = (val: string) => {
    if (activeField === 'matricula') setMatricula(prev => (prev.length < 6 ? prev + val : prev));
    else setPin(prev => (prev.length < 4 ? prev + val : prev));
  };

  const handleBackspace = () => {
    if (activeField === 'matricula') setMatricula(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    if (matricula && pin) navigate('/kiosk/scan');
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
            <p className="text-gray-500 font-medium">Use seu PIN para gerenciar suas pausas.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div 
              onClick={() => setActiveField('matricula')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                activeField === 'matricula' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 bg-white'
              }`}
            >
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Matrícula</label>
              <div className="text-2xl font-black tracking-widest h-8 text-gray-900">{matricula || <span className="text-gray-200">000000</span>}</div>
            </div>

            <div 
              onClick={() => setActiveField('pin')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                activeField === 'pin' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 bg-white'
              }`}
            >
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Senha (PIN)</label>
              <div className="text-2xl font-black tracking-widest h-8 text-gray-900">{'•'.repeat(pin.length) || <span className="text-gray-200">••••</span>}</div>
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                onClick={() => handleKeypadPress(num.toString())}
                className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-black text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button className="h-16 rounded-2xl flex items-center justify-center text-gray-300 font-bold text-xs uppercase tracking-tighter">Limpar</button>
            <button 
              onClick={() => handleKeypadPress('0')}
              className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-black text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
            >
              0
            </button>
            <button 
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-3xl">backspace</span>
            </button>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full mt-6 h-16 bg-emerald-500 text-white rounded-2xl text-xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
          >
            ENTRAR <span className="material-symbols-outlined">arrow_forward</span>
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
