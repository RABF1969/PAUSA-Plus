import React, { useState, useEffect } from 'react';
import { Company, getMyCompany, createCompany, updateCompany } from '../services/api';

const CompanySettings: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await getMyCompany();
      setCompany(data);
      setName(data.name);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Erro ao carregar empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await createCompany(name);
      setCompany(data);
      setName(data.name);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      setLoading(true);
      const data = await updateCompany(company.id, name);
      setCompany(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar empresa');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !company && !name) { // only show full loading string if absolutely nothing loaded
    return <div className="p-8 text-center text-slate-500 animate-pulse">Carregando...</div>;
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-primary)] shadow-sm p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-emerald-500 text-3xl">business</span>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Dados da Empresa</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {company && !isEditing ? (
        <div className="space-y-6">
          <div className="p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] flex justify-between items-center group">
            <div>
              <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2">
                Nome da Empresa
              </label>
              <p className="text-xl font-bold text-[var(--text-primary)]">{company.name}</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-[var(--text-secondary)] hover:text-emerald-500"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2">
              ID do Sistema
            </label>
            <p className="text-sm font-mono text-[var(--text-secondary)]">{company.id}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={company ? handleUpdate : handleCreate} className="space-y-6">
          {!company && (
            <p className="text-[var(--text-secondary)] text-sm">
              Sua conta ainda não está vinculada a uma empresa. Cadastre abaixo:
            </p>
          )}
          
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
              placeholder="Ex: Minha Indústria Ltda"
              required
            />
          </div>
          
          <div className="flex gap-4">
             {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(company?.name || '');
                  }}
                  className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest py-4 rounded-xl transition-all"
                >
                  Cancelar
                </button>
             )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (company ? 'Salvar Alterações' : 'Cadastrar Empresa')}
              </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanySettings;
