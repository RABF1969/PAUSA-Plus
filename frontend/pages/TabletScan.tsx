import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  listBreakTypes,
  startBreak,
  endBreak,
  getActiveBreakByBadge,
  BreakType,
} from '../services/api';
import { getPlateContext, clearPlateContext } from '../utils/kioskContext';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';

const TabletScan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badgeCodeFromLogin = (location.state as any)?.badgeCode;

  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakType, setSelectedBreakType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    type: 'start' | 'end';
    name: string;
    duration?: number;
    maxMinutes?: number;
  } | null>(null);

  const isProcessingRef = useRef(false);

  // =========================
  // Load break types
  // =========================
  const loadBreakTypes = async () => {
    try {
      const allTypes = await listBreakTypes();
      const plate = getPlateContext();

      let filtered = allTypes;
      if (plate?.allowed_break_types?.length) {
        filtered = allTypes.filter(t =>
          plate.allowed_break_types.includes(t.id)
        );
      }

      setBreakTypes(filtered);

      if (filtered.length && !selectedBreakType) {
        const firstAvailable =
          filtered.find(t => t.active_count < t.capacity) || filtered[0];
        setSelectedBreakType(firstAvailable.id);
      }
    } catch {
      setError('Erro ao carregar configurações');
    }
  };

  useEffect(() => {
    loadBreakTypes();
    const i = setInterval(loadBreakTypes, 30000);
    return () => clearInterval(i);
  }, []);

  // Auto trigger if coming from login
  useEffect(() => {
    if (badgeCodeFromLogin && selectedBreakType && !confirmation && !loading) {
      const t = setTimeout(
        () => handleToggleAction(badgeCodeFromLogin),
        2000
      );
      return () => clearTimeout(t);
    }
  }, [badgeCodeFromLogin, selectedBreakType]);

  // Auto reset overlays
  useEffect(() => {
    if (confirmation || error) {
      const t = setTimeout(() => {
        setConfirmation(null);
        setError('');
        if (badgeCodeFromLogin) {
          navigate('/kiosk/scan', { replace: true, state: {} });
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [confirmation, error]);

  // 4. Fallback de Segurança (Watchdog)
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (loading) {
      t = setTimeout(() => {
        if (isProcessingRef.current) {
          if (import.meta.env.DEV) console.warn('[KIOSK WATCHDOG] Stalled state detected. Resetting.');
          setError('Tempo excedido. Tente novamente.');
          setLoading(false);
          isProcessingRef.current = false;
        }
      }, 5000);
    }
    return () => clearTimeout(t);
  }, [loading]);

  // =========================
  // Toggle logic
  // =========================
  const handleToggleAction = async (badge: string) => {
    // 5. Dev Log (Audit)
    if (import.meta.env.DEV) {
      console.log('[KIOSK STATE] Request:', {
        badge_code: badge,
        selectedBreakType,
        loading,
        processing: isProcessingRef.current
      });
    }

    if (isProcessingRef.current) return;

    // 2. Corrigir Early-Returns
    if (!selectedBreakType) {
      setError('Selecione um tipo de pausa');
      setLoading(false);
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);

    try {
      const active = await getActiveBreakByBadge(badge);

      if (active) {
        const result = await endBreak({ break_id: active.id });
        setConfirmation({
          type: 'end',
          name: result.employee_name || 'Funcionário',
          duration: result.duration_minutes || 0,
        });
      } else {
        const plate = getPlateContext();
        const result = await startBreak(badge, selectedBreakType, plate?.id);
        setConfirmation({
          type: 'start',
          name: result.employee_name || 'Funcionário',
          maxMinutes: result.max_minutes || 0,
        });
      }
    } catch (err: any) {
      // 3. Garantir captura de erro
      const { message } = getApiErrorMessage(err);
      setError(message);
      logErrorInDev(err, 'TabletScan - Start Break');
    } finally {
      // 1. Garantir Finally executa sempre
      setLoading(false);
      isProcessingRef.current = false;
      setTestBadgeCode('');
      
      if (import.meta.env.DEV) {
        console.log('[KIOSK STATE] Finished. Reset complete.');
      }
    }
  };

  // =========================
  // Test Mode
  // =========================
  const [testBadgeCode, setTestBadgeCode] = useState('');
  const isTestMode =
    (import.meta as any).env.DEV && (import.meta as any).env.VITE_KIOSK_TEST_MODE === 'true';

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testBadgeCode) return;
    handleToggleAction(testBadgeCode.padStart(4, '0'));
  };

  // =========================
  // RENDER
  // =========================
  return (
    <>
      {/* MAIN UI */}
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center p-4 md:p-8 text-white font-sans overflow-hidden relative selection:bg-emerald-500/30">
        
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/5 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="w-full max-w-lg flex flex-col items-center gap-6 md:gap-8 relative z-10">
          
          {/* HEADER */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-500/80 mb-2">
              <span className="material-symbols-outlined text-lg animate-pulse">wifi_tethering</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-white drop-shadow-lg">
              ESCANEIE O QR CODE
            </h1>
            <p className="text-gray-400 font-medium tracking-wide text-xs md:text-sm">
              Modo Tablet Compartilhado
            </p>
          </div>

          {/* PAUSE SELECTOR */}
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <select
              value={selectedBreakType}
              onChange={(e) => setSelectedBreakType(e.target.value)}
              className="w-full bg-[#131816] border border-white/10 text-white p-4 rounded-xl appearance-none outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-lg font-bold text-center cursor-pointer relative z-10 shadow-xl"
            >
              <option value="" disabled>Selecione o tipo de pausa...</option>
              {breakTypes.map((type) => (
                <option 
                  key={type.id} 
                  value={type.id} 
                  disabled={type.active_count >= type.capacity}
                >
                  {type.name} {type.capacity ? `(${type.active_count}/${type.capacity})` : ''} - {type.duration_minutes} min
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>

          {/* SCANNER GRID */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] mx-auto group">
            {/* Animated Border */}
            <div className="absolute inset-0 border-[3px] border-emerald-500/30 rounded-3xl" />
            
            {/* Corner Pieces */}
            <div className={`absolute top-0 left-0 w-12 h-12 border-l-[6px] border-t-[6px] rounded-tl-3xl transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-400'}`} />
            <div className={`absolute top-0 right-0 w-12 h-12 border-r-[6px] border-t-[6px] rounded-tr-3xl transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-400'}`} />
            <div className={`absolute bottom-0 left-0 w-12 h-12 border-l-[6px] border-b-[6px] rounded-bl-3xl transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-400'}`} />
            <div className={`absolute bottom-0 right-0 w-12 h-12 border-r-[6px] border-b-[6px] rounded-br-3xl transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-400'}`} />

            {/* Inner Content */}
            <div className="absolute inset-4 rounded-2xl bg-[#0f1412] flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              
              {/* Scan Line Animation */}
              {!loading && !confirmation && !error && (
                <div className="absolute w-full h-[2px] bg-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              )}

              {/* Central Icon */}
              <div className="z-10 flex flex-col items-center gap-4 text-gray-600 group-hover:text-gray-500 transition-colors">
                 {loading ? (
                    <span className="material-symbols-outlined text-6xl animate-spin text-emerald-500">sync</span>
                 ) : (
                    <span className="material-symbols-outlined text-7xl font-light opacity-50">qr_code_scanner</span>
                 )}
              </div>
            </div>
          </div>

          {/* STATUS TEXT */}
          <div className="text-center space-y-2">
            <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
              {loading ? 'PROCESSANDO...' : 'AGUARDANDO LEITURA...'}
            </p>
            {error && <p className="text-red-400 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">{error}</p>}
          </div>

          {/* TEST MODE (Developer Tools) */}
          {isTestMode && (
             <div className="w-full p-4 rounded-xl border border-dashed border-gray-800 bg-[#0d1210]/50 backdrop-blur-sm mt-4">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
                  Developer Console
                </p>
                <form onSubmit={handleManualScan} className="flex gap-2">
                    <input
                      value={testBadgeCode}
                      onChange={e => setTestBadgeCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Matrícula simulada"
                      className="flex-1 bg-black/50 border border-gray-800 text-gray-300 px-3 py-2 rounded text-xs font-mono focus:border-gray-600 focus:outline-none transition-colors placeholder:text-gray-700"
                    />
                    <button className="px-4 py-2 rounded border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold uppercase transition-all">
                      Simular
                    </button>
                </form>
             </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-8">
            <button
              onClick={() => {
                if (confirm('Deseja realmente desconectar este ponto operacional?')) {
                  clearPlateContext();
                  navigate('/kiosk', { replace: true });
                }
              }}
              className="group flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors text-[10px] uppercase font-black tracking-[0.2em] py-2 px-4 rounded-full hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-sm group-hover:-rotate-180 transition-transform duration-500">swap_horiz</span>
              Trocar Placa
            </button>
          </div>

        </div>
      </div>

      {/* OVERLAY: CONFIRMATION */}
      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f0d]/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="text-center space-y-10 animate-in zoom-in-95 duration-500 max-w-sm px-6">
            <div className={`mx-auto size-32 rounded-full flex items-center justify-center ${confirmation.type === 'start' ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'bg-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.4)]'}`}>
              <span className="material-symbols-outlined text-6xl text-white">
                {confirmation.type === 'start' ? 'play_arrow' : 'stop'}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className={`text-5xl font-black tracking-tighter ${confirmation.type === 'start' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {confirmation.type === 'start' ? 'BOM DESCANSO!' : 'BOM TRABALHO!'}
              </h2>
              <div className="bg-white/10 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
                <p className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{confirmation.name ?? 'Funcionário'}</p>
                <p className={`text-sm font-bold uppercase tracking-widest ${confirmation.type === 'start' ? 'text-emerald-300' : 'text-orange-300'}`}>
                  {confirmation.type === 'start' ? `Limite: ${confirmation.maxMinutes ?? 0} min` : `Duração: ${confirmation.duration ?? 0} min`}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Retornando em 3s...</p>
          </div>
        </div>
      )}

      {/* OVERLAY: ERROR */}
      {error && !confirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-red-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="text-center space-y-8 animate-in bounce-in duration-500 max-w-sm px-6">
            <div className="mx-auto size-24 rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-white">error</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-red-400 uppercase tracking-tighter">ERRO!</h2>
              <p className="text-white text-lg font-bold leading-tight">{error}</p>
            </div>
            <p className="text-red-500/50 text-[10px] font-black uppercase tracking-[0.3em]">Reiniciando Scanner...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TabletScan;
