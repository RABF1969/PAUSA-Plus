import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MasterLayoutProps {
    children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

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

    const closeMobileNav = () => {
        setIsMobileNavOpen(false);
    };

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''}`}>
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-blue-100 selection:text-blue-900 antialiased flex flex-col">
                {/* Header */}
                <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link to="/alfabiz" className="flex items-center gap-2 md:gap-3 group">
                            <div className="size-8 md:size-10 flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                                <img 
                                    src="/src/assets/alfabiz-logo.png" 
                                    alt="Alfabiz" 
                                    className="object-contain size-6 md:size-8"
                                    onError={(e) => {
                                        // Fallback if asset is missing in some environments
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<span class="material-symbols-outlined text-blue-600">admin_panel_settings</span>');
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base md:text-lg font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">
                                    Alfabiz <span className="text-blue-600">Control</span>
                                </h1>
                                <p className="text-[9px] md:text-[10px] text-[var(--text-secondary)] font-bold tracking-widest uppercase">Master Panel</p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        <Link 
                            to="/alfabiz"
                            onClick={closeMobileNav}
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
                            onClick={closeMobileNav}
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
                            onClick={closeMobileNav}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz/plans') 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-[var(--text-primary)]'
                            }`}
                        >
                            Planos
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        className="md:hidden size-10 flex items-center justify-center rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
                        aria-label="Menu"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isMobileNavOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <div className="hidden md:flex items-center gap-4">
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

                {/* Mobile Navigation Dropdown */}
                {isMobileNavOpen && (
                    <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Link 
                            to="/alfabiz"
                            onClick={closeMobileNav}
                            className={`block px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz') 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            Visão Geral
                        </Link>
                        <Link 
                            to="/alfabiz/companies"
                            onClick={closeMobileNav}
                            className={`block px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz/companies') 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            Empresas
                        </Link>
                        <Link 
                            to="/alfabiz/plans"
                            onClick={closeMobileNav}
                            className={`block px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                isActive('/alfabiz/plans') 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            Planos
                        </Link>
                        <div className="pt-2 border-t border-[var(--border-primary)] flex items-center justify-between">
                            <button 
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {theme === 'light' ? 'dark_mode' : 'light_mode'}
                                </span>
                                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 w-full overflow-y-auto">
                    {children}
                </div>

                {/* Fixed Footer */}
                <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-4 md:px-8 py-4 text-center">
                    <p className="text-xs font-bold text-[var(--text-secondary)] tracking-widest uppercase">
                        © {new Date().getFullYear()} <span className="text-blue-600">Alfabiz Soluções</span> — Todos os direitos reservados.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default MasterLayout;
