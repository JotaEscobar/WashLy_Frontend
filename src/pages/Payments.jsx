import { useState, useEffect } from 'react';
import { 
    Wallet, Search, ArrowUpRight, ArrowDownLeft, 
    DollarSign, CreditCard, Lock, RotateCcw, 
    RefreshCw, X, Clock, FileText, Calendar, User, Eye, AlertTriangle,
    CheckCircle, Unlock, ArrowDownCircle
} from 'lucide-react';
import api from '../api/axiosConfig';

const Payments = () => {
    // --- ESTADOS ---
    const [caja, setCaja] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Tabla y Filtros
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS'); // TODOS, PENDIENTE, PAGADO
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
  
    const [infoModal, setInfoModal] = useState({ show: false, title: '', message: '', type: 'info' });
    
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);

    // Modales Operativos
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showExtornoModal, setShowExtornoModal] = useState(false);
    const [showCerrar, setShowCerrar] = useState(false);
    const [showConfirmAbrir, setShowConfirmAbrir] = useState(false); // Modal confirmación apertura

    // Modales Historial
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [sessionsList, setSessionsList] = useState([]);
    const [selectedSessionTimeline, setSelectedSessionTimeline] = useState([]);
    const [selectedSessionInfo, setSelectedSessionInfo] = useState(null);
    
    // Formularios
    const [aperturaValues, setAperturaValues] = useState({
        EFECTIVO: '', YAPE: '', PLIN: '', TARJETA: ''
    });
    
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('EFECTIVO');
    
    // Cierre Detallado
    const [cierreDetalle, setCierreDetalle] = useState({
        EFECTIVO: '', YAPE: '', PLIN: '', TARJETA: '',
        comentarios: ''
    });

    // --- CARGA INICIAL ---
    const fetchCaja = async () => {
        setLoading(true);
        try {
            const res = await api.get('pagos/caja/mi_caja/');
            setCaja(res.data);
            if (res.data) fetchTableData();
        } catch (error) {
            console.error("Error cargando caja", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTableData = async (url = null) => {
        try {
            let endpoint = url;
            if (!endpoint) {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                
                // Filtros exactos
                if (statusFilter === 'PENDIENTE') params.append('pendientes_pago', 'true');
                if (statusFilter === 'PAGADO') params.append('estado', 'ENTREGADO'); 
                
                if (fechaDesde) params.append('fecha_desde', fechaDesde);
                if (fechaHasta) params.append('fecha_hasta', fechaHasta);
                
                endpoint = `tickets/?${params.toString()}`;
            }
            const res = await api.get(endpoint);
            setTickets(res.data.results || res.data);
            setNextUrl(res.data.next);
            setPrevUrl(res.data.previous);
        } catch (e) { console.error("Error cargando tabla", e); }
    };

    useEffect(() => { fetchCaja(); }, []);
    useEffect(() => { if(caja) fetchTableData(); }, [searchTerm, statusFilter, fechaDesde, fechaHasta]);

    // --- ACCIONES DE CAJA ---
    
    // 1. Importar último cierre
    const handleImportarCierre = async (e) => {
        if (!e.target.checked) return; // Si desmarca, no hacemos nada (o podríamos limpiar)

        try {
            const res = await api.get('pagos/caja/ultimo_cierre/');
            if (!res.data) {
                alert("No se encontró un cierre anterior.");
                e.target.checked = false;
                return;
            }
            
            setAperturaValues({
                EFECTIVO: res.data.EFECTIVO || 0,
                YAPE: res.data.detalle?.YAPE || 0,
                PLIN: res.data.detalle?.PLIN || 0,
                TARJETA: res.data.detalle?.TARJETA || 0
            });
            
        } catch (error) {
            console.error("Error importando cierre", error);
            alert("Error al obtener datos del último cierre.");
        }
    };

    // 2. Ejecutar Apertura
    const confirmarApertura = async () => {
        const montoEfectivo = parseFloat(aperturaValues.EFECTIVO) || 0;
        
        // El resto de medios se van al detalle_apertura
        const detalle = {
            YAPE: parseFloat(aperturaValues.YAPE) || 0,
            PLIN: parseFloat(aperturaValues.PLIN) || 0,
            TARJETA: parseFloat(aperturaValues.TARJETA) || 0
        };

        if(montoEfectivo < 0) return alert("El monto no puede ser negativo");

        try {
            const res = await api.post('pagos/caja/abrir/', { 
                monto_inicial: montoEfectivo, 
                detalle_apertura: detalle      
            });
            setCaja(res.data);
            setShowConfirmAbrir(false);
            fetchTableData();
        } catch (e) { 
            setShowConfirmAbrir(false);
            alert(e.response?.data?.error || "Error al abrir"); 
        }
    };

    // --- NUEVA FUNCIÓN: AUTOCOMPLETAR CIERRE ---
    const handleAutoFillCierre = (e) => {
        if (e.target.checked && caja?.desglose_pagos) {
            setCierreDetalle(prev => ({
                ...prev,
                EFECTIVO: caja.desglose_pagos.EFECTIVO || 0,
                YAPE: caja.desglose_pagos.YAPE || 0,
                PLIN: caja.desglose_pagos.PLIN || 0,
                TARJETA: caja.desglose_pagos.TARJETA || 0,
                TRANSFERENCIA: caja.desglose_pagos.TRANSFERENCIA || 0
            }));
        }
    };

    const handleCerrar = async () => {
        const totalReal = Object.keys(cierreDetalle)
            .filter(k => k !== 'comentarios')
            .reduce((sum, key) => sum + (parseFloat(cierreDetalle[key]) || 0), 0);

        if(totalReal <= 0 && !window.confirm("¿Estás cerrando caja en CERO?")) return;

        const detalleTexto = Object.keys(cierreDetalle)
            .filter(k => k !== 'comentarios' && cierreDetalle[k])
            .map(k => `${k}: S/${cierreDetalle[k]}`).join(', ');
        
        const comentarioFinal = `${cierreDetalle.comentarios} | Detalle Cierre: [ ${detalleTexto} ]`;

        try {
            await api.post(`pagos/caja/${caja.id}/cerrar/`, { 
                monto_real: totalReal,
                comentarios: comentarioFinal,
                detalle_cierre: cierreDetalle // Enviamos también el objeto estructurado
            });
            setCaja(null);
            setShowCerrar(false);
            setTickets([]);
            setCierreDetalle({EFECTIVO: '', YAPE: '', PLIN: '', TARJETA: '', comentarios: ''});
        } catch (e) { 
            console.error(e);
            alert("Error al cerrar: " + (e.response?.data?.error || "Error interno")); 
        }
    };

    const handleRegisterPayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            setInfoModal({ show: true, title: 'Monto Inválido', message: 'Ingrese un monto mayor a 0', type: 'error' });
            return;
        }
        
        try {
            await api.post('pagos/', {
                ticket: selectedTicket.id,
                monto: parseFloat(payAmount),
                metodo_pago: payMethod,
                estado: 'PAGADO'
            });
            
            setShowPayModal(false);
            setPayAmount('');
            
            setInfoModal({ 
                show: true, 
                title: 'Pago Exitoso', 
                message: 'El pago ha sido registrado en caja correctamente.', 
                type: 'success' 
            });
            
            fetchCaja(); 
            fetchTableData(); 
            
        } catch (error) {
            const msg = error.response?.data?.error || "Error al realizar el pago";
            setInfoModal({ show: true, title: 'Error de Pago', message: msg, type: 'error' });
        }
    };

    const confirmExtorno = (ticket) => {
        setSelectedTicket(ticket);
        setShowExtornoModal(true);
    };

    const handleExtorno = async () => {
        try {
            const res = await api.get(`pagos/?search=${selectedTicket.numero_ticket}`);
            const pagos = res.data.results || res.data;
            
            const hoy = new Date().toLocaleDateString('en-CA'); 
            const pagoExtornable = pagos.find(p => p.estado === 'PAGADO' && p.fecha_pago.startsWith(hoy));

            if (!pagoExtornable) {
                setShowExtornoModal(false);
                return alert("No hay pago válido de HOY para extornar.");
            }

            await api.post(`pagos/${pagoExtornable.id}/anular/`);
            
            setShowExtornoModal(false);
            
            setInfoModal({ 
                show: true, 
                title: 'Extorno Exitoso', 
                message: 'El dinero ha retornado al ticket y se descontó de caja.', 
                type: 'success' 
            });

            fetchCaja();
            fetchTableData();
        } catch (e) { 
            console.error(e);
            alert("Error al extornar: " + (e.response?.data?.error || "Error de conexión")); 
        }
    };

    // --- HISTORIAL ---
    const openSessionsHistory = async () => {
        setShowSessionsModal(true);
        try {
            const res = await api.get('pagos/caja/');
            setSessionsList(res.data.results || res.data);
        } catch (e) { console.error(e); }
    };

    const openSessionTimeline = async (session) => {
        setSelectedSessionInfo(session);
        setShowTimelineModal(true);
        setSelectedSessionTimeline([]); 
        try {
            const res = await api.get(`pagos/caja/${session.id}/timeline/`);
            setSelectedSessionTimeline(res.data);
        } catch (e) { console.error(e); }
    };

    // --- LOADING ---
    if (loading) {
        return <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>;
    }

    // --- VISTA CAJA CERRADA ---
    if (!caja) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><Unlock size={32}/></div>
                        <h1 className="text-xl font-black dark:text-white">Apertura de Caja</h1>
                        <p className="text-gray-500 text-sm">Ingrese los saldos iniciales para comenzar.</p>
                    </div>

                    {/* CHECKBOX IMPORTAR */}
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3 border border-blue-100 dark:border-blue-800">
                        <input 
                            type="checkbox" 
                            id="importarCierre" 
                            onChange={handleImportarCierre}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="importarCierre" className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-pointer select-none flex-1 flex items-center gap-2">
                             <ArrowDownCircle size={16}/> Importar saldos del último cierre
                        </label>
                    </div>

                    {/* FORMULARIO GRID - ESTILO UNIFICADO */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { id: 'EFECTIVO', label: 'Efectivo', icon: DollarSign },
                            { id: 'YAPE', label: 'Yape', icon: CreditCard },
                            { id: 'PLIN', label: 'Plin', icon: CreditCard },
                            { id: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
                        ].map((field) => (
                             <div key={field.id} className="relative">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                                <div className="relative">
                                    <field.icon className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                    <input 
                                        type="number" 
                                        value={aperturaValues[field.id]} 
                                        onChange={e => setAperturaValues({...aperturaValues, [field.id]: e.target.value})}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl font-bold text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.00"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setShowConfirmAbrir(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        Abrir Turno
                    </button>
                    
                    <div className="mt-6 border-t pt-4 dark:border-gray-700 text-center">
                         <button onClick={openSessionsHistory} className="text-sm text-gray-500 hover:text-emerald-600 hover:underline flex items-center justify-center gap-2 mx-auto">
                            <Clock size={14}/> Ver Historial de Cajas
                        </button>
                    </div>
                </div>

                {/* MODAL CONFIRMACIÓN APERTURA */}
                {showConfirmAbrir && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">Confirmar Apertura</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Se abrirá la caja con los siguientes saldos:<br/>
                                <span className="font-bold text-emerald-600">Efectivo: S/ {parseFloat(aperturaValues.EFECTIVO || 0).toFixed(2)}</span><br/>
                                <span className="text-xs">Otros: S/ {(parseFloat(aperturaValues.YAPE || 0) + parseFloat(aperturaValues.PLIN || 0) + parseFloat(aperturaValues.TARJETA || 0)).toFixed(2)}</span>
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowConfirmAbrir(false)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold dark:bg-gray-700 dark:text-white">Cancelar</button>
                                <button onClick={confirmarApertura} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold">Sí, Abrir</button>
                            </div>
                        </div>
                    </div>
                )}

                {showSessionsModal && renderSessionsModal()}
                {showTimelineModal && renderTimelineModal()}
            </div>
        );
    }

    // --- RENDER MODALES AUXILIARES ---
    function renderSessionsModal() {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Clock size={20}/> Historial</h3>
                        <button onClick={() => setShowSessionsModal(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 border rounded-xl dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                <tr>
                                    <th className="p-3">Apertura</th>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3 text-right">Saldo Final</th>
                                    <th className="p-3 text-center">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {sessionsList.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-3 text-xs">{new Date(s.fecha_apertura).toLocaleString()}</td>
                                        {/* CORREGIDO: Usamos usuario_nombre en lugar de usuario (ID) */}
                                        <td className="p-3 font-medium">{s.usuario_nombre || `ID: ${s.usuario}`}</td>
                                        <td className="p-3 text-right font-bold">S/ {s.saldo_actual?.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => openSessionTimeline(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {sessionsList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">No hay registros de cajas anteriores.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    function renderTimelineModal() {
        if (!selectedSessionInfo) return null;
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-4xl shadow-2xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-start mb-4 border-b pb-4 dark:border-gray-700">
                        <h3 className="text-xl font-bold flex items-center gap-2"><FileText size={24}/> Diario Electrónico</h3>
                        <button onClick={() => setShowTimelineModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full dark:bg-gray-700"><X size={20}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border dark:border-gray-700">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-3 text-left">Hora</th>
                                    <th className="pb-3 text-left">Evento</th>
                                    <th className="pb-3 text-left">Descripción</th>
                                    <th className="pb-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                                {selectedSessionTimeline.map((ev, idx) => (
                                    <tr key={idx} className={ev.estado === 'ANULADO' ? 'opacity-50 line-through' : ''}>
                                        <td className="py-2 text-xs font-mono">{new Date(ev.fecha).toLocaleTimeString()}</td>
                                        <td className="py-2 text-xs font-bold">{ev.tipo_evento}</td>
                                        <td className="py-2">{ev.descripcion}</td>
                                        <td className={`py-2 text-right font-mono ${ev.es_entrada ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {ev.es_entrada ? '+' : '-'} S/ {parseFloat(ev.monto).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA PRINCIPAL ---
    return (
        <div className="p-6 h-full flex flex-col text-gray-800 dark:text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Wallet className="text-emerald-500"/> Gestión de Caja
                    </h1>
                    <p className="text-gray-500 text-xs">Cajero: <strong>{caja?.usuario_nombre || caja?.usuario}</strong></p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openSessionsHistory} className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex gap-2 items-center shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
                        <Clock size={16}/> Historial
                    </button>
                    <button onClick={() => setShowCerrar(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black flex gap-2 items-center shadow-lg">
                        <Lock size={16}/> Cerrar Caja
                    </button>
                </div>
            </div>

            {/* Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                
                {/* 1. Saldo Total (VERDE ESMERALDA OSCURO & REDISEÑADO) */}
                <div className="bg-emerald-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex items-center h-36">
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12"><DollarSign size={150}/></div>
                    
                    {/* IZQUIERDA: Global (Dominante y Gigante) */}
                    <div className="flex-1 flex flex-col justify-center border-r border-emerald-600/30 pr-4 relative z-10">
                        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Total</p>
                        <p className="text-5xl font-black tracking-tighter leading-none">S/ {caja?.saldo_actual?.toFixed(2) ?? '0.00'}</p>
                    </div>

                    {/* DERECHA: Desglose Vertical */}
                    <div className="w-[45%] pl-4 flex flex-col justify-center h-full relative z-10 space-y-3">
                        
                        {/* Mitad Arriba: Efectivo */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-emerald-100 text-[10px] font-bold uppercase opacity-80">Efectivo</span>
                                <span className="text-xl font-bold leading-none whitespace-nowrap">S/ {caja?.total_efectivo?.toFixed(2) ?? '0.00'}</span>
                            </div>
                            <div className="h-1 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white/40 w-full"></div>
                            </div>
                        </div>

                        {/* Mitad Abajo: Digital + Desglose Detallado */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-emerald-100 text-[10px] font-bold uppercase opacity-80">Digital</span>
                                <span className="text-xl font-bold leading-none whitespace-nowrap">S/ {caja?.total_digital?.toFixed(2) ?? '0.00'}</span>
                            </div>
                            {/* Desglose Vertical Compacto con Nombres Completos */}
                            <div className="flex flex-col text-[9px] font-medium text-emerald-100 bg-emerald-800/40 rounded px-2 py-1 mt-1 space-y-0.5">
                                <div className="flex justify-between"><span>Yape:</span> <span>S/ {caja?.desglose_pagos?.YAPE?.toFixed(2) ?? '0.00'}</span></div>
                                <div className="flex justify-between"><span>Plin:</span> <span>S/ {caja?.desglose_pagos?.PLIN?.toFixed(2) ?? '0.00'}</span></div>
                                <div className="flex justify-between"><span>Tarjeta:</span> <span>S/ {caja?.desglose_pagos?.TARJETA?.toFixed(2) ?? '0.00'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Ventas Totales */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center h-36">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Ventas Turno</p>
                        <CreditCard className="text-blue-500 opacity-50" size={24}/>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">S/ {caja?.total_ventas?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-gray-400 mt-1">Acumulado Tickets</p>
                </div>

                {/* 3. Otros Movimientos */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center h-36">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Salidas / Gastos</p>
                        <ArrowDownLeft className="text-red-500 opacity-50" size={24}/>
                    </div>
                    <p className="text-3xl font-black text-red-600">S/ {caja?.total_gastos?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-gray-400 mt-1">Movimientos Manuales</p>
                </div>
            </div>

            {/* Toolbar Filtros */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 flex gap-3 flex-wrap items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm outline-none dark:border-gray-700"/>
                </div>
                
                <div className="flex gap-2 items-center">
                    <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="p-2 bg-gray-50 border rounded-lg text-xs font-bold dark:bg-gray-900 dark:border-gray-700 dark:text-white"/>
                    <span className="text-gray-400">-</span>
                    <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="p-2 bg-gray-50 border rounded-lg text-xs font-bold dark:bg-gray-900 dark:border-gray-700 dark:text-white"/>
                </div>

                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="p-2 bg-gray-50 border rounded-lg text-sm font-bold outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                    <option value="TODOS">Todos</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="PAGADO">Pagados</option>
                </select>
                <button onClick={() => {fetchCaja(); fetchTableData();}} className="p-2 bg-gray-100 rounded-lg dark:bg-gray-700"><RefreshCw size={18}/></button>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-bold text-gray-500 sticky top-0">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Ticket</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Método</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Saldo</th>
                                <th className="p-4 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {tickets.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4 text-xs text-gray-500">{new Date(t.creado_en).toLocaleString([],{month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                                    <td className="p-4 font-bold text-blue-600">{t.numero_ticket}</td>
                                    <td className="p-4 font-medium">{t.cliente_nombre}</td>
                                    <td className="p-4 text-xs font-bold">{t.saldo_pendiente<=0?t.ultimo_metodo_pago:'---'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${t.saldo_pendiente>0?'bg-red-100 text-red-700 border-red-200':'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                            {t.saldo_pendiente>0?'Pendiente':'Pagado'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-red-600">
                                        {t.saldo_pendiente>0 && `S/ ${t.saldo_pendiente.toFixed(2)}`}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        {t.saldo_pendiente > 0 ? (
                                            <button onClick={() => { setSelectedTicket(t); setPayAmount(t.saldo_pendiente); setShowPayModal(true); }} className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg tooltip" title="Cobrar"><DollarSign size={16}/></button>
                                        ) : (
                                            <button onClick={() => confirmExtorno(t)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg tooltip" title="Extornar"><RotateCcw size={16}/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-between dark:border-gray-700">
                    <button disabled={!prevUrl} onClick={()=>fetchTableData(prevUrl)} className="text-xs font-bold text-blue-600 disabled:text-gray-400">Anterior</button>
                    <button disabled={!nextUrl} onClick={()=>fetchTableData(nextUrl)} className="text-xs font-bold text-blue-600 disabled:text-gray-400">Siguiente</button>
                </div>
            </div>

            {/* MODAL COBRAR */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Registrar Cobro</h3>
                        <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} className="w-full p-3 border rounded-xl font-bold mb-4 dark:bg-gray-900 dark:border-gray-600" placeholder="Monto"/>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['EFECTIVO','YAPE','PLIN','TARJETA'].map(m=><button key={m} onClick={()=>setPayMethod(m)} className={`p-2 rounded-lg text-xs font-bold border ${payMethod===m?'bg-blue-600 text-white':'bg-white dark:bg-gray-700'}`}>{m}</button>)}
                        </div>
                        <button onClick={handleRegisterPayment} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Cobrar</button>
                        <button onClick={()=>setShowPayModal(false)} className="w-full mt-2 text-gray-500 text-sm">Cancelar</button>
                    </div>
                </div>
            )}

            {/* MODAL INFORMATIVO GENÉRICO (Reemplazo de Alerts) */}
            {infoModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center border border-gray-100 dark:border-gray-700">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            infoModal.type === 'error' ? 'bg-red-100 text-red-500' : 
                            infoModal.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-blue-100 text-blue-500'
                        }`}>
                            {infoModal.type === 'error' ? <AlertTriangle size={24}/> : <CheckCircle size={24}/>}
                        </div>
                        <h3 className="text-lg font-bold mb-2 dark:text-white">{infoModal.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{infoModal.message}</p>
                        <button 
                            onClick={() => setInfoModal({ ...infoModal, show: false })} 
                            className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 text-white py-2.5 rounded-xl font-bold transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            
            {/* MODAL EXTORNO ADVERTENCIA */}
            {showExtornoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-xs shadow-2xl text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={24}/></div>
                        <h3 className="text-lg font-bold mb-2">¿Confirmar Extorno?</h3>
                        <p className="text-sm text-gray-500 mb-6">El pago del ticket <span className="font-bold">{selectedTicket?.numero_ticket}</span> será anulado y el dinero descontado de caja.</p>
                        <div className="flex gap-2">
                             <button onClick={()=>setShowExtornoModal(false)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold dark:bg-gray-700">Cancelar</button>
                             <button onClick={handleExtorno} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">Sí, Extornar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CIERRE DE CAJA DETALLADO (Sin Transferencia) */}
            {showCerrar && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Lock size={20}/> Cierre y Cuadre de Caja</h3>
                            
                            {/* CHECKBOX AUTOCOMPLETAR */}
                            <label className="flex items-center gap-2 text-sm text-blue-600 font-bold cursor-pointer hover:text-blue-700">
                                <input type="checkbox" onChange={handleAutoFillCierre} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                Autocompletar con saldos del sistema
                            </label>
                        </div>
                        
                        <div className="overflow-hidden border rounded-xl mb-4 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="p-3 text-left">Método</th>
                                        <th className="p-3 text-right">Sistema</th>
                                        <th className="p-3 text-right w-32">Real (Físico)</th>
                                        <th className="p-3 text-right">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA'].map(metodo => {
                                        const sistema = parseFloat(caja?.desglose_pagos?.[metodo] || 0);
                                        const real = parseFloat(cierreDetalle[metodo] || 0);
                                        const diff = real - sistema;
                                        return (
                                            <tr key={metodo}>
                                                <td className="p-3 font-bold text-xs">{metodo}</td>
                                                <td className="p-3 text-right text-gray-500">S/ {sistema.toFixed(2)}</td>
                                                <td className="p-2">
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-1 text-right border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-600 font-bold"
                                                        value={cierreDetalle[metodo]}
                                                        onChange={e => setCierreDetalle({...cierreDetalle, [metodo]: e.target.value})}
                                                    />
                                                </td>
                                                <td className={`p-3 text-right font-bold text-xs ${diff === 0 ? 'text-gray-300' : diff < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {diff.toFixed(2)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {/* Mostrar Transferencia SOLO si hay saldo (para no perder el rastro si hubo alguna) */}
                                    {parseFloat(caja?.desglose_pagos?.TRANSFERENCIA || 0) > 0 && (
                                        <tr>
                                            <td className="p-3 font-bold text-xs text-purple-500">TRANSF.</td>
                                            <td className="p-3 text-right text-gray-500">S/ {parseFloat(caja?.desglose_pagos?.TRANSFERENCIA).toFixed(2)}</td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    className="w-full p-1 text-right border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-600 font-bold"
                                                    value={cierreDetalle.TRANSFERENCIA}
                                                    onChange={e => setCierreDetalle({...cierreDetalle, TRANSFERENCIA: e.target.value})}
                                                />
                                            </td>
                                            <td className="p-3 text-right font-bold text-xs text-gray-400">
                                                {(parseFloat(cierreDetalle.TRANSFERENCIA || 0) - parseFloat(caja?.desglose_pagos?.TRANSFERENCIA || 0)).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <textarea 
                            value={cierreDetalle.comentarios} 
                            onChange={e=>setCierreDetalle({...cierreDetalle, comentarios:e.target.value})} 
                            className="w-full p-3 border rounded-xl mb-4 h-16 text-sm dark:bg-gray-900 dark:border-gray-600" 
                            placeholder="Comentarios adicionales..."
                        />
                        <div className="flex gap-2">
                             <button onClick={()=>setShowCerrar(false)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold dark:bg-gray-700">Cancelar</button>
                             <button onClick={handleCerrar} className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold">Cerrar Turno</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Payments