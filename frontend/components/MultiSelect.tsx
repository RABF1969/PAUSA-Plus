import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedIds, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(prev => prev !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const getLabel = () => {
    if (selectedIds.length === 0) return 'Selecione...';
    if (selectedIds.length === 1) {
        const option = options.find(o => o.id === selectedIds[0]);
        return option ? option.label : '1 selecionado';
    }
    return `${selectedIds.length} selecionados`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
            {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold cursor-pointer flex justify-between items-center"
      >
        <span>{getLabel()}</span>
        <span className="material-symbols-outlined text-sm">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className="px-4 py-3 hover:bg-[var(--bg-accent)] cursor-pointer flex items-center gap-3"
            >
              <div className={`size-5 rounded border flex items-center justify-center transition-colors ${selectedIds.includes(option.id) ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--border-primary)]'}`}>
                {selectedIds.includes(option.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}
              </div>
              <span className="font-bold text-sm text-[var(--text-primary)]">{option.label}</span>
            </div>
          ))}
          {options.length === 0 && (
             <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum item disponível</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
