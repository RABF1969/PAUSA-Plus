import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBreakTypes, startBreak, BreakType } from '../services/api';

const TabletScan: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakType, setSelectedBreakType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load break types on mount
    const loadBreakTypes = async () => {
      try {
        const types = await listBreakTypes();
        setBreakTypes(types);
        if (types.length > 0) {
          setSelectedBreakType(types[0].id); // Select first by default
        }
      } catch (err: any) {
        setError('Erro ao carregar tipos de pausa');
        console.error(err);
      }
    };
    loadBreakTypes();
  }, []);

  const handleStartBreak = async () => {
    if (!selectedBreakType) {
      setError('Selecione um tipo de pausa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate badge scan - in real app, this would come from QR scanner
      const badge_code = 'FUNC001'; // TODO: Get from actual scan

      const result = await startBreak(badge_code, selectedBreakType);

      // Navigate to timer with break data
      navigate('/kiosk/active', {
        state: {
          breakData: result
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao iniciar pausa');
      setIsScanning(false);
      setLoading(false);
    }
  };

  // Auto-start after scan simulation (3 seconds)
  useEffect(() => {
    if (isScanning && selectedBreakType) {
      const timer = setTimeout(() => {
        setIsScanning(false);
        handleStartBreak();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, selectedBreakType]);

  return (
    <div className="min-h-screen bg-[#111815] flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Aproxime o QR Code</h1>
          <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">Escaneando Placa Operacional</p>
        </div>

        {/* Break Type Selector */}
        {breakTypes.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Tipo de Pausa</label>
            <select
              value={selectedBreakType}
              onChange={(e) => setSelectedBreakType(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-emerald-500"
              disabled={loading}
            >
              {breakTypes.map((type) => (
                <option key={type.id} value={type.id} className="bg-gray-900">
                  {type.name} ({type.max_minutes} min)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4">
            <p className="text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* Scanner Viewfinder */}
        <div className="relative w-full aspect-square max-w-[400px] mx-auto">
          <div className="absolute inset-0 border-[4px] border-emerald-500/20 rounded-[40px]"></div>

          {/* Corner Markers */}
          <div className="absolute top-0 left-0 size-20 border-t-8 border-l-8 border-emerald-500 rounded-tl-[40px]"></div>
          <div className="absolute top-0 right-0 size-20 border-t-8 border-r-8 border-emerald-500 rounded-tr-[40px]"></div>
          <div className="absolute bottom-0 left-0 size-20 border-b-8 border-l-8 border-emerald-500 rounded-bl-[40px]"></div>
          <div className="absolute bottom-0 right-0 size-20 border-b-8 border-r-8 border-emerald-500 rounded-br-[40px]"></div>

          <div className="absolute inset-8 bg-emerald-500/5 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-[100px] opacity-20">qr_code_2</span>
            {/* Animated Line */}
            {(isScanning || loading) && (
              <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_emerald-400] scanner-line"></div>
            )}
          </div>

          {(isScanning || loading) && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest">
                  {loading ? 'Iniciando pausa...' : 'Buscando Sinal...'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-20">
          <button
            onClick={() => navigate('/kiosk/login')}
            className="text-gray-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
            disabled={loading}
          >
            <span className="material-symbols-outlined">close</span> Cancelar Operação
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabletScan;
