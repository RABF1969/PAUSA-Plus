
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-500 text-base font-medium">Defina tempos recomendados, limites de concorrência e políticas de privacidade.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timing Rules */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5ece9] shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <span className="material-symbols-outlined">timer</span>
             </div>
             <h3 className="text-lg font-extrabold">Regras de Tempo</h3>
          </div>

          <div className="space-y-6">
            {/* WC */}
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">wc</span> Pausa Banheiro
                </h4>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">Cat: WC</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recomendado (min)</label>
                  <input type="number" defaultValue={5} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Máximo (Alerta)</label>
                  <input type="number" defaultValue={10} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            {/* Lanche */}
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">coffee</span> Pausa Lanche
                </h4>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase">Cat: Lanche</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recomendado (min)</label>
                  <input type="number" defaultValue={15} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Máximo (Alerta)</label>
                  <input type="number" defaultValue={20} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            {/* Quick Rest / Descanso Rápido */}
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">bolt</span> Descanso Rápido
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase">Cat: Descanso</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recomendado (min)</label>
                  <input type="number" defaultValue={10} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Máximo (Alerta)</label>
                  <input type="number" defaultValue={15} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            {/* Customer Service / Atendimento ao Cliente */}
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">support_agent</span> Atendimento ao Cliente
                </h4>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black uppercase">Cat: Atendimento</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recomendado (min)</label>
                  <input type="number" defaultValue={20} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Máximo (Alerta)</label>
                  <input type="number" defaultValue={40} className="w-full bg-white border-gray-200 rounded-xl text-sm font-bold focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Flow */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5ece9] shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
               <span className="material-symbols-outlined">sync_alt</span>
             </div>
             <h3 className="text-lg font-extrabold">Fluxo e Concorrência</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-gray-900">Simultaneidade Geral</p>
                <p className="text-xs text-gray-500">Limite de pessoas ao mesmo tempo</p>
              </div>
              <input type="number" defaultValue={3} className="w-20 bg-white border-gray-200 rounded-xl text-sm font-bold text-center focus:ring-emerald-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-gray-900">Bloqueio de Pausa</p>
                <p className="text-xs text-gray-500">Impedir saída se atingir limite</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-gray-50">
             <div className="flex items-center gap-3 mb-4">
               <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined">verified_user</span>
               </div>
               <h3 className="text-lg font-extrabold">Privacidade (LGPD)</h3>
             </div>
             <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Aviso de Consentimento</label>
                  <textarea 
                    rows={4}
                    defaultValue="Ao utilizar este sistema, você concorda que seus horários de pausa serão registrados para fins de gestão operacional e segurança, conforme as políticas internas da empresa."
                    className="w-full bg-white border-gray-200 rounded-xl text-sm font-medium focus:ring-emerald-500"
                  />
               </div>
               <div className="flex items-center justify-between p-4 bg-purple-50/30 border border-purple-100 rounded-2xl">
                 <div className="flex gap-3">
                   <span className="material-symbols-outlined text-purple-600">history_edu</span>
                   <div>
                     <p className="text-sm font-bold text-gray-900">Retenção de Logs</p>
                     <p className="text-xs text-gray-500">Anonimizar dados após o período</p>
                   </div>
                 </div>
                 <select className="bg-white border-none text-sm font-bold rounded-xl focus:ring-2 focus:ring-purple-500 cursor-pointer">
                    <option>30 dias</option>
                    <option selected>90 dias</option>
                    <option>1 ano</option>
                 </select>
               </div>
             </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancelar</button>
        <button className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all">Salvar Alterações</button>
      </div>
    </div>
  );
};

export default Settings;
