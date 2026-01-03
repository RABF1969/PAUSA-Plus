import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 8) {
            setError('A nova senha deve ter no mínimo 8 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await changePassword(currentPassword, newPassword);
            
            // Clear flag and redirect
            localStorage.removeItem('must_change_password');
            alert('Senha alterada com sucesso!');
            navigate('/');
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'ChangePassword');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-8 max-w-md w-full shadow-xl">
                <div className="text-center mb-8">
                    <div className="size-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)]">Troca Obrigatória</h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Por segurança, você deve alterar sua senha temporária para continuar.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-2">
                        <p className="text-red-600 dark:text-red-400 text-sm font-bold text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                            Senha Atual (Temporária)
                        </label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full h-12 px-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-[var(--text-primary)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-12 px-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-[var(--text-primary)]"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                            Confirmar Nova Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 px-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-[var(--text-primary)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : 'Alterar Senha e Entrar'}
                        {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
