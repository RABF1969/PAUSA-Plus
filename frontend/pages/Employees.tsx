
import React from 'react';

const Employees: React.FC = () => {
  const employees = [
    { id: '1', reg: '#04521', name: 'Carlos Mendes', role: 'Operador I', sector: 'Logística', status: 'Ativo' },
    { id: '2', reg: '#03102', name: 'Ana Souza', role: 'Supervisora', sector: 'Atendimento', status: 'Ativo' },
    { id: '3', reg: '#05991', name: 'Roberto Lima', role: 'Operador II', sector: 'Produção', status: 'Inativo' },
    { id: '4', reg: '#06100', name: 'Júlia Pereira', role: 'Estagiária', sector: 'RH', status: 'Ativo' },
    { id: '5', reg: '#02230', name: 'Marcos Silva', role: 'Manutenção', sector: 'Serviços Gerais', status: 'Ativo' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Funcionários</h1>
          <p className="text-gray-500 text-base font-medium">Gerencie a equipe operacional e as credenciais de acesso.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span> Novo Funcionário
        </button>
      </header>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e5ece9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <span className="absolute left-3 top-2.5 text-gray-400 material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Buscar por nome ou matrícula..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
           </div>
           <div className="flex gap-2">
             <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><span className="material-symbols-outlined">filter_list</span></button>
             <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><span className="material-symbols-outlined">sort</span></button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Matrícula</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Setor</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/${emp.id}/100`} className="size-10 rounded-full" alt="" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{emp.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{emp.reg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{emp.sector}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      emp.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><span className="material-symbols-outlined text-lg">block</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
