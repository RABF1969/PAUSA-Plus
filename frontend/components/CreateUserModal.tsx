import React, { useState } from 'react';
import { createUser } from '../services/api';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';

interface CreateUserModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('gestor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdUser, setCreatedUser] = useState<{ email: string, tempPassword: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await createUser({ name, email, role });
            // API returns { user: {...}, tempPassword: "..." }
            setCreatedUser({
                email: response.user.email,
                tempPassword: response.tempPassword
            });
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'CreateUserModal');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (createdUser?.tempPassword) {
            navigator.clipboard.writeText(createdUser.tempPassword);
            alert('Senha copiada para a área de transferência!');
        }
    };

    const handleClose = () => {
        onSuccess(); // Refresh parent list
    };

    if (createdUser) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Usuário Criado!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            O usuário deverá utilizar esta senha temporária no primeiro acesso.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-100 dark:border-slate-700">
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white select-all">{createdUser.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Senha Temporária</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 select-all">
                                    {createdUser.tempPassword}
                                </code>
                                <button
                                    onClick={handleCopyPassword}
                                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-gray-500 hover:text-emerald-600"
                                    title="Copiar senha"
                                >
                                    <span className="material-symbols-outlined">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                Esta senha não será exibida novamente. Copie-a agora e envie para o usuário.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Novo Usuário</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Ex: João Silva"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Email Corporativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="joao@empresa.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Função
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('gestor')}
                                className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                                    role === 'gestor'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                                }`}
                            >
                                Gestor
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('rh')}
                                className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                                    role === 'rh'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                                }`}
                            >
                                RH
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                                    role === 'admin'
                                        ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                                }`}
                            >
                                Admin
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            {role === 'admin' ? 'Acesso total ao sistema e gestão de usuários.' :
                             role === 'gestor' ? 'Gestão operacional de pausas e relatórios.' :
                             'Visualização de relatórios e controle de funcionários.'}
                        </p>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Criando...
                                </>
                            ) : (
                                'Criar Usuário'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
