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
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Painel de Controle</p>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Configurações</h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Gerencie as regras de negócio e tipos de pausa.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Tipo de Pausa
        </button>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 p-6 rounded-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined">warning</span>
          {error}
        </div>
      )}

      <div className="bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-primary)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
                <th className="px-8 py-6 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Pausa</th>
                <th className="px-8 py-6 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-center">Limite (Min)</th>
                <th className="px-8 py-6 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Capacidade</th>
                <th className="px-8 py-6 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {breakTypes.map((type) => (
                <tr key={type.id} className={`hover:bg-[var(--bg-accent)] transition-colors ${!type.active ? 'opacity-60 bg-[var(--bg-accent)]' : ''}`}>
                  <td className="px-8 py-6">
                    <p className="font-black text-[var(--text-primary)]">{type.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">UUID: {type.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className="inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-black text-orange-600 dark:text-orange-400 dark:border dark:border-orange-900/50 shadow-sm"
                      style={{ backgroundColor: 'var(--badge-bg, #ffffff)' }}
                    >
                      {type.max_minutes} min
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-[var(--text-secondary)]">
                    {type.capacity} vaga(s)
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => toggleStatus(type)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-accent)]'
                        }`}
                    >
                      {type.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="size-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-90"
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
