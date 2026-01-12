import { useState, useEffect } from 'react';
import { 
    Wallet, Search, ArrowUpRight, ArrowDownLeft, 
    DollarSign, CreditCard, Lock, RotateCcw, 
    RefreshCw, X, Clock, FileText, Calendar, User, Eye, AlertTriangle,
    CheckCircle, Unlock, ArrowDownCircle, AlertCircle, PlusCircle, MinusCircle, BookOpen
} from 'lucide-react';
import api from '../api/axiosConfig';

const Payments = () => {
    // --- ESTADOS ---
    const [caja, setCaja] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Tabla y Filtros Tickets
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
  
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);

    // Modales Operativos
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showCerrar, setShowCerrar] = useState(false);
    
    // Nuevo: Modal Movimiento Manual
    const [showMovimientoModal, setShowMovimientoModal] = useState(false);
    const [movimientoForm, setMovimientoForm] = useState({
        tipo: 'EGRESO', // o INGRESO
        categoria: 'OTROS',
        monto: '',
        metodo_pago: 'EFECTIVO',
        descripcion: ''
    });

    // Sistema de Modales Unificado
    const [modalConfig, setModalConfig] = useState({ 
        show: false, 
        title: '', 
        message: '', 
        type: 'info', 
        action: null,
        confirmText: 'Aceptar',
        showCancel: false
    });

    // --- MODAL DIARIO ELECTRONICO (HISTORIAL) ---
    const [showDiarioModal, setShowDiarioModal] = useState(false);
    const [loadingDiario, setLoadingDiario] = useState(false);
    // Filtro por defecto: HOY
    const today = new Date().toISOString().split('T')[0];
    const [diarioFilters, setDiarioFilters] = useState({ desde: today, hasta: today });
    const [diarioEvents, setDiarioEvents] = useState([]);
    
    // Modal Detalle (Ojo)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailContent, setDetailContent] = useState(null);

    // Formularios Apertura/Cobro
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

    // --- HELPERS MODALES ---
    const showModal = (title, message, type = 'info') => {
        setModalConfig({ show: true, title, message, type, showCancel: false, confirmText: 'Entendido' });
    };

    const showConfirm = (title, message, action, type = 'warning', confirmText = 'Confirmar') => {
        setModalConfig({ show: true, title, message, type, action, showCancel: true, confirmText });
    };

    const closeModal = () => setModalConfig({ ...modalConfig, show: false });

    // --- CARGA INICIAL ---
    const fetchCaja = async () => {
        setLoading(true);
        try {
            const res = await api.get('pagos/caja/mi_caja/');
            setCaja(res.data);
            fetchTableData(); 
        } catch (error) {
            console.error("Error cargando caja", error);
            fetchTableData();
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
    useEffect(() => { fetchTableData(); }, [searchTerm, statusFilter, fechaDesde, fechaHasta]);

    // --- ACCIONES DE CAJA ---
    
    const handleImportarCierre = async (e) => {
        if (!e.target.checked) {
            setAperturaValues({ EFECTIVO: '', YAPE: '', PLIN: '', TARJETA: '' });
            return;
        }

        try {
            const res = await api.get('pagos/caja/ultimo_cierre/');
            if (!res.data) {
                showModal("Sin Datos", "No se encontró un cierre anterior para importar.", "warning");
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
            showModal("Error", "Error al obtener datos del último cierre.", "error");
            e.target.checked = false;
        }
    };

    const executeApertura = async () => {
        const montoEfectivo = parseFloat(aperturaValues.EFECTIVO) || 0;
        const detalle = {
            YAPE: parseFloat(aperturaValues.YAPE) || 0,
            PLIN: parseFloat(aperturaValues.PLIN) || 0,
            TARJETA: parseFloat(aperturaValues.TARJETA) || 0
        };

        if(montoEfectivo < 0) return showModal("Error", "El monto no puede ser negativo", "error");

        try {
            closeModal(); 
            const res = await api.post('pagos/caja/abrir/', { 
                monto_inicial: montoEfectivo, 
                detalle_apertura: detalle      
            });
            setCaja(res.data);
            fetchTableData();
        } catch (e) { 
            showModal("Error de Apertura", e.response?.data?.error || "Error al abrir", "error");
        }
    };

    const onConfirmAperturaClick = () => {
        const total = (parseFloat(aperturaValues.EFECTIVO)||0) + (parseFloat(aperturaValues.YAPE)||0) + (parseFloat(aperturaValues.PLIN)||0) + (parseFloat(aperturaValues.TARJETA)||0);
        showConfirm(
            "Confirmar Apertura",
            `Se iniciará el turno con un saldo inicial total de S/ ${total.toFixed(2)}.`,
            executeApertura,
            "info",
            "Sí, Abrir Caja"
        );
    };

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

    const executeCierre = async () => {
        const totalReal = Object.keys(cierreDetalle)
            .filter(k => k !== 'comentarios')
            .reduce((sum, key) => sum + (parseFloat(cierreDetalle[key]) || 0), 0);

        const detalleTexto = Object.keys(cierreDetalle)
            .filter(k => k !== 'comentarios' && cierreDetalle[k])
            .map(k => `${k}: S/${cierreDetalle[k]}`).join(', ');
        
        const comentarioFinal = `${cierreDetalle.comentarios} | Detalle Cierre: [ ${detalleTexto} ]`;

        try {
            closeModal();
            await api.post(`pagos/caja/${caja.id}/cerrar/`, { 
                monto_real: totalReal,
                comentarios: comentarioFinal,
                detalle_cierre: cierreDetalle
            });
            setCaja(null);
            setShowCerrar(false);
            setTickets([]);
            setCierreDetalle({EFECTIVO: '', YAPE: '', PLIN: '', TARJETA: '', comentarios: ''});
            showModal("Turno Cerrado", "La caja ha sido cerrada exitosamente.", "success");
        } catch (e) { 
            showModal("Error al Cerrar", e.response?.data?.error || "Error interno", "error");
        }
    };

    const handleCerrarClick = () => {
        const totalReal = Object.keys(cierreDetalle)
            .filter(k => k !== 'comentarios')
            .reduce((sum, key) => sum + (parseFloat(cierreDetalle[key]) || 0), 0);
            
        if(totalReal <= 0) {
            showConfirm("¿Cierre en CERO?", "Estás cerrando la caja con S/ 0.00. ¿Es correcto?", executeCierre, "warning", "Sí, Cerrar");
        } else {
            executeCierre();
        }
    };

    // --- NUEVO: MOVIMIENTOS MANUALES ---
    const handleRegisterMovimiento = async () => {
        if (!movimientoForm.monto || parseFloat(movimientoForm.monto) <= 0) {
            return showModal("Error", "Ingrese un monto válido", "error");
        }
        if (!movimientoForm.categoria) {
             return showModal("Error", "Ingrese una categoría (ej. Proveedor, Personal)", "error");
        }

        try {
            await api.post(`pagos/caja/${caja.id}/movimiento/`, {
                tipo: movimientoForm.tipo,
                monto: parseFloat(movimientoForm.monto),
                categoria: movimientoForm.categoria,
                metodo_pago: movimientoForm.metodo_pago,
                descripcion: movimientoForm.descripcion
            });
            
            setShowMovimientoModal(false);
            setMovimientoForm({ tipo: 'EGRESO', categoria: 'OTROS', monto: '', metodo_pago: 'EFECTIVO', descripcion: '' });
            showModal("Registrado", "Movimiento registrado correctamente en caja.", "success");
            fetchCaja(); 
            // Si el diario está abierto, actualizarlo también
            if (showDiarioModal) fetchDiario();
        } catch (e) {
            showModal("Error", e.response?.data?.error || "Error al registrar movimiento", "error");
        }
    };

    // --- COBROS Y EXTORNOS ---
    const handleRegisterPayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            showModal("Monto Inválido", "Ingrese un monto mayor a 0", "error");
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
            showModal("Pago Exitoso", "El pago ha sido registrado en caja correctamente.", "success");
            
            fetchCaja(); 
            fetchTableData(); 
            if (showDiarioModal) fetchDiario();
            
        } catch (error) {
            showModal("Error de Pago", error.response?.data?.error || "Error al realizar el pago", "error");
        }
    };

    const executeExtorno = async () => {
        try {
            closeModal();
            const res = await api.get(`pagos/?search=${selectedTicket.numero_ticket}`);
            const pagos = res.data.results || res.data;
            const pagoExtornable = pagos.find(p => p.estado === 'PAGADO' && p.es_anulable);

            if (!pagoExtornable) {
                return showModal("No Extornable", "No se encontró un pago válido de HOY para este ticket.", "warning");
            }

            await api.post(`pagos/${pagoExtornable.id}/anular/`);
            showModal("Extorno Exitoso", "El dinero ha retornado al ticket y se descontó de caja.", "success");

            fetchCaja();
            fetchTableData();
            if (showDiarioModal) fetchDiario();
        } catch (e) { 
            showModal("Error", "Error al extornar: " + (e.response?.data?.error || "Error de conexión"), "error");
        }
    };

    const confirmExtorno = (ticket) => {
        setSelectedTicket(ticket);
        showConfirm("¿Confirmar Extorno?", 
            `El pago del ticket ${ticket.numero_ticket} será anulado y el dinero descontado de caja.`, 
            executeExtorno, 
            "error", 
            "Sí, Extornar"
        );
    };

    // --- DIARIO ELECTRONICO (Historial) ---
    const fetchDiario = async () => {
        setLoadingDiario(true);
        setDiarioEvents([]);
        try {
            const params = new URLSearchParams();
            if (diarioFilters.desde) params.append('fecha_desde', diarioFilters.desde);
            if (diarioFilters.hasta) params.append('fecha_hasta', diarioFilters.hasta);
            
            // Llamamos al nuevo endpoint que consolida movimientos por fecha
            const res = await api.get(`pagos/caja/diario/?${params.toString()}`);
            setDiarioEvents(res.data);
        } catch (e) { 
            console.error("Error historial diario:", e);
        } finally {
            setLoadingDiario(false);
        }
    };

    const openDiarioModal = () => {
        setShowDiarioModal(true);
        // Si no hay filtros, usar HOY por defecto
        if (!diarioFilters.desde) setDiarioFilters({ desde: today, hasta: today });
        fetchDiario();
    };
    
    const openTransactionDetail = (item) => {
        setDetailContent(item);
        setShowDetailModal(true);
    };

    // --- RENDERIZADO ---
    if (loading) {
        return <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>;
    }

    // --- MODAL CONFIG (REUTILIZABLE) ---
    const renderGlobalModal = () => (
        modalConfig.show && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center border border-gray-100 dark:border-gray-700">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        modalConfig.type === 'error' ? 'bg-red-100 text-red-500' : 
                        modalConfig.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 
                        modalConfig.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-500'
                    }`}>
                        {modalConfig.type === 'error' ? <AlertTriangle size={24}/> : 
                         modalConfig.type === 'success' ? <CheckCircle size={24}/> : 
                         modalConfig.type === 'warning' ? <AlertCircle size={24}/> : <CheckCircle size={24}/>}
                    </div>
                    <h3 className="text-lg font-bold mb-2 dark:text-white">{modalConfig.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{modalConfig.message}</p>
                    <div className="flex gap-2">
                        {modalConfig.showCancel && (
                            <button onClick={closeModal} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold dark:bg-gray-700 dark:text-white hover:bg-gray-200">
                                Cancelar
                            </button>
                        )}
                        <button 
                            onClick={modalConfig.action || closeModal} 
                            className={`flex-1 text-white py-2.5 rounded-xl font-bold transition-colors ${
                                modalConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                                modalConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 
                                modalConfig.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700'
                            }`}
                        >
                            {modalConfig.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        )
    );

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

                    <button onClick={onConfirmAperturaClick} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        Abrir Turno
                    </button>
                    
                    <div className="mt-6 border-t pt-4 dark:border-gray-700 text-center">
                         <button onClick={openDiarioModal} className="text-sm text-gray-500 hover:text-emerald-600 hover:underline flex items-center justify-center gap-2 mx-auto">
                            <Clock size={14}/> Ver Historial de Cajas
                        </button>
                    </div>
                </div>

                {renderGlobalModal()}
                {showDiarioModal && renderDiarioModal()}
                {showDetailModal && renderDetailModal()}
            </div>
        );
    }

    // --- MODAL DIARIO ELECTRONICO UNIFICADO ---
    function renderDiarioModal() {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-5xl shadow-2xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-4 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen size={24}/> Diario Electrónico</h3>
                            <p className="text-xs text-gray-500 mt-1">Historial detallado de movimientos</p>
                        </div>
                        <button onClick={() => setShowDiarioModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full dark:bg-gray-700"><X size={20}/></button>
                    </div>
                    
                    {/* Filtros de Fecha */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl mb-4 flex gap-3 items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Periodo:</span>
                        <input type="date" value={diarioFilters.desde} onChange={e=>setDiarioFilters({...diarioFilters, desde: e.target.value})} className="p-2 border rounded-lg text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"/>
                        <span className="text-gray-400">-</span>
                        <input type="date" value={diarioFilters.hasta} onChange={e=>setDiarioFilters({...diarioFilters, hasta: e.target.value})} className="p-2 border rounded-lg text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"/>
                        <button onClick={fetchDiario} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-2"><Search size={14}/> Filtrar</button>
                    </div>

                    <div className="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-0 border dark:border-gray-700 relative">
                         {loadingDiario && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        )}
                        
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                                <tr className="text-gray-500 text-xs uppercase font-bold">
                                    <th className="p-4 text-left w-32">Hora</th>
                                    <th className="p-4 text-left">Movimiento</th>
                                    <th className="p-4 text-right w-32">Monto</th>
                                    <th className="p-4 text-left pl-8 w-40">Usuario</th>
                                    <th className="p-4 text-center w-24">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                                {diarioEvents.map((ev, idx) => (
                                    <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${ev.estado === 'ANULADO' ? 'opacity-50 line-through' : ''}`}>
                                        <td className="p-4 text-xs font-mono text-gray-500">
                                            {/* Mostrar fecha si es distinta a hoy, sino solo hora */}
                                            {new Date(ev.fecha).toLocaleDateString() === new Date().toLocaleDateString() 
                                                ? new Date(ev.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                                : new Date(ev.fecha).toLocaleString([], {month:'numeric', day:'numeric', hour: '2-digit', minute:'2-digit'})
                                            }
                                        </td>
                                        
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-bold text-sm text-gray-800 dark:text-gray-200">
                                                {ev.tipo_evento === 'VENTA' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                                {ev.tipo_evento === 'EGRESO' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                                {ev.tipo_evento === 'INGRESO' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                {ev.tipo_evento === 'APERTURA' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                                {ev.tipo_evento === 'CIERRE' && <div className="w-2 h-2 rounded-full bg-gray-900"></div>}
                                                {ev.descripcion}
                                            </div>
                                        </td>
                                        
                                        <td className={`p-4 text-right font-mono font-bold text-sm ${
                                            ev.es_entrada === true ? 'text-emerald-600' : 
                                            ev.es_entrada === false ? 'text-red-600' : 'text-gray-800 dark:text-gray-300'
                                        }`}>
                                            {ev.es_entrada !== null ? (ev.es_entrada ? '+' : '-') : ''} S/ {parseFloat(ev.monto).toFixed(2)}
                                        </td>
                                        
                                        <td className="p-4 pl-8 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                            {ev.usuario}
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => openTransactionDetail(ev)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Ver Detalle"
                                            >
                                                <Eye size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loadingDiario && diarioEvents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay movimientos registrados en este periodo.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    function renderDetailModal() {
        if (!showDetailModal || !detailContent) return null;
        
        return (
            <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                    <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={18}/></button>
                    
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                        {detailContent.tipo_evento === 'VENTA' ? <CreditCard size={18} className="text-blue-500"/> : 
                         detailContent.tipo_evento === 'APERTURA' ? <Unlock size={18} className="text-emerald-500"/> :
                         <FileText size={18} className="text-gray-500"/>}
                        Detalle de Transacción
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 font-mono">{new Date(detailContent.fecha).toLocaleString()}</p>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4 border dark:border-gray-700">
                        {detailContent.detalles && Object.keys(detailContent.detalles).length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {Object.entries(detailContent.detalles).map(([key, value]) => (
                                    <li key={key} className="flex justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 pb-1 last:pb-0">
                                        <span className="font-bold text-gray-500 text-xs uppercase">{key}:</span>
                                        <span className="font-mono font-medium dark:text-gray-200">
                                            {typeof value === 'number' ? `S/ ${value.toFixed(2)}` : value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-400 text-xs italic">Sin detalles adicionales registrados.</p>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                         <span className="text-xs font-bold uppercase text-gray-500">Monto Total</span>
                         <span className="text-xl font-black text-gray-800 dark:text-white">S/ {parseFloat(detailContent.monto).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- NUEVO: MODAL REGISTRO MANUAL ---
    function renderMovimientoModal() {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                         <Wallet size={20}/> Registrar {movimientoForm.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                    </h3>
                    
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4 dark:bg-gray-700">
                        <button 
                            onClick={()=>setMovimientoForm({...movimientoForm, tipo: 'INGRESO'})}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${movimientoForm.tipo === 'INGRESO' ? 'bg-white shadow text-emerald-600 dark:bg-gray-600 dark:text-emerald-400' : 'text-gray-500'}`}
                        >
                            INGRESO (+)
                        </button>
                        <button 
                             onClick={()=>setMovimientoForm({...movimientoForm, tipo: 'EGRESO'})}
                             className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${movimientoForm.tipo === 'EGRESO' ? 'bg-white shadow text-red-600 dark:bg-gray-600 dark:text-red-400' : 'text-gray-500'}`}
                        >
                            GASTO (-)
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Categoría</label>
                            <input 
                                list="categorias" 
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                value={movimientoForm.categoria}
                                onChange={e => setMovimientoForm({...movimientoForm, categoria: e.target.value})}
                                placeholder="Ej. Proveedor, Personal, Vuelto..."
                            />
                            <datalist id="categorias">
                                <option value="PAGO PROVEEDOR"/>
                                <option value="PAGO PERSONAL"/>
                                <option value="SERVICIOS"/>
                                <option value="SOBRANTE CAJA"/>
                                <option value="OTROS"/>
                            </datalist>
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">S/</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-8 p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                    value={movimientoForm.monto}
                                    onChange={e => setMovimientoForm({...movimientoForm, monto: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Método de Pago</label>
                            <select 
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                value={movimientoForm.metodo_pago}
                                onChange={e => setMovimientoForm({...movimientoForm, metodo_pago: e.target.value})}
                            >
                                <option value="EFECTIVO">EFECTIVO</option>
                                <option value="YAPE">YAPE</option>
                                <option value="PLIN">PLIN</option>
                                <option value="TARJETA">TARJETA</option>
                                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Nota (Opcional)</label>
                            <textarea 
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600 h-16 resize-none"
                                value={movimientoForm.descripcion}
                                onChange={e => setMovimientoForm({...movimientoForm, descripcion: e.target.value})}
                                placeholder="Detalles adicionales..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={()=>setShowMovimientoModal(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:bg-gray-700">Cancelar</button>
                        <button onClick={handleRegisterMovimiento} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-black">Guardar</button>
                    </div>
                </div>
            </div>
        )
    }

    // --- VISTA PRINCIPAL ---
    return (
        <div className="p-6 h-full flex flex-col text-gray-800 dark:text-gray-100 relative">
            {renderGlobalModal()}
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Wallet className="text-emerald-500"/> Gestión de Caja
                    </h1>
                    <p className="text-gray-500 text-xs">Cajero: <strong>{caja?.usuario_nombre || caja?.usuario}</strong></p>
                </div>
                <div className="flex gap-2">
                    {/* Botón Historial ahora abre el Diario Unificado */}
                    <button onClick={openDiarioModal} className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex gap-2 items-center shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
                        <Clock size={16}/> Historial / Diario
                    </button>
                    <button onClick={() => setShowCerrar(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black flex gap-2 items-center shadow-lg">
                        <Lock size={16}/> Cerrar Caja
                    </button>
                </div>
            </div>

            {/* Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                
                {/* 1. Saldo Total */}
                <div className="bg-emerald-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex items-center h-36">
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12"><DollarSign size={150}/></div>
                    
                    <div className="flex-1 flex flex-col justify-center border-r border-emerald-600/30 pr-4 relative z-10">
                        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Total</p>
                        <p className="text-5xl font-black tracking-tighter leading-none">S/ {caja?.saldo_actual?.toFixed(2) ?? '0.00'}</p>
                    </div>

                    <div className="w-[45%] pl-4 flex flex-col justify-center h-full relative z-10 space-y-3">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-emerald-100 text-[10px] font-bold uppercase opacity-80">Efectivo</span>
                                <span className="text-xl font-bold leading-none whitespace-nowrap">S/ {caja?.total_efectivo?.toFixed(2) ?? '0.00'}</span>
                            </div>
                            <div className="h-1 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white/40 w-full"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-emerald-100 text-[10px] font-bold uppercase opacity-80">Digital</span>
                                <span className="text-xl font-bold leading-none whitespace-nowrap">S/ {caja?.total_digital?.toFixed(2) ?? '0.00'}</span>
                            </div>
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

                {/* 3. Otros Movimientos (Con botón SUTIL abajo) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center h-36 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50"><ArrowDownLeft className="text-purple-500" size={24}/></div>
                    
                    {/* Botón abajo a la derecha, estilo pastilla */}
                    <button 
                        onClick={() => setShowMovimientoModal(true)}
                        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-black transition-transform active:scale-95 flex items-center gap-2 z-10 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        <PlusCircle size={16}/> Registrar
                    </button>

                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Ingresos / Gastos</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                             {((caja?.total_gastos || 0) > 0 ? '-' : '')} S/ {caja?.total_gastos?.toFixed(2) ?? '0.00'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Movimientos Manuales</p>
                    </div>
                </div>
            </div>

            {/* Toolbar Filtros Tickets */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 flex gap-3 flex-wrap items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input type="text" placeholder="Buscar ticket..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm outline-none dark:border-gray-700"/>
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

            {/* Tabla Principal (Tickets) */}
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
                                            t.es_extornable && (
                                                <button onClick={() => confirmExtorno(t)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg tooltip" title="Extornar"><RotateCcw size={16}/></button>
                                            )
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

            {/* MODAL CIERRE DE CAJA DETALLADO */}
            {showCerrar && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Lock size={20}/> Cierre y Cuadre de Caja</h3>
                            
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
                             <button onClick={handleCerrarClick} className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold">Cerrar Turno</button>
                        </div>
                    </div>
                 </div>
            )}

            {/* MODALES GLOBALES */}
            {showDiarioModal && renderDiarioModal()}
            {showDetailModal && renderDetailModal()}
            {showMovimientoModal && renderMovimientoModal()}
        </div>
    );
};

export default Payments;