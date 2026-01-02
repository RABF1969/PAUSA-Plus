import React, { useState } from 'react';
import CompanySettings from '../components/CompanySettings';
import PlatesSettings from '../components/PlatesSettings';
import BreakTypesSettings from '../components/BreakTypesSettings';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'plates' | 'types'>('company');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Painel de Controle</p>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Configurações</h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Gerencie empresa, placas e regras.</p>
        </div>
      </header>

      <div className="flex gap-2 border-b border-[var(--border-primary)] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-6 py-3 font-bold text-sm tracking-wide rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'company'
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">business</span>
          Empresa
        </button>
        <button
          onClick={() => setActiveTab('plates')}
          className={`px-6 py-3 font-bold text-sm tracking-wide rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'plates'
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">qr_code_2</span>
          Placas
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-6 py-3 font-bold text-sm tracking-wide rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'types'
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">timer</span>
          Tipos de Pausa
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'company' && <CompanySettings />}
        {activeTab === 'plates' && <PlatesSettings />}
        {activeTab === 'types' && <BreakTypesSettings />}
      </div>
    </div>
  );
};

export default Settings;
