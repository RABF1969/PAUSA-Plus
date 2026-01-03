
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import masterApi from '../../services/masterApi';

const MasterLogin: React.FC = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            sessionStorage.setItem('alfabiz_master_token', token);
            await masterApi.get('/master/companies'); // Test call
            navigate('/alfabiz/companies');
        } catch (err: any) {
            sessionStorage.removeItem('alfabiz_master_token');
            console.error(err);
            setError('Token inválido ou erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Alfabiz Control</h1>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Acesso Restrito</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Master Token</label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 bg-white"
                            placeholder="Insira o token de acesso..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verificando...' : 'ENTRAR'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MasterLogin;
