import React, { useState, useEffect } from 'react';
import { BreakType } from '../services/api';

interface BreakTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    breakType?: BreakType | null;
}

const BreakTypeModal: React.FC<BreakTypeModalProps> = ({ isOpen, onClose, onSave, breakType }) => {
    const [formData, setFormData] = useState({
        name: '',
        max_minutes: 15,
        capacity: 1,
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (breakType) {
            setFormData({
                name: breakType.name,
                max_minutes: breakType.max_minutes,
                capacity: breakType.capacity,
                active: breakType.active
            });
        } else {
            setFormData({
                name: '',
                max_minutes: 15,
                capacity: 1,
                active: true
            });
        }
        setError('');
    }, [breakType, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações Front-end
        if (!formData.name.trim()) return setError('Nome é obrigatório');
        if (formData.max_minutes < 1) return setError('Tempo máximo deve ser pelo menos 1 minuto');
        if (formData.capacity < 1) return setError('Capacidade deve ser pelo menos 1');

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao salvar configuração');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-900">
                        {breakType ? 'Editar Pausa' : 'Nova Pausa'}
                    </h2>
                    <button onClick={onClose} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Pausa</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all"
                            placeholder="Ex: Lanche da Tarde"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Tempo (Min)</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.max_minutes}
                                onChange={(e) => setFormData({ ...formData, max_minutes: parseInt(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Capacidade</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {breakType && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="size-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="active" className="text-sm font-bold text-gray-700 select-none">Tipo de Pausa Ativo</label>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all font-sans"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.2)] disabled:opacity-50 transition-all font-sans"
                        >
                            {loading ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BreakTypeModal;
