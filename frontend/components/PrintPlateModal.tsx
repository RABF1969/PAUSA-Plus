import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface PrintPlateModalProps {
  plate: {
    name: string;
    code: string;
    company_name?: string;
  };
  onClose: () => void;
}

const PrintPlateModal: React.FC<PrintPlateModalProps> = ({ plate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container for the modal (hidden during print via CSS) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">print</span>
            Imprimir Placa
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body - Scrollable content if needed */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950/30 flex justify-center">
            
            {/* The Badge/Card to be Printed */}
            <div id="print-area" className="bg-white text-black p-8 rounded-2xl shadow-sm border border-slate-200 w-[300px] flex flex-col items-center text-center">
                
                {/* Header of the Card */}
                <div className="mb-6 border-b-2 border-black w-full pb-2">
                     <p className="text-xs font-bold uppercase tracking-[0.3em]">PAUSA+</p>
                </div>

                {/* QR Code */}
                <div className="mb-4">
                    <QRCodeCanvas
                        value={plate.code}
                        size={200}
                        level={"H"}
                        includeMargin={false}
                    />
                </div>

                {/* Plate Info */}
                <div className="space-y-1 mb-6">
                    <h2 className="text-2xl font-black leading-none">{plate.code}</h2>
                    <p className="text-sm font-medium text-slate-600">{plate.name}</p>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                     <p className="text-[10px] font-mono text-slate-400">Escaneie para iniciar/parar pausa</p>
                </div>
            </div>

        </div>

        {/* Modal Footer - Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">print</span>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPlateModal;
