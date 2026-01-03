
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import ThemeToggle from './ThemeToggle';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get real user data from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { name: 'Usuário', role: 'Acesso' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/employees', icon: 'groups', label: 'Funcionários' },
    ...(user.role === 'admin' ? [{ path: '/users', icon: 'badge', label: 'Usuários' }] : []),
    { path: '/reports', icon: 'bar_chart', label: 'Relatórios' },
    { path: '/settings', icon: 'settings', label: 'Configurações' },
  ];

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="size-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <span className="material-symbols-outlined filled">timer</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">PAUSA+</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Enterprise</p>
        </div>
      </div>

      <div className="mb-6 px-2">
        <ThemeToggle />
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${isActive
                ? 'bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold border-emerald-600 dark:border-emerald-500/20 ring-1 ring-emerald-600/15 dark:ring-emerald-500/20'
                : 'border-transparent text-slate-800 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-700 dark:hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled text-emerald-800 dark:text-emerald-200' : 'text-slate-600 dark:text-white/50 group-hover:text-emerald-700 dark:group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        {/* Prototype Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => window.location.hash = '#/'}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!location.pathname.startsWith('/kiosk')
              ? 'bg-black text-white shadow-lg shadow-gray-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
          >
            Web Admin
          </button>
          <button
            onClick={() => window.location.hash = '#/kiosk/login'}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname.startsWith('/kiosk')
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
              : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
          >
            Kiosk
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&bold=true`}
              className="size-10 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm"
              alt="User"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-white/85">{user.name}</p>
              <p className="text-[10px] text-slate-600 dark:text-white/50 truncate uppercase tracking-tighter">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex size-8 items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
              title="Sair"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
