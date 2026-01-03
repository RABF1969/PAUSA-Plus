import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MasterLayoutProps {
    children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">admin_panel_settings</span>
                        Alfabiz Control
                    </h1>
                </div>
                <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                     <Link 
                        to="/alfabiz"
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            isActive('/alfabiz') 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Visão Geral
                    </Link>
                    <Link 
                        to="/alfabiz/companies"
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            isActive('/alfabiz/companies') 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Empresas
                    </Link>
                    <Link 
                        to="/alfabiz/plans"
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            isActive('/alfabiz/plans') 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Planos
                    </Link>
                </nav>
                <div>
                     <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                     >
                        Sair
                     </button>
                </div>
            </header>

            {/* Content */}
            <div className="w-full text-slate-900">
                {children}
            </div>
        </div>
    );
};

export default MasterLayout;
