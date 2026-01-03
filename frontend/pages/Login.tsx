import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { getApiErrorMessage, logErrorInDev } from '../utils/getApiErrorMessage';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login(email, password);
            
            // Store user and token
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Check for mandatory password change
            const user = response.user as any;
            if (user.must_change_password) {
                localStorage.setItem('must_change_password', 'true');
                navigate('/change-password');
            } else {
                localStorage.removeItem('must_change_password');
                // Redirect based on role
                if (user.role === 'master') {
                    navigate('/master/companies');
                } else {
                    navigate('/');
                }
            }
        } catch (err: any) {
            const { message } = getApiErrorMessage(err);
            setError(message);
            logErrorInDev(err, 'Login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-8 text-[var(--text-primary)] font-sans">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="size-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-4xl">lock</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">PAUSA+ Dashboard</h1>
                    <p className="text-[var(--text-secondary)] font-medium">Acesso restrito para Gestores e RH</p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-[var(--bg-secondary)] p-8 rounded-[32px] border border-[var(--border-primary)] backdrop-blur-xl shadow-xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">E-mail Corporativo</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--text-secondary)]"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--text-secondary)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'AUTENTICANDO...' : 'ENTRAR NO DASHBOARD'}
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-[var(--text-secondary)]">
                            Problemas no acesso? <span className="text-emerald-500 font-bold cursor-pointer">Contatar TI</span>
                        </p>
                    </div>
                </form>

                <div className="pt-8 text-center text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest">
                    Pausa SaaS © 2026 • v1.0.0
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
};

export default Login;
