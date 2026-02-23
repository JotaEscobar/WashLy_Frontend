import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    Search, Filter, MoreVertical, Building2,
    Calendar, Mail, ShieldAlert, CheckCircle2,
    Play, Pause, Clock, ExternalLink, UserCog
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProviderBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');

    const fetchBusinesses = async () => {
        try {
            const res = await api.get('/reportes/provider/empresas/');
            setBusinesses(res.data);
        } catch (err) {
            toast.error("Error al cargar empresas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const handleAction = async (id, accion) => {
        try {
            await api.post(`/reportes/provider/empresas/${id}/accion/`, { accion });
            toast.success("Acción completada con éxito");
            fetchBusinesses(); // Recargar
        } catch (err) {
            toast.error("Error al ejecutar acción");
        }
    };

    const filtered = businesses.filter(b => {
        const matchesSearch = b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || b.ruc.includes(searchTerm);
        const matchesFilter = filterStatus === 'TODOS' || b.estado === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="p-8 text-center font-bold text-slate-400">Accediendo al registro global...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o RUC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['TODOS', 'ACTIVO', 'SUSPENDIDO', 'INACTIVO'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all
                                ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / RUC</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Vencimiento</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones de Proveedor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtered.map(b => (
                                <tr key={b.id} className="hover:bg-slate-50/50 active:bg-slate-100 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{b.nombre}</p>
                                                <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                                    <Mail size={12} className="text-slate-400" /> {b.email || 'Sin email'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold">RUC: {b.ruc}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${b.plan === 'MENSUAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {b.plan}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                                                <Calendar size={12} className="text-slate-400" /> {b.fecha_vencimiento}
                                            </div>
                                            <p className={`text-[10px] font-bold ${b.dias_restantes < 0 ? 'text-red-500' : b.dias_restantes < 7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {b.dias_restantes < 0 ? `Vencido hace ${Math.abs(b.dias_restantes)} días` : `${b.dias_restantes} días restantes`}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${b.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                b.estado === 'SUSPENDIDO' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {b.estado === 'ACTIVO' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                                            {b.estado}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {/* EXTENDER DEMO */}
                                            {b.plan === 'DEMO' && (
                                                <button
                                                    onClick={() => handleAction(b.id, 'EXTENDER_DEMO')}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                    title="Extender Demo 7 días"
                                                >
                                                    <Clock size={18} />
                                                </button>
                                            )}

                                            {/* ACTIVAR / SUSPENDER */}
                                            {b.estado === 'ACTIVO' ? (
                                                <button
                                                    onClick={() => handleAction(b.id, 'SUSPENDER')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Suspender Empresa"
                                                >
                                                    <Pause size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(b.id, 'ACTIVAR')}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Reactivar Empresa"
                                                >
                                                    <Play size={18} />
                                                </button>
                                            )}

                                            {/* IMPERSONATION FEAT (Hybrid) */}
                                            <button
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                title="Entrar como Empresa (Hybrid Support Mode)"
                                            >
                                                <UserCog size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm font-bold">
                                        No se encontraron empresas con esos criterios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProviderBusinesses;
