import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listBreakTypes, startBreak, BreakType } from '../services/api';

const TabletScan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badgeCodeFromLogin = (location.state as any)?.badgeCode;

  const [isScanning, setIsScanning] = useState(!badgeCodeFromLogin);
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakType, setSelectedBreakType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [testBadgeCode, setTestBadgeCode] = useState('');
  const [isTestMode] = useState(() => {
    const meta = import.meta as any;
    return meta.env.DEV && meta.env.VITE_KIOSK_TEST_MODE === 'true';
  });

  useEffect(() => {
    // Load break types on mount
    const loadBreakTypes = async () => {
      try {
        const types = await listBreakTypes();
        setBreakTypes(types);

        // Robust selection:
        // 1. Check if current selectedBreakType is still valid in the new list
        // 2. If not, pick the first one that is NOT full
        // 3. Fallback to the first one available
        if (types.length > 0) {
          const isValid = types.some(t => t.id === selectedBreakType);
          if (!isValid) {
            const firstAvailable = types.find(t => t.active_count < t.capacity) || types[0];
            setSelectedBreakType(firstAvailable.id);
          }
        } else {
          setSelectedBreakType('');
        }
      } catch (err: any) {
        setError('Erro ao carregar tipos de pausa');
        console.error(err);
      }
    };
    loadBreakTypes();
  }, []);

  const handleStartBreak = async (customBadgeCode?: string) => {
    if (!selectedBreakType) {
      setError('Selecione um tipo de pausa');
      return;
    }

    setLoading(true);
    setError('');

    // Dev Log
    if ((import.meta as any).env.DEV) {
      console.log(`[KIOSK] Starting break with:`, {
        badge_code: customBadgeCode || badgeCodeFromLogin || '1001',
        break_type_id: selectedBreakType
      });
    }

    try {
      // Use custom badge code if provided (manual test), 
      // otherwise use badge code from login, otherwise fallback
      const badge_code = customBadgeCode || badgeCodeFromLogin || '1001';

      const result = await startBreak(badge_code, selectedBreakType);

      // Navigate to timer with break data
      navigate('/kiosk/active', {
        state: {
          breakData: result,
          badgeCode: badge_code
        }
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao iniciar pausa';
      setError(errorMsg);

      // Dev Log for failure
      if ((import.meta as any).env.DEV) {
        console.error(`[KIOSK_ERROR] Failed to start break. 
          ID sent: "${selectedBreakType}"
          Server Error: "${errorMsg}"`);
      }

      setIsScanning(false);
      setLoading(false);
    }
  };

  const handleTestScan = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Only numbers
    if (!/^\d+$/.test(testBadgeCode)) {
      setError('Matrícula de teste deve conter apenas números');
      return;
    }

    // Standardize to 4 digits
    const standardizedCode = testBadgeCode.padStart(4, '0');

    if ((import.meta as any).env.DEV && isTestMode) {
      console.log(`[TEST MODE] Simulating scan for badge: ${standardizedCode}`);
    }

    handleStartBreak(standardizedCode);
  };

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
              {breakTypes.map((type) => {
                const isFull = type.active_count >= type.capacity;
                return (
                  <option key={type.id} value={type.id} className="bg-gray-900" disabled={isFull}>
                    {type.name} ({type.active_count}/{type.capacity} ocupado) — {type.max_minutes} min
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4">
            <p className="text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* Test Mode Simulation UI */}
        {isTestMode && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 justify-center text-emerald-400">
              <span className="material-symbols-outlined">biotech</span>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Modo de Teste Ativo</span>
            </div>

            <form onSubmit={handleTestScan} className="flex gap-2">
              <input
                type="text"
                placeholder="Matrícula (ex: 1)"
                value={testBadgeCode}
                onChange={(e) => setTestBadgeCode(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !testBadgeCode || (breakTypes.find(t => t.id === selectedBreakType)?.active_count ?? 0) >= (breakTypes.find(t => t.id === selectedBreakType)?.capacity ?? 1)}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {(breakTypes.find(t => t.id === selectedBreakType)?.active_count ?? 0) >= (breakTypes.find(t => t.id === selectedBreakType)?.capacity ?? 1) ? 'Lotado' : 'Simular'}
              </button>
            </form>
            <p className="text-[10px] text-gray-500 font-medium">As matrículas serão completadas com zeros à esquerda automaticamente.</p>
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
