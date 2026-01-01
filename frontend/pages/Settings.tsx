import React, { useState, useEffect } from 'react';
import { listBreakTypes, createBreakType, updateBreakType, BreakType } from '../services/api';
import BreakTypeModal from '../components/BreakTypeModal';

const Settings: React.FC = () => {
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<BreakType | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await listBreakTypes(true); // Include inactive
      setBreakTypes(data);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (type: BreakType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (editingType) {
      await updateBreakType(editingType.id, formData);
    } else {
      await createBreakType(formData);
    }
    await fetchData();
  };

  const toggleStatus = async (type: BreakType) => {
    try {
      await updateBreakType(type.id, { active: !type.active });
      await fetchData();
    } catch (err: any) {
      // Handle 409 and other error messages
      const msg = err.response?.data?.error || 'Erro ao alterar status';
      alert(msg);
    }
  };

  if (loading && breakTypes.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-vh-50">
        <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end bg-white/50 backdrop-blur-md p-8 rounded-[40px] border border-white">
        <div className="space-y-2">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Painel de Controle</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Configurações</h1>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Tipo de Pausa
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined">warning</span>
          {error}
        </div>
      )}

      <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pausa</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Limite (Min)</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Capacidade</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {breakTypes.map((type) => (
                <tr key={type.id} className={`hover:bg-gray-50/50 transition-colors ${!type.active ? 'opacity-60 bg-gray-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900">{type.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">UUID: {type.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black">
                      {type.max_minutes} min
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-600">
                    {type.capacity} vaga(s)
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => toggleStatus(type)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type.active
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                      {type.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="size-11 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-90"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BreakTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        breakType={editingType}
      />
    </div>
  );
};

export default Settings;
