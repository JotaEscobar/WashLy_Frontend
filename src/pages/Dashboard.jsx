import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';
import { 
  Wallet, TrendingUp, AlertCircle, Activity, 
  CheckCircle, Clock, Zap, Package, Printer, 
  DollarSign, AlertTriangle, FileText, Calendar, Download, X
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [operativo, setOperativo] = useState(null);
  const [analitica, setAnalitica] = useState(null);
  const [loading, setLoading] = useState({ kpis: true, op: true, ana: true });
  
  // Estado Modal Reportes
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    module: 'TICKETS', // TICKETS, PAGOS, VENTAS, MOVIMIENTOS, DIARIO, INVENTARIO, KARDEX, CLIENTES
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    status: 'TODOS',
    format: 'EXCEL'
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

  // --- LÓGICA DE REPORTES ---
  const handleGenerateReport = () => {
    // Aquí construirías la URL real hacia tu backend de exportación
    // Ejemplo: /api/reportes/exportar/?modulo=TICKETS&desde=...&hasta=...
    const params = new URLSearchParams({
        modulo: reportConfig.module,
        desde: reportConfig.dateStart,
        hasta: reportConfig.dateEnd,
        estado: reportConfig.status,
        formato: reportConfig.format
    });
    
    // Simulación de descarga
    console.log("Generando reporte con:", Object.fromEntries(params));
    // window.open(`${api.defaults.baseURL}/reportes/exportar/?${params.toString()}`, '_blank');
    setShowReportModal(false);
    alert(`Solicitud de reporte enviada:\nMódulo: ${reportConfig.module}\nPeriodo: ${reportConfig.dateStart} - ${reportConfig.dateEnd}`);
  };

  // --- RENDERIZADO DEL MODAL ---
  const ReportModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                    <Printer size={20} className="text-blue-600"/> Centro de Reportes
                </h3>
                <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 overflow-y-auto">
                {/* 1. Selector de Módulo */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tipo de Reporte</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            {id: 'TICKETS', label: 'Gestión de Tickets'},
                            {id: 'PAGOS', label: 'Pagos y Cobros'},
                            {id: 'VENTAS', label: 'Ventas Generales'},
                            {id: 'MOVIMIENTOS', label: 'Caja (Ingresos/Gastos)'},
                            {id: 'DIARIO', label: 'Diario Electrónico'},
                            {id: 'INVENTARIO', label: 'Inventario General'},
                            {id: 'KARDEX', label: 'Kardex Valorizado'},
                            {id: 'CLIENTES', label: 'Cartera de Clientes'}
                        ].map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setReportConfig({...reportConfig, module: m.id})}
                                className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                                    reportConfig.module === m.id 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Filtros de Fecha (Ocultar para Clientes/Inventario actual) */}
                {!['INVENTARIO', 'CLIENTES'].includes(reportConfig.module) && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Desde</label>
                            <input 
                                type="date" 
                                value={reportConfig.dateStart}
                                onChange={e => setReportConfig({...reportConfig, dateStart: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hasta</label>
                            <input 
                                type="date" 
                                value={reportConfig.dateEnd}
                                onChange={e => setReportConfig({...reportConfig, dateEnd: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600"
                            />
                        </div>
                    </div>
                )}

                {/* 3. Filtros Específicos (Estados) */}
                {reportConfig.module === 'TICKETS' && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estado Ticket</label>
                        <select 
                            className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600"
                            onChange={e => setReportConfig({...reportConfig, status: e.target.value})}
                        >
                            <option value="TODOS">Todos</option>
                            <option value="RECIBIDO">Recibido</option>
                            <option value="EN_PROCESO">En Proceso</option>
                            <option value="LISTO">Listo</option>
                            <option value="ENTREGADO">Entregado</option>
                        </select>
                    </div>
                )}

                {reportConfig.module === 'PAGOS' && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estado Pago</label>
                        <select 
                            className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600"
                            onChange={e => setReportConfig({...reportConfig, status: e.target.value})}
                        >
                            <option value="TODOS">Todos (Inc. Anulados)</option>
                            <option value="PAGADO">Solo Pagados</option>
                            <option value="ANULADO">Solo Anulados/Extornados</option>
                        </select>
                    </div>
                )}

                {/* 4. Formato */}
                <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl dark:bg-gray-900">
                    <span className="text-xs font-bold text-gray-500 uppercase">Formato:</span>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="fmt" checked={reportConfig.format === 'EXCEL'} onChange={() => setReportConfig({...reportConfig, format: 'EXCEL'})} />
                        <span className="flex items-center gap-1"><FileText size={14} className="text-emerald-600"/> Excel (.xlsx)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="fmt" checked={reportConfig.format === 'PDF'} onChange={() => setReportConfig({...reportConfig, format: 'PDF'})} />
                        <span className="flex items-center gap-1"><FileText size={14} className="text-red-600"/> PDF</span>
                    </label>
                </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex justify-end gap-3">
                <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                <button 
                    onClick={handleGenerateReport}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Download size={16}/> Generar Reporte
                </button>
            </div>
        </div>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col p-4 bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-100">
      
      {/* HEADER COMPACTO */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-black tracking-tight">Dashboard Operativo</h1>
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Reportes
        </button>
      </div>

      {/* CONTENIDO SCROLLABLE (Si fuera necesario, pero intentamos que quepa) */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-4 min-h-0">
        
        {/* NIVEL 1: KPIs (Fila Superior Fija) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
            {/* Caja */}
            <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md relative overflow-hidden h-24 flex flex-col justify-center cursor-pointer hover:bg-emerald-700 transition-colors"
                onClick={() => navigate('/pagos')}>
                <DollarSign className="absolute right-[-10px] bottom-[-15px] opacity-20 w-24 h-24 rotate-12"/>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest relative z-10">Caja Actual</p>
                <h3 className="text-2xl font-black relative z-10">{kpis ? money(kpis.kpis.caja_actual.total) : '...'}</h3>
            </div>
            {/* Ventas */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-24 flex flex-col justify-center">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ventas Hoy</p>
                        <h3 className="text-2xl font-black">{kpis ? money(kpis.kpis.ventas_hoy) : '...'}</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={18}/></div>
                </div>
            </div>
            {/* Por Cobrar -> Navigate a Pagos */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-24 flex flex-col justify-center cursor-pointer hover:border-amber-400 transition-colors"
                 onClick={() => navigate('/pagos')}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Por Cobrar</p>
                        <h3 className="text-2xl font-black text-amber-600">{kpis ? money(kpis.kpis.por_cobrar) : '...'}</h3>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={18}/></div>
                </div>
            </div>
            {/* En Planta */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-24 flex flex-col justify-center cursor-pointer hover:border-blue-400 transition-colors"
                 onClick={() => navigate('/tickets?estado=EN_PROCESO')}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">En Planta</p>
                        <h3 className="text-2xl font-black">{kpis ? kpis.kpis.carga_operativa : '...'}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={18}/></div>
                </div>
            </div>
        </div>

        {/* NIVEL 2: CONTENIDO PRINCIPAL (Grilla Asimétrica) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
            
            {/* COLUMNA IZQUIERDA (Gráficos - 75% ancho) */}
            <div className="lg:col-span-3 grid grid-rows-2 gap-4 h-full">
                
                {/* Fila 1: Gráfico Ventas (Más ancho) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tendencia de Ventas (30 días)</h3>
                    <div className="flex-1 min-h-0">
                        {analitica ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analitica.ventas_tendencia} margin={{top: 5, right: 5, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="fecha" tickFormatter={(str)=>str.slice(8)} stroke="#9CA3AF" fontSize={10} tickLine={false}/>
                                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false}/>
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px', fontSize:'12px'}}/>
                                    <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                    {analitica.promedio_ventas > 0 && <ReferenceLine y={analitica.promedio_ventas} stroke="red" strokeDasharray="3 3"/>}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full bg-gray-100 animate-pulse rounded-lg"/>}
                    </div>
                </div>

                {/* Fila 2: Dos Gráficos Pequeños (Servicios y Heatmap) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Top Servicios */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Top Servicios</h3>
                        <div className="flex-1 min-h-0 relative">
                            {analitica ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={analitica.top_servicios} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="total">
                                            {analitica.top_servicios.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize:'11px'}}/>
                                        <Legend wrapperStyle={{fontSize:'10px'}} layout="vertical" verticalAlign="middle" align="right"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full bg-gray-100 animate-pulse rounded-lg"/>}
                        </div>
                    </div>

                    {/* Heatmap Compacto */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Afluencia Semanal</h3>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                            {analitica?.horas_pico?.map((dia, idx) => (
                                <div key={idx} className="flex gap-1 items-center h-full">
                                    <span className="w-6 text-[9px] font-bold text-gray-400">{dia.dia}</span>
                                    {['manana','tarde','noche'].map((p, i) => (
                                        <div key={i} className="flex-1 h-full rounded bg-indigo-600 transition-all hover:opacity-80"
                                             style={{opacity: Math.max(0.1, Math.min(dia[p]/5, 1))}} title={`${p}: ${dia[p]}`}/>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-6">
                            <span>M</span><span>T</span><span>N</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA (Operaciones - 25% ancho) */}
            <div className="flex flex-col gap-4 h-full">
                
                {/* Pipeline Vertical */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <Package size={16} className="text-blue-500"/> Pipeline
                    </h3>
                    <div className="flex-1 flex flex-col gap-2 justify-between">
                        {[
                            {label: 'Recibidos', val: operativo?.pipeline?.recibidos, color: 'text-blue-600', bg: 'bg-blue-50', state: 'RECIBIDO'},
                            {label: 'En Proceso', val: operativo?.pipeline?.en_proceso, color: 'text-indigo-600', bg: 'bg-indigo-50', state: 'EN_PROCESO'},
                            {label: 'Listos', val: operativo?.pipeline?.listos, color: 'text-emerald-600', bg: 'bg-emerald-50', state: 'LISTO'}
                        ].map((item, idx) => (
                            <div key={idx} 
                                 onClick={() => navigate(`/tickets?estado=${item.state}`)}
                                 className={`${item.bg} p-3 rounded-xl flex-1 flex flex-col justify-center items-center cursor-pointer hover:scale-[1.02] transition-transform`}>
                                <span className={`text-3xl font-black ${item.color}`}>{item.val ?? '-'}</span>
                                <span className="text-[10px] font-bold uppercase text-gray-500">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alertas & Avisos (Aquí ubicamos el STOCK BAJO) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-auto flex-shrink-0">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500"/> Alertas
                    </h3>
                    <div className="space-y-2">
                        {kpis?.alertas?.stock_bajo > 0 && (
                            <div className="flex items-center gap-3 p-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                                 onClick={() => navigate('/inventario')}>
                                <div className="bg-orange-200 p-1.5 rounded-md"><AlertTriangle size={14}/></div>
                                <div>
                                    <span className="text-xs font-bold block">{kpis.alertas.stock_bajo} Insumos</span>
                                    <span className="text-[10px] opacity-80">Stock Bajo (Reponer)</span>
                                </div>
                            </div>
                        )}
                        
                        {kpis?.alertas?.vencidos > 0 && (
                            <div className="flex items-center gap-3 p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                <div className="bg-red-200 p-1.5 rounded-md"><Clock size={14}/></div>
                                <div>
                                    <span className="text-xs font-bold block">{kpis.alertas.vencidos} Vencidos</span>
                                    <span className="text-[10px] opacity-80">Prioridad Máxima</span>
                                </div>
                            </div>
                        )}

                        {kpis?.alertas?.urgentes > 0 && (
                            <div className="flex items-center gap-3 p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                                <div className="bg-amber-200 p-1.5 rounded-md"><Zap size={14}/></div>
                                <div>
                                    <span className="text-xs font-bold block">{kpis.alertas.urgentes} Urgentes</span>
                                    <span className="text-[10px] opacity-80">Para hoy</span>
                                </div>
                            </div>
                        )}

                        {!kpis?.alertas?.vencidos && !kpis?.alertas?.stock_bajo && !kpis?.alertas?.urgentes && (
                            <div className="text-center py-2 text-gray-400 text-xs">
                                <CheckCircle size={20} className="mx-auto mb-1 opacity-30"/>
                                Sin alertas activas
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