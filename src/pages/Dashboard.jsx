import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';
import {
    TrendingUp, AlertCircle, Activity,
    CheckCircle, Clock, Zap, Package, Printer,
    DollarSign, AlertTriangle, FileText, Download, X,
    Banknote, CreditCard, LayoutGrid, Users, Archive,
    MapPin, ChevronDown
} from 'lucide-react';
import { useSedeStore } from '../stores/sedeStore';
import { ModalReportes } from '../components/dashboard/ModalReportes';

const Dashboard = () => {
    const navigate = useNavigate();
    const [kpis, setKpis] = useState(null);
    const [operativo, setOperativo] = useState(null);
    const [analitica, setAnalitica] = useState(null);
    const [loading, setLoading] = useState({ kpis: true, op: true, ana: true });

    // Estado Modal Reportes
    const [showReportModal, setShowReportModal] = useState(false);
    const [downloading, setDownloading] = useState(false);
    // Use locale 'en-CA' for standard YYYY-MM-DD in local time
    const getLocalDateObj = () => new Date().toLocaleDateString('en-CA');
    // Función para obtener la fecha de hace N días en formato YYYY-MM-DD
    const getPastDateObj = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toLocaleDateString('en-CA');
    };

    const [reportConfig, setReportConfig] = useState({
        module: 'TICKETS',
        dateStart: getPastDateObj(30),
        dateEnd: getLocalDateObj(),
        status: 'TODOS',
        // Nuevos filtros
        paymentMethod: 'TODOS',
        serviceCategory: 'TODOS',
        stockAlert: 'TODOS',
        productCategory: 'TODOS',
        debtStatus: 'TODOS',
        fidelityLevel: 'TODOS'
    });

    const [filterOptions, setFilterOptions] = useState({
        paymentMethods: [],
        serviceCategories: [],
        productCategories: []
    });

    // Sede store
    const { currentSede, sedesDisponibles, marcarSede } = useSedeStore();

    // Obtener usuario actual
    const storedUser = JSON.parse(localStorage.getItem('washly_user') || '{}');
    const userRole = storedUser?.rol;
    const showSedeSelector = userRole === 'ADMIN' && sedesDisponibles.length > 1;

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading({ kpis: true, op: true, ana: true });
            try {
                const [kpiRes, opRes, anaRes, payRes, servRes, prodRes] = await Promise.all([
                    api.get('/reportes/dashboard/kpis/'),
                    api.get('/reportes/dashboard/operativo/'),
                    api.get('/reportes/dashboard/analitica/'),
                    api.get('/pagos/config/'),
                    api.get('/categorias-servicio/'),
                    api.get('/inventario/categorias/')
                ]);
                setKpis(kpiRes.data);
                setOperativo(opRes.data);
                setAnalitica(anaRes.data);
                setFilterOptions({
                    paymentMethods: Array.isArray(payRes.data) ? payRes.data : payRes.data.results || [],
                    serviceCategories: Array.isArray(servRes.data) ? servRes.data : servRes.data.results || [],
                    productCategories: Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || []
                });
            } catch (error) {
                console.error("Error dashboard:", error);
            } finally {
                setLoading({ kpis: false, op: false, ana: false });
            }
        };
        fetchData();
    }, [currentSede?.id]);

    const money = (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`;

    // --- LÓGICA DE REPORTES (Descarga Real PDF) ---
    const handleDownload = async () => {
        setDownloading(true);

        try {
            // Construir URL con params
            let url = `/reportes/exportar/pdf/?modulo=${reportConfig.module}`;

            // Adjuntar fechas si aplica
            if (['TICKETS', 'PAGOS', 'VENTAS', 'CLIENTES', 'DIARIO_ELECTRONICO'].includes(reportConfig.module)) {
                url += `&inicio=${reportConfig.dateStart}&fin=${reportConfig.dateEnd}`;
            }

            // Adjuntar estado si aplica
            if (['TICKETS', 'PAGOS'].includes(reportConfig.module)) {
                url += `&estado=${reportConfig.status}`;
            }

            if (reportConfig.module === 'PAGOS' && reportConfig.paymentMethod !== 'TODOS') {
                url += `&metodo_pago=${reportConfig.paymentMethod}`;
            }
            if (reportConfig.module === 'VENTAS') {
                if (reportConfig.serviceCategory !== 'TODOS') url += `&categoria_servicio=${reportConfig.serviceCategory}`;
            }
            if (reportConfig.module === 'INVENTARIO') {
                if (reportConfig.stockAlert !== 'TODOS') url += `&alerta_stock=${reportConfig.stockAlert}`;
                if (reportConfig.productCategory !== 'TODOS') url += `&categoria_producto=${reportConfig.productCategory}`;
            }
            if (reportConfig.module === 'CLIENTES') {
                if (reportConfig.debtStatus !== 'TODOS') url += `&estado_deuda=${reportConfig.debtStatus}`;
                if (reportConfig.fidelityLevel !== 'TODOS') url += `&nivel_fidelizacion=${reportConfig.fidelityLevel}`;
            }

            // Adjuntar Sede si el user lo eligió (si es superadmin)
            if (currentSede?.id) {
                url += `&sede_id=${currentSede.id}`;
                // En el backend ya usamos resolver_sede_desde_request, 
                // pero si el frontend manda sede_id explícitamente se puede forzar en reportes futuros
            }

            const response = await api.get(url, {
                responseType: 'blob', // IMPORTANT: This tells axios to treat response as binary data!
            });

            const contentType = response.headers['content-type'] || 'application/pdf';
            const isHtml = contentType.includes('text/html');
            const fileExtension = isHtml ? 'html' : 'pdf';

            // Crear un objeto URL local del blob (el PDF o HTML binario)
            const fileBlob = new Blob([response.data], { type: contentType });
            const urlBlob = window.URL.createObjectURL(fileBlob);

            if (isHtml) {
                // If it's HTML, just open it in a new tab so they can print it
                window.open(urlBlob, '_blank');
            } else {
                // For PDF, download it directly
                const link = document.createElement('a');
                link.href = urlBlob;
                link.setAttribute('download', `Reporte_${reportConfig.module}_${reportConfig.dateStart}.${fileExtension}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Liberar memoria
            setTimeout(() => window.URL.revokeObjectURL(urlBlob), 1000);

            // Opcional: mostrar un toast de éxito aquí
        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            // Si el backend mandó un JSON con el mensaje de error (ej: 403) a pesar de ser blob,
            // leer error.response.data es complejo porque es blob. 
            // Mostramos alerta genérica.
            alert('Error al generar el reporte PDF. Verifica que tienes permisos y que el periodo sea válido.');
        } finally {
            setDownloading(false);
        }
    };

    // --- MODAL DE REPORTES MEJORADO EN LÍNEA ---

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">

            {/* HEADER COMPACTO */}
            <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-10 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-gray-800 dark:text-white">Dashboard Operativo</h1>
                    <p className="text-xs text-gray-500 font-medium">Resumen general en tiempo real</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Selector de Sede - Solo visible para ADMIN con múltiples sedes */}
                    {showSedeSelector && (
                        <div className="relative">
                            <select
                                value={currentSede?.id || ''}
                                onChange={(e) => marcarSede(Number(e.target.value))}
                                className="appearance-none bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 pl-9 pr-8 py-2 rounded-xl text-sm font-bold border border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[180px]"
                            >
                                {sedesDisponibles.map(sede => (
                                    <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                                ))}
                            </select>
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Sede actual para no-admin o sede única */}
                    {!showSedeSelector && currentSede && (
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{currentSede.nombre}</span>
                        </div>
                    )}

                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 flex items-center gap-2 transition-colors dark:bg-gray-700 dark:text-white"
                    >
                        <Printer size={16} />
                        Reportes
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL - GRID ESTRUCTURAL */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">

                {/* NIVEL 1: KPIs (Fila Superior - Altura Fija) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-36 flex-shrink-0">

                    {/* 1. CAJA ACTUAL (Estilo Mirror Pagos - Desglose) */}
                    <div
                        onClick={() => navigate('/pagos')}
                        className="bg-emerald-600 text-white rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer hover:bg-emerald-700 transition-all flex flex-col justify-between p-5"
                    >
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><DollarSign size={140} /></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Caja Actual</p>
                                <h3 className="text-3xl font-black tracking-tight mt-1">{kpis ? money(kpis.kpis.caja_actual.total) : '...'}</h3>
                            </div>
                        </div>

                        {/* DESGLOSE MIRROR PAGOS */}
                        <div className="relative z-10 grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-emerald-800/40 p-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2">
                                <Banknote size={14} className="text-emerald-200" />
                                <div>
                                    <span className="block text-[9px] text-emerald-200 font-bold uppercase">Efectivo</span>
                                    <span className="block text-xs font-bold">{kpis ? money(kpis.kpis.caja_actual.efectivo) : '-'}</span>
                                </div>
                            </div>
                            <div className="bg-emerald-800/40 p-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2">
                                <CreditCard size={14} className="text-emerald-200" />
                                <div>
                                    <span className="block text-[9px] text-emerald-200 font-bold uppercase">Digital</span>
                                    <span className="block text-xs font-bold">{kpis ? money(kpis.kpis.caja_actual.digital) : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. VENTAS HOY (Clickable) */}
                    <div
                        onClick={() => navigate('/pagos')}
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ventas Hoy</p>
                                <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-1">{kpis ? money(kpis.kpis.ventas_hoy) : '...'}</h3>
                            </div>
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400"><TrendingUp size={24} /></div>
                        </div>
                        <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                            <Activity size={12} /> Ingresos registrados
                        </div>
                    </div>

                    {/* 3. POR COBRAR (Deuda) */}
                    <div
                        onClick={() => navigate('/pagos')}
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Por Cobrar</p>
                                <h3 className="text-3xl font-black text-amber-500 mt-1">{kpis ? money(kpis.kpis.por_cobrar) : '...'}</h3>
                            </div>
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-900/30 dark:text-amber-400"><AlertCircle size={24} /></div>
                        </div>
                        <div className="text-xs font-medium text-gray-400">Saldo pendiente tickets</div>
                    </div>

                    {/* 4. EN PLANTA */}
                    <div
                        onClick={() => navigate('/tickets?estado=EN_PROCESO')}
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">En Planta</p>
                                <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-1">{kpis ? kpis.kpis.carga_operativa : '...'}</h3>
                            </div>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400"><LayoutGrid size={24} /></div>
                        </div>
                        <div className="text-xs font-medium text-gray-400">Tickets en proceso activo</div>
                    </div>
                </div>

                {/* NIVEL 2: CONTENIDO CENTRAL (Flex-1 para llenar pantalla) */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* COLUMNA IZQUIERDA: GRÁFICOS (3 columnas) */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full min-h-0">

                        {/* GRÁFICO PRINCIPAL */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 min-h-0 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Tendencia de Ventas (30 días)</h3>
                            </div>
                            <div className="flex-1 min-h-0 w-full">
                                {analitica ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <BarChart data={analitica.ventas_tendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="fecha" tickFormatter={(str) => str.slice(8)} stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Venta (S/)" />
                                            {analitica.promedio_ventas > 0 && <ReferenceLine y={analitica.promedio_ventas} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Promedio', position: 'insideTopLeft', fill: '#EF4444', fontSize: 10 }} />}
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />}
                            </div>
                        </div>

                        {/* GRÁFICOS SECUNDARIOS */}
                        <div className="h-48 flex gap-6 shrink-0">
                            {/* Top Servicios */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col w-1/2">
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Mix de Ingresos por Servicio</h3>
                                <div className="flex-1 min-h-0 w-full">
                                    {analitica ? (
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <PieChart>
                                                <Pie data={analitica.top_servicios} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                                                    {analitica.top_servicios.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip formatter={(value) => money(value)} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                                                <Legend
                                                    verticalAlign="middle"
                                                    align="right"
                                                    layout="vertical"
                                                    iconSize={8}
                                                    wrapperStyle={{ fontSize: '10px', width: '40%' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div className="h-full bg-gray-100 animate-pulse rounded-xl" />}
                                </div>
                            </div>

                            {/* Heatmap Compacto */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col w-1/2">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">Mapa de Calor (Afluencia)</h3>
                                    <div className="flex gap-1 text-[9px] text-gray-400">
                                        <span>Mañ</span><span>Tar</span><span>Noc</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-1">
                                    {analitica?.horas_pico?.map((dia, idx) => (
                                        <div key={idx} className="flex gap-1 items-center h-full">
                                            <span className="w-6 text-[9px] font-bold text-gray-400 text-right pr-1">{dia.dia}</span>
                                            {['manana', 'tarde', 'noche'].map((p, i) => (
                                                <div key={i} className="flex-1 h-full rounded-sm bg-indigo-600 transition-all hover:scale-105"
                                                    style={{ opacity: Math.max(0.1, Math.min(dia[p] / 5, 1)) }}
                                                    title={`${dia.dia} ${p}: ${dia[p]} tickets`} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: OPERACIONES (1 columna) */}
                    <div className="flex flex-col gap-6 h-full min-h-0">

                        {/* FLUJO DE TRABAJO (Diseño Compacto y Limpio) */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="flex justify-between items-center mb-2 shrink-0">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Package size={16} className="text-blue-500" /> Flujo de Tickets
                                </h3>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold dark:bg-gray-700 dark:text-gray-300">
                                    En Planta
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
                                {[
                                    {
                                        label: 'Recibidos',
                                        val: operativo?.pipeline?.recibidos,
                                        color: 'text-blue-600',
                                        bgIcon: 'bg-blue-100',
                                        border: 'hover:border-blue-300',
                                        state: 'RECIBIDO',
                                        desc: 'Pendientes de lavado',
                                        icon: Package
                                    },
                                    {
                                        label: 'En Proceso',
                                        val: operativo?.pipeline?.en_proceso,
                                        color: 'text-indigo-600',
                                        bgIcon: 'bg-indigo-100',
                                        border: 'hover:border-indigo-300',
                                        state: 'EN_PROCESO',
                                        desc: 'Lavando / Secando',
                                        icon: Activity
                                    },
                                    {
                                        label: 'Listos',
                                        val: operativo?.pipeline?.listos,
                                        color: 'text-emerald-600',
                                        bgIcon: 'bg-emerald-100',
                                        border: 'hover:border-emerald-300',
                                        state: 'LISTO',
                                        desc: 'Para entrega / recojo',
                                        icon: CheckCircle
                                    }
                                ].map((item, idx) => (
                                    <div key={idx}
                                        onClick={() => navigate(`/tickets?estado=${item.state}`)}
                                        className={`group relative flex items-center gap-3 p-2.5 rounded-xl border border-gray-50 bg-gray-50/50 cursor-pointer transition-all hover:bg-white hover:shadow-md dark:bg-gray-900/30 dark:border-gray-700 dark:hover:bg-gray-800 ${item.border} flex-1`}>

                                        {/* 1. Ícono (Más compacto) */}
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bgIcon} ${item.color} bg-opacity-20`}>
                                            <item.icon size={18} />
                                        </div>

                                        {/* 2. Texto */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide truncate">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate leading-tight">
                                                {item.desc}
                                            </p>
                                        </div>

                                        {/* 3. Cantidad */}
                                        <div className="text-right pl-2">
                                            <span className={`text-2xl font-black ${item.color} leading-none`}>
                                                {item.val ?? '-'}
                                            </span>
                                        </div>

                                        {/* Decoración Hover */}
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-current rounded-r-full transition-all duration-300 group-hover:h-3/4 opacity-0 group-hover:opacity-100 ${item.color.replace('text', 'bg')}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ALERTAS (Altura auto) */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Zap size={16} className="text-amber-500" /> Atención Requerida
                            </h3>
                            <div className="space-y-3">
                                {kpis?.alertas?.vencidos > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                                        onClick={() => navigate('/tickets?vencidos=true')}>
                                        <div className="bg-red-200 p-2 rounded-lg"><Clock size={16} /></div>
                                        <div>
                                            <span className="text-sm font-bold block">{kpis.alertas.vencidos} Tickets Vencidos</span>
                                            <span className="text-[10px] opacity-80">Ver listado</span>
                                        </div>
                                    </div>
                                )}

                                {kpis?.alertas?.stock_bajo > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                                        onClick={() => navigate('/inventario')}>
                                        <div className="bg-orange-200 p-2 rounded-lg"><AlertTriangle size={16} /></div>
                                        <div>
                                            <span className="text-sm font-bold block">{kpis.alertas.stock_bajo} Insumos Bajos</span>
                                            <span className="text-[10px] opacity-80">Reponer stock</span>
                                        </div>
                                    </div>
                                )}

                                {!kpis?.alertas?.vencidos && !kpis?.alertas?.stock_bajo && (
                                    <div className="text-center py-4 text-gray-400">
                                        <CheckCircle size={24} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">Sin alertas críticas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            <ModalReportes 
                showReportModal={showReportModal} 
                setShowReportModal={setShowReportModal}
                reportConfig={reportConfig}
                setReportConfig={setReportConfig}
                filterOptions={filterOptions}
                handleDownload={handleDownload}
                downloading={downloading}
            />
        </div>
    );
};

export default Dashboard;