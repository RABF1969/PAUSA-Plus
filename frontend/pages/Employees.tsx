import React, { useState, useEffect } from 'react';
import { listEmployees, createEmployee, updateEmployee, setEmployeeActive, Employee } from '../services/api';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: ''
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await listEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFormError('');
    setFormData({ name: '', role: '' });
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditFormData({ name: emp.name, role: emp.role });
    setIsEditModalOpen(true);
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await createEmployee(formData);
      await fetchEmployees();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erro ao cadastrar funcionário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setFormLoading(true);
    setFormError('');

    try {
      await updateEmployee(editingEmployee.id, editFormData);
      await fetchEmployees();
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erro ao atualizar funcionário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (emp: Employee) => {
    const action = emp.active ? 'desativar' : 'reativar';
    const confirm = window.confirm(`Tem certeza que deseja ${action} o funcionário ${emp.name}? ${emp.active ? 'Ele não aparecerá no Kiosk.' : ''}`);

    if (!confirm) return;

    try {
      await setEmployeeActive(emp.id, !emp.active);
      await fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || `Erro ao ${action} funcionário`);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.badge_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && emp.active) ||
      (statusFilter === 'inactive' && !emp.active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Funcionários</h1>
          <p className="text-[var(--text-secondary)] text-base font-medium">Gerencie a equipe operacional e as credenciais de acesso.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> Novo Funcionário
        </button>
      </header>

      {/* Table Section */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <span className="absolute left-3 top-2.5 text-[var(--text-secondary)] material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-[var(--text-secondary)]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-[var(--text-primary)]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativos</option>
              <option value="inactive">Apenas Inativos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
                <th className="px-6 py-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Matrícula</th>
                <th className="px-6 py-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] font-medium">Carregando funcionários...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] font-medium">Nenhum funcionário encontrado.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={`group hover:bg-[var(--bg-accent)] transition-all ${!emp.active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${emp.active ? 'bg-emerald-100/80 text-emerald-900 ring-1 ring-emerald-200' : 'bg-slate-200 text-slate-900'}`}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{emp.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-[var(--text-secondary)]">{emp.badge_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] font-medium capitalize">{emp.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${emp.active ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-200 text-slate-700 border border-slate-300'
                        }`}>
                        {emp.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 text-[var(--text-secondary)]">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 hover:text-emerald-500 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleActive(emp)}
                          className={`p-1.5 rounded-lg transition-colors ${emp.active ? 'hover:text-red-500' : 'text-emerald-500 hover:text-emerald-600'}`}
                          title={emp.active ? 'Desativar' : 'Reativar'}
                        >
                          <span className="material-symbols-outlined text-lg">{emp.active ? 'block' : 'check_circle'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-secondary)] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border-primary)]">
            <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] leading-none">Novo Funcionário</h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-2">Cadastre um novo colaborador no sistema.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-10 rounded-full hover:bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: João Silva"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Cargo</label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="operador">Operador</option>
                    <option value="gestor">Gestor</option>
                    <option value="rh">RH</option>
                  </select>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">info</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-tight">
                    A matrícula (badge code) será gerada automaticamente pelo sistema após a confirmação.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  submit
                  disabled={formLoading}
                  className="flex-[2] py-4 bg-emerald-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? 'CADASTRANDO...' : 'CADASTRAR FUNCIONÁRIO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-secondary)] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border-primary)]">
            <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] leading-none">Editar Funcionário</h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-2">Atualize as informações do colaborador.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="size-10 rounded-full hover:bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Matrícula (Imutável)</label>
                  <input
                    type="text"
                    disabled
                    value={editingEmployee?.badge_code}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-secondary)] font-mono cursor-not-allowed opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Ex: João Silva"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Cargo</label>
                  <select
                    name="role"
                    required
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    <option value="operador">Operador</option>
                    <option value="gestor">Gestor</option>
                    <option value="rh">RH</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-[2] py-4 bg-emerald-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
