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
  Banknote, CreditCard, LayoutGrid, Users, Archive
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [operativo, setOperativo] = useState(null);
  const [analitica, setAnalitica] = useState(null);
  const [loading, setLoading] = useState({ kpis: true, op: true, ana: true });
  
  // Estado Modal Reportes
  const [showReportModal, setShowReportModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    module: 'TICKETS',
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    status: 'TODOS'
  });

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, opRes, anaRes] = await Promise.all([
            api.get('/reportes/dashboard/kpis/'),
            api.get('/reportes/dashboard/operativo/'),
            api.get('/reportes/dashboard/analitica/')
        ]);
        setKpis(kpiRes.data);
        setOperativo(opRes.data);
        setAnalitica(anaRes.data);
      } catch (error) {
        console.error("Error dashboard:", error);
      } finally {
        setLoading({ kpis: false, op: false, ana: false });
      }
    };
    fetchData();
  }, []);

  const money = (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`;

  // --- LÓGICA DE REPORTES (Simulación de Descarga Real) ---
  const handleDownload = () => {
    setDownloading(true);
    
    // Simular delay de red
    setTimeout(() => {
        // Crear datos dummy CSV
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Fecha,Concepto,Monto,Estado\n"
            + `${reportConfig.dateStart},Venta Servicio Lavado,50.00,Pagado\n`
            + `${reportConfig.dateEnd},Venta Servicio Secado,30.00,Pagado`;
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_${reportConfig.module}_${reportConfig.dateStart}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
        
        setDownloading(false);
        // No cerramos el modal automáticamente, feedback visual en botón
    }, 1500);
  };

  // --- MODAL DE REPORTES MEJORADO ---
  const ReportModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[550px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-900 p-5 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <Printer className="text-blue-600"/> Centro de Reportes
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Genera exportaciones detalladas en CSV/Excel</p>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={20}/></button>
            </div>

            {/* Body: Grid Layout */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
                
                {/* Sidebar: Módulos */}
                <div className="col-span-4 border-r dark:border-gray-700 pr-4 space-y-2 overflow-y-auto">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Módulos</label>
                    {[
                        {id: 'TICKETS', label: 'Tickets', icon: Package},
                        {id: 'PAGOS', label: 'Caja y Pagos', icon: DollarSign},
                        {id: 'VENTAS', label: 'Ventas', icon: TrendingUp},
                        {id: 'INVENTARIO', label: 'Inventario', icon: Archive},
                        {id: 'CLIENTES', label: 'Clientes', icon: Users},
                    ].map(m => (
                        <button 
                            key={m.id}
                            onClick={() => setReportConfig({...reportConfig, module: m.id})}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
                                reportConfig.module === m.id 
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            <m.icon size={18}/> {m.label}
                        </button>
                    ))}
                </div>

                {/* Content: Filtros */}
                <div className="col-span-8 flex flex-col gap-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Configuración del Reporte</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fecha Inicio</label>
                                <input type="date" value={reportConfig.dateStart} onChange={e => setReportConfig({...reportConfig, dateStart: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-600"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fecha Fin</label>
                                <input type="date" value={reportConfig.dateEnd} onChange={e => setReportConfig({...reportConfig, dateEnd: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-600"/>
                            </div>
                        </div>

                        {reportConfig.module === 'TICKETS' && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Filtro Estado</label>
                                <select className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600">
                                    <option>Todos los estados</option>
                                    <option>Recibidos</option>
                                    <option>Entregados</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                            Se generará un archivo <strong>CSV</strong> compatible con Excel conteniendo la información filtrada del módulo <strong>{reportConfig.module}</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex justify-end gap-3">
                <button onClick={() => setShowReportModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors">Cerrar</button>
                <button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                    {downloading ? (
                        <><Activity className="animate-spin" size={18}/> Generando...</>
                    ) : (
                        <><Download size={18}/> Descargar Reporte</>
                    )}
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-10 flex-shrink-0">
        <div>
            <h1 className="text-xl font-black tracking-tight text-gray-800 dark:text-white">Dashboard Operativo</h1>
            <p className="text-xs text-gray-500 font-medium">Resumen general en tiempo real</p>
        </div>
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 flex items-center gap-2 transition-colors dark:bg-gray-700 dark:text-white"
        >
          <Printer size={16} />
          Reportes
        </button>
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
                <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><DollarSign size={140}/></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Caja Actual</p>
                        <h3 className="text-3xl font-black tracking-tight mt-1">{kpis ? money(kpis.kpis.caja_actual.total) : '...'}</h3>
                    </div>
                </div>

                {/* DESGLOSE MIRROR PAGOS */}
                <div className="relative z-10 grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-emerald-800/40 p-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <Banknote size={14} className="text-emerald-200"/>
                        <div>
                            <span className="block text-[9px] text-emerald-200 font-bold uppercase">Efectivo</span>
                            <span className="block text-xs font-bold">{kpis ? money(kpis.kpis.caja_actual.efectivo) : '-'}</span>
                        </div>
                    </div>
                    <div className="bg-emerald-800/40 p-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <CreditCard size={14} className="text-emerald-200"/>
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
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400"><TrendingUp size={24}/></div>
                </div>
                <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                    <Activity size={12}/> Ingresos registrados
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
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-900/30 dark:text-amber-400"><AlertCircle size={24}/></div>
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
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400"><LayoutGrid size={24}/></div>
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
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analitica.ventas_tendencia} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="fecha" tickFormatter={(str)=>str.slice(8)} stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false}/>
                                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'8px', fontSize:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                    <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Venta (S/)" />
                                    {analitica.promedio_ventas > 0 && <ReferenceLine y={analitica.promedio_ventas} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Promedio', position: 'insideTopLeft', fill: '#EF4444', fontSize: 10 }}/>}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl"/>}
                    </div>
                </div>

                {/* GRÁFICOS SECUNDARIOS */}
                <div className="h-48 flex gap-6 shrink-0">
                    {/* Top Servicios */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col w-1/2">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Mix de Ingresos por Servicio</h3>
                        <div className="flex-1 min-h-0 w-full">
                            {analitica ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={analitica.top_servicios} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                                            {analitica.top_servicios.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => money(value)} contentStyle={{fontSize:'11px', borderRadius:'8px'}}/>
                                        <Legend 
                                            verticalAlign="middle" 
                                            align="right" 
                                            layout="vertical"
                                            iconSize={8}
                                            wrapperStyle={{fontSize:'10px', width: '40%'}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full bg-gray-100 animate-pulse rounded-xl"/>}
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
                                    {['manana','tarde','noche'].map((p, i) => (
                                        <div key={i} className="flex-1 h-full rounded-sm bg-indigo-600 transition-all hover:scale-105"
                                             style={{opacity: Math.max(0.1, Math.min(dia[p]/5, 1))}} 
                                             title={`${dia.dia} ${p}: ${dia[p]} tickets`}/>
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
                            <Package size={16} className="text-blue-500"/> Flujo de Tickets
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
                        <Zap size={16} className="text-amber-500"/> Atención Requerida
                    </h3>
                    <div className="space-y-3">
                        {kpis?.alertas?.vencidos > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                                 onClick={() => navigate('/tickets?vencidos=true')}>
                                <div className="bg-red-200 p-2 rounded-lg"><Clock size={16}/></div>
                                <div>
                                    <span className="text-sm font-bold block">{kpis.alertas.vencidos} Tickets Vencidos</span>
                                    <span className="text-[10px] opacity-80">Ver listado</span>
                                </div>
                            </div>
                        )}
                        
                        {kpis?.alertas?.stock_bajo > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                                 onClick={() => navigate('/inventario')}>
                                <div className="bg-orange-200 p-2 rounded-lg"><AlertTriangle size={16}/></div>
                                <div>
                                    <span className="text-sm font-bold block">{kpis.alertas.stock_bajo} Insumos Bajos</span>
                                    <span className="text-[10px] opacity-80">Reponer stock</span>
                                </div>
                            </div>
                        )}

                        {!kpis?.alertas?.vencidos && !kpis?.alertas?.stock_bajo && (
                            <div className="text-center py-4 text-gray-400">
                                <CheckCircle size={24} className="mx-auto mb-2 opacity-20"/>
                                <p className="text-xs">Sin alertas críticas</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

      </div>

      {showReportModal && <ReportModal/>}
    </div>
  );
};

export default Dashboard;