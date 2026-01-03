import React, { useEffect, useState } from 'react';
import { listUsers, updateUser } from '../services/api';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';
import CreateUserModal from '../components/CreateUserModal';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'gestor' | 'rh';
    active: boolean;
    must_change_password: boolean;
    created_at: string;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await listUsers();
            setUsers(data);
            setError('');
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'Users - Load');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await updateUser(user.id, { active: !user.active });
            await fetchUsers();
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            alert(message);
            logErrorInDev(err, 'Users - Toggle Active');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const config = {
            admin: { label: 'Admin', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
            gestor: { label: 'Gestor', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
            rh: { label: 'RH', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
        };
        const badge = config[role as keyof typeof config] || config.gestor;
        return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${badge.color}`}>{badge.label}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-[var(--text-secondary)] font-bold animate-pulse">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Usuários</h1>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">
                        Gerencie os usuários da sua empresa
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Usuário
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">Todas as funções</option>
                    <option value="admin">Admin</option>
                    <option value="gestor">Gestor</option>
                    <option value="rh">RH</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-accent)]">
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Usuário</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Função</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-[var(--text-secondary)] font-medium">
                                            {searchTerm || roleFilter !== 'all' ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[var(--bg-accent)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)]">{user.name}</p>
                                                    {user.must_change_password && (
                                                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                                            Deve trocar senha
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">{user.email}</td>
                                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${
                                                user.active 
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {user.active ? 'check_circle' : 'block'}
                                                </span>
                                                {user.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleActive(user)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                                    user.active
                                                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
                                                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                                                }`}
                                            >
                                                {user.active ? 'Desativar' : 'Ativar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <CreateUserModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};

export default Users;
