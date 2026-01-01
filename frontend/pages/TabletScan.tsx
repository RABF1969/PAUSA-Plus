import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listBreakTypes, startBreak, endBreak, getActiveBreakByBadge, BreakType } from '../services/api';

const TabletScan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badgeCodeFromLogin = (location.state as any)?.badgeCode;

  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakType, setSelectedBreakType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [confirmation, setConfirmation] = useState<{
    type: 'start' | 'end';
    name: string;
    duration?: number;
    maxMinutes?: number;
  } | null>(null);

  const isProcessingRef = useRef(false);

  // Load break types on mount and every 30 seconds
  const loadBreakTypes = async () => {
    try {
      const types = await listBreakTypes();
      setBreakTypes(types);
      if (types.length > 0 && !selectedBreakType) {
        const firstAvailable = types.find(t => t.active_count < t.capacity) || types[0];
        setSelectedBreakType(firstAvailable.id);
      }
    } catch (err: any) {
      setError('Erro ao carregar configurações');
    }
  };

  useEffect(() => {
    loadBreakTypes();
    const interval = setInterval(loadBreakTypes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Auto-start simulation (if coming from Login)
  useEffect(() => {
    if (badgeCodeFromLogin && selectedBreakType && !loading && !confirmation && !error) {
      const timer = setTimeout(() => {
        handleToggleAction(badgeCodeFromLogin);
      }, 2000); // Wait 2s before auto-triggering
      return () => clearTimeout(timer);
    }
  }, [badgeCodeFromLogin, selectedBreakType]);

  // Handle Auto-reset after 3s
  useEffect(() => {
    if (confirmation || error) {
      const timer = setTimeout(() => {
        setConfirmation(null);
        setError('');
        // Clean navigation state if we came from login to allow fresh scans
        if (badgeCodeFromLogin) {
          navigate('/kiosk/scan', { replace: true, state: {} });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmation, error]);

  const handleToggleAction = async (badge_code: string) => {
    if (isProcessingRef.current) return;
    if (!selectedBreakType) {
      setError('Selecione um tipo de pausa');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setError('');

    try {
      // Step A: Check Active Break
      const activeBreak = await getActiveBreakByBadge(badge_code);

      if (activeBreak) {
        // Step B: End Break
        const result = await endBreak({ break_id: activeBreak.id });
        setConfirmation({
          type: 'end',
          name: result.employee_name,
          duration: result.duration_minutes
        });
      } else {
        // Step C: Start Break
        const result = await startBreak(badge_code, selectedBreakType);
        setConfirmation({
          type: 'start',
          name: result.employee_name,
          maxMinutes: result.max_minutes
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro na operação';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
      setTestBadgeCode(''); // Clear test field
    }
  };

  const [testBadgeCode, setTestBadgeCode] = useState('');
  const [isTestMode] = useState(() => {
    try {
      return !!((import.meta as any).env?.DEV && (import.meta as any).env?.VITE_KIOSK_TEST_MODE === 'true');
    } catch {
      return false;
    }
  });

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testBadgeCode) return;
    handleToggleAction(testBadgeCode.padStart(4, '0'));
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center p-8 text-white font-sans overflow-hidden">
      <div className="max-w-xl w-full text-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter leading-none">ESCANEIE O QR CODE</h1>
          <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px]">Modo Tablet Compartilhado</p>
        </header>

        {/* Break Selection */}
        <div className="max-w-xs mx-auto w-full space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Selecione o tipo de pausa</label>
          <select
            value={selectedBreakType}
            onChange={(e) => setSelectedBreakType(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold appearance-none transition-all focus:border-emerald-500/50 outline-none"
            disabled={loading}
          >
            {breakTypes.map(t => (
              <option key={t.id} value={t.id} className="bg-gray-900" disabled={t.active_count >= t.capacity}>
                {t.name} ({t.active_count}/{t.capacity}) — {t.max_minutes}m
              </option>
            ))}
          </select>
        </div>

        {/* Viewfinder */}
        <div className="relative size-72 mx-auto">
          <div className="absolute inset-0 border-[3px] border-emerald-500/10 rounded-[56px]"></div>
          {/* Corners */}
          <div className="absolute -top-1 -left-1 size-20 border-t-[10px] border-l-[10px] border-emerald-500 rounded-tl-[56px]"></div>
          <div className="absolute -top-1 -right-1 size-20 border-t-[10px] border-r-[10px] border-emerald-500 rounded-tr-[56px]"></div>
          <div className="absolute -bottom-1 -left-1 size-20 border-b-[10px] border-l-[10px] border-emerald-500 rounded-bl-[56px]"></div>
          <div className="absolute -bottom-1 -right-1 size-20 border-b-[10px] border-r-[10px] border-emerald-500 rounded-br-[56px]"></div>

          <div className="absolute inset-8 flex items-center justify-center opacity-10">
            <span className="material-symbols-outlined text-[100px]">qr_code_scanner</span>
          </div>

          {!confirmation && !error && (
            <div className={`absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_emerald-500] scanner-line ${loading ? 'opacity-100' : 'opacity-40'}`}></div>
          )}
        </div>

        {/* Scanning Indicator */}
        <div className="flex justify-center h-8">
          {loading ? (
            <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="size-1.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Processando...</span>
            </div>
          ) : (
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">Aguardando leitura...</p>
          )}
        </div>

        {/* Test UI */}
        {isTestMode && (
          <form onSubmit={handleManualScan} className="max-w-xs mx-auto w-full flex gap-2">
            <input
              type="text"
              placeholder="Digite a matrícula"
              value={testBadgeCode}
              onChange={(e) => setTestBadgeCode(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-emerald-500/50 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !testBadgeCode}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-20 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Simular
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/kiosk/login')}
          className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto pt-8"
        >
          <span className="material-symbols-outlined text-sm">close</span> Sair do Sistema
        </button>
      </div>

      {/* Confirmation Overlay */}
      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f0d]/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="text-center space-y-10 animate-in zoom-in duration-500 max-w-sm px-6">
            <div className={`mx-auto size-32 rounded-full flex items-center justify-center ${confirmation.type === 'start' ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'bg-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.4)]'}`}>
              <span className="material-symbols-outlined text-6xl text-white">
                {confirmation.type === 'start' ? 'play_arrow' : 'stop'}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className={`text-6xl font-black tracking-tighter ${confirmation.type === 'start' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {confirmation.type === 'start' ? 'BOM DESCANSO!' : 'BOM TRABALHO!'}
              </h2>
              <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                <p className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{confirmation.name}</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                  {confirmation.type === 'start' ? `Limite: ${confirmation.maxMinutes} min` : `Duração: ${confirmation.duration} min`}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Retornando em 3s...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
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
    </div>
  );
};

export default TabletScan;
