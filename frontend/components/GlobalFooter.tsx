import React from 'react';

const GlobalFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 text-center mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity duration-300">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Alfabiz Soluções
        </p>
        <span className="hidden md:block text-[10px] text-[var(--border-primary)]">•</span>
        <p className="text-[10px] font-medium text-[var(--text-secondary)]">
          PAUSA+ Enterprise
        </p>
      </div>
    </footer>
  );
};

export default GlobalFooter;
