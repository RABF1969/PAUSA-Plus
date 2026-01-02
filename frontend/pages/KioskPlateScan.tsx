import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolvePlate } from '../services/api';
import { setPlateContext } from '../utils/kioskContext';

const KioskPlateScan: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure focus is always on the input for scanners
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScan = async (scannedCode: string) => {
    // Basic validation to avoid spamming API with partial codes
    if (!scannedCode || scannedCode.length < 5) return;

    try {
      setLoading(true);
      setError('');
      const plate = await resolvePlate(scannedCode);
      
      // Save context
      setPlateContext(plate);
      
      // Navigate to login
      navigate('/kiosk/login');
    } catch (err: any) {
      setError('Placa não encontrada ou inválida. Tente novamente.');
      setCode(''); // Clear for next scan
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCode(val);
    
    // Scanners usually act fast or append Enter. 
    // We can rely on Enter key (form submit) or debounce.
    // Given the "PLACA-" prefix or length, we could auto-submit.
    // For now, let's rely on Form Submit (Enter key) which scanners send.
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(code);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      {/* Scan Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        <div className="w-full max-w-[440px] z-10">
          <div className="text-center mb-12">
            <div className="size-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-pulse">
              <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-4">Ponto Operacional</h1>
            <p className="text-slate-400 font-medium text-lg">Aproxime o QR Code da placa para iniciar.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative">
             <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border-2 border-slate-700 text-center text-white text-2xl font-black tracking-widest rounded-2xl py-6 px-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-700"
              placeholder="Aguardando Leitura..."
              autoFocus
              autoComplete="off"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="size-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl text-center font-bold animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined align-bottom mr-2">error</span>
              {error}
            </div>
          )}
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 size-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
           <div className="absolute bottom-1/4 right-1/4 size-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Info Area */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 items-center justify-center p-12 text-white relative border-l border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative z-10 max-w-md text-center opacity-60">
          <div className="size-24 border-4 border-dashed border-slate-700 rounded-3xl mx-auto flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-5xl text-slate-700">factory</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4 text-slate-500">PAUSA+ Enterprise</h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Sistema de gestão de pausas e produtividade.
            <br />Identifique o posto de trabalho para continuar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KioskPlateScan;
