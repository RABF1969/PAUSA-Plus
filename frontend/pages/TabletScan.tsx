
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TabletScan: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Simulate successful scan after 3 seconds
    const timer = setTimeout(() => {
      setIsScanning(false);
      navigate('/kiosk/active');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#111815] flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Aproxime o QR Code</h1>
          <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">Escaneando Placa Operacional</p>
        </div>

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
             <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_emerald-400] scanner-line"></div>
          </div>
          
          {isScanning && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest">Buscando Sinal...</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-20">
          <button 
            onClick={() => navigate('/kiosk/login')}
            className="text-gray-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined">close</span> Cancelar Operação
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabletScan;
