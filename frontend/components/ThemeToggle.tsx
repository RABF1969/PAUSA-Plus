import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-emerald-500/50 group w-full"
            title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
            <div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] filled">
                    {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
            </div>
            <div className="flex-1 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-1">Painel</p>
                <p className="text-sm font-bold text-[var(--text-primary)] leading-none">
                    {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                </p>
            </div>
        </button>
    );
};

export default ThemeToggle;
