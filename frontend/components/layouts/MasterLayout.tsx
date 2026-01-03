import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MasterLayoutProps {
    children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Isolated Master Theme State
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('master_theme');
        return (saved as 'light' | 'dark') || 'light';
    });

    React.useEffect(() => {
        localStorage.setItem('master_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const isActive = (path: string) => {
        if (path === '/alfabiz' && location.pathname === '/alfabiz') return true;
        if (path !== '/alfabiz' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = () => {
        localStorage.removeItem('master_token');
        navigate('/alfabiz/login');
    };

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''}`}>
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-blue-100 selection:text-blue-900 antialiased flex flex-col">
                {/* Header */}
                <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link to="/alfabiz" className="flex items-center gap-3 group">
                            <div className="size-10 flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                                <img 
                                    src="/src/assets/alfabiz-logo.png" 
                                    alt="Alfabiz" 
                                    className="object-contain size-8"
                                    onError={(e) => {
                                        // Fallback if asset is missing in some environments
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<span class="material-symbols-outlined text-blue-600">admin_panel_settings</span>');
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">
                                    Alfabiz <span className="text-blue-600">Control</span>
                                </h1>
                                <p className="text-[10px] text-[var(--text-secondary)] font-bold tracking-widest uppercase">Master Panel</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        <Link 
                            to="/alfabiz"
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz') 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-[var(--text-primary)]'
                            }`}
                        >
                            Visão Geral
                        </Link>
                        <Link 
                            to="/alfabiz/companies"
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz/companies') 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-[var(--text-primary)]'
                            }`}
                        >
                            Empresas
                        </Link>
                        <Link 
                            to="/alfabiz/plans"
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz/plans') 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-[var(--text-primary)]'
                            }`}
                        >
                            Planos
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="size-10 flex items-center justify-center rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
                            title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {theme === 'light' ? 'dark_mode' : 'light_mode'}
                            </span>
                        </button>

                        <div className="h-6 w-px bg-[var(--border-primary)]"></div>

                        <button 
                            onClick={handleLogout}
                            className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                        >
                            Sair
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-y-auto">
                    {children}
                </div>

                {/* Fixed Footer */}
                <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-8 py-4 text-center">
                    <p className="text-xs font-bold text-[var(--text-secondary)] tracking-widest uppercase">
                        © {new Date().getFullYear()} <span className="text-blue-600">Alfabiz Soluções</span> — Todos os direitos reservados.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default MasterLayout;
