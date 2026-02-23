import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    Users, Building2, TrendingUp, AlertCircle,
    ArrowUpRight, Clock, ShieldCheck, Activity,
    ChevronRight, ExternalLink
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const ProviderDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reportes/provider/stats/');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching provider stats:", err);
                setError("No se pudieron cargar las estadísticas globales.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const money = (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`;

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Activity className="animate-spin text-indigo-600" size={40} />
                <p className="text-sm font-bold text-slate-500">Cargando métricas de red...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* MRR - Glass Card */}
                <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Ingresos de este Mes</p>
                        <h3 className="text-4xl font-black mb-4">{money(stats?.financiero?.ingresos_mes_actual)}</h3>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 w-fit border border-white/20">
                            <ArrowUpRight size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold">MRR Actualizado</span>
                        </div>
                    </div>
                </div>

                {/* EMPRESAS ACTIVAS */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
                            <Building2 size={24} />
                        </div>
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ESTABLE</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Empresas en Producción</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats?.resumen?.activas}</h3>
                        <p className="text-xs text-slate-500 mt-2">de un total de {stats?.resumen?.total_empresas}</p>
                    </div>
                </div>

                {/* DEMOS ACTIVOS */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Periodos de Prueba</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats?.resumen?.demos}</h3>
                        <p className="text-xs text-amber-600 font-bold mt-2">Nuevos prospectos</p>
                    </div>
                </div>

                {/* POR VENCER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-1 rounded-full">ACCIÓN REQUERIDA</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Renovaciones (7 días)</p>
                        <h3 className="text-3xl font-black text-red-600">{stats?.resumen?.por_vencer}</h3>
                        <p className="text-xs text-slate-500 mt-2">Seguimiento de cobranza</p>
                    </div>
                </div>

            </div>

            {/* SEGUNDA FILA: TABLA Y INFO SISTEMA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LISTADO RÁPIDO - 2/3 */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Empresas Recientes</h4>
                            <p className="text-xs text-slate-500">Últimos negocios integrados a la red</p>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                            Ver todo <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Empresa</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Plan</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {/* Simulamos listado rápido aquí, en la pág de empresas estará completo */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-xs">A</div>
                                            <div>
                                                <p className="text-sm font-bold">Lavandería Acuario</p>
                                                <p className="text-[10px] text-slate-500 font-mono">20601234567</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black px-2 py-1 bg-violet-100 text-violet-700 rounded-lg">MENSUAL</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Activo</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SALUD DEL SISTEMA - 1/3 */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-indigo-400" size={18} />
                        <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Estado del Sistema</h4>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-300">API Health</span>
                                <span className="text-[10px] text-emerald-400 font-black">99.8%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[99.8%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-300">Database Load</span>
                                <span className="text-[10px] text-indigo-400 font-black">12%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[12%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                                <ShieldCheck className="text-emerald-400" size={16} />
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-300">Seguridad</p>
                                    <p className="text-[9px] text-slate-500">Firewall activo & Tokens en rotación</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
                        <p className="text-[10px] text-indigo-300 font-black uppercase mb-1">Última Auditoría</p>
                        <p className="text-xs leading-relaxed text-indigo-100">
                            No se detectaron incidentes en las últimas 48 horas de operación global.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ProviderDashboard;
