import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { OperationalPlate, listPlates, createPlate, togglePlateActive, listBreakTypes, BreakType } from '../services/api';
import MultiSelect from './MultiSelect';
import PrintPlateModal from './PrintPlateModal';

const PlatesSettings: React.FC = () => {
  const [plates, setPlates] = useState<OperationalPlate[]>([]);
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakTypeIds, setSelectedBreakTypeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlateName, setNewPlateName] = useState('');
  const [createdPlate, setCreatedPlate] = useState<OperationalPlate | null>(null);
  const [printingPlate, setPrintingPlate] = useState<OperationalPlate | null>(null);

  useEffect(() => {
    loadPlates();
    loadBreakTypes();
  }, []);

  const loadPlates = async () => {
    try {
      setLoading(true);
      const data = await listPlates();
      setPlates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBreakTypes = async () => {
    try {
      const data = await listBreakTypes(false);
      setBreakTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const plate = await createPlate(newPlateName, selectedBreakTypeIds);
      setCreatedPlate(plate);
      setNewPlateName('');
      setSelectedBreakTypeIds([]);
      loadPlates();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar placa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (plate: OperationalPlate) => {
    try {
      await togglePlateActive(plate.id, !plate.active);
      loadPlates();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${createdPlate?.code}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCreatedPlate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-6 rounded-[32px] border border-[var(--border-primary)]">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Placas Operacionais</h2>
          <p className="text-sm text-[var(--text-secondary)]">Gerencie os pontos de QR Code da fábrica</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Nova Placa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plates.map((plate) => (
          <div key={plate.id} className={`bg-[var(--bg-secondary)] p-6 rounded-2xl border ${plate.active ? 'border-[var(--border-primary)]' : 'border-red-200 dark:border-red-900/30 opacity-70'} hover:border-emerald-500/50 transition-all group`}>
            <div className="flex justify-between items-start mb-4">
              <div className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPrintingPlate(plate)}
                  className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center"
                  title="Imprimir"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                </button>
                <button
                  onClick={() => handleToggle(plate)}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    plate.active 
                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {plate.active ? 'Ativa' : 'Inativa'}
                </button>
              </div>
            </div>
            <h3 className="font-black text-lg text-[var(--text-primary)] mb-1">{plate.name}</h3>
            <p className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-primary)] inline-block px-2 py-1 rounded-md border border-[var(--border-primary)]">
              {plate.code}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-secondary)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-primary)] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]">
              <h3 className="font-black text-lg text-[var(--text-primary)]">
                {createdPlate ? 'Placa Criada!' : 'Nova Placa Operacional'}
              </h3>
              <button onClick={closeModal} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8">
              {createdPlate ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCodeCanvas
                      id="qr-gen"
                      value={createdPlate.code} // Kiosk will read this code
                      size={200}
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-2xl text-[var(--text-primary)]">{createdPlate.code}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{createdPlate.name}</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={downloadQR}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                    >
                      Baixar PNG
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ) : (

                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                      Nome da Placa / Local
                    </label>
                    <input
                      type="text"
                      value={newPlateName}
                      onChange={(e) => setNewPlateName(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                      placeholder="Ex: Linha de Montagem A - Posto 1"
                      required
                      autoFocus
                    />
                  </div>

                  <MultiSelect
                    label="Tipos de Pausa Permitidos"
                    options={breakTypes.map(bt => ({ id: bt.id, label: bt.name }))}
                    selectedIds={selectedBreakTypeIds}
                    onChange={setSelectedBreakTypeIds}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Gerando...' : 'Gerar QR Code'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {printingPlate && (
        <PrintPlateModal
          plate={printingPlate}
          onClose={() => setPrintingPlate(null)}
        />
      )}
    </div>
  );
};

export default PlatesSettings;
