import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Clock, X, AlertTriangle, CheckCircle, Trash2, Wallet, ArrowRight, DollarSign, MapPin, Printer, ChevronLeft, ChevronRight, User, AlertCircle, Lock, Ban, Truck, MessageSquare } from 'lucide-react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Tickets = () => {
    // --- ESTADOS ---
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Paginación
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal Detalle
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Acciones Modal
    const [newStatus, setNewStatus] = useState('');
    const [statusComment, setStatusComment] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelOptions, setShowCancelOptions] = useState(false);
    
    // Pago Rápido
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('EFECTIVO');

    // Sistema de Modales (Confirmación y Alertas)
    const [modalConfig, setModalConfig] = useState({ 
        show: false, 
        title: '', 
        message: '', 
        action: null,
        type: 'info', 
        confirmText: 'Confirmar'
    });

    const navigate = useNavigate();

    // --- HELPERS PARA MODALES ---
    const showAlert = (title, message, type = 'error') => {
        setModalConfig({
            show: true,
            title,
            message,
            type,
            action: null,
            confirmText: 'Entendido'
        });
    };

    const showConfirm = (title, message, action, type = 'warning', confirmText = 'Confirmar') => {
        setModalConfig({
            show: true,
            title,
            message,
            action,
            type,
            confirmText
        });
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, show: false });
    };

    // --- CARGA DE DATOS ---
    const fetchTickets = async (url = null) => {
        if(!url && !tickets.length) setLoading(true); 
        try {
            let endpoint = url;
            if (!endpoint) {
                const params = new URLSearchParams();
                if (statusFilter) params.append('estado', statusFilter);
                if (dateFrom) params.append('fecha_desde', dateFrom);
                if (dateTo) params.append('fecha_hasta', dateTo);
                endpoint = `tickets/?${params.toString()}`;
            }

            const response = await (url ? api.get(url) : api.get(endpoint));
            const data = response.data;

            const results = Array.isArray(data) ? data : data.results;
            setNextPage(data.next);
            setPrevPage(data.previous);
            
            const sorted = results.sort((a, b) => 
                new Date(b.creado_en) - new Date(a.creado_en)
            );
            setTickets(sorted);
        } catch (error) {
            console.error("Error cargando tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, [statusFilter, dateFrom, dateTo]);

    // --- HELPERS VISUALES ---
    const getStatusBadge = (status) => {
        const styles = {
            'RECIBIDO': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
            'EN_PROCESO': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
            'LISTO': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
            'ENTREGADO': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
            'CANCELADO': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getDateStatus = (ticket) => {
        if (['ENTREGADO', 'CANCELADO', 'LISTO'].includes(ticket.estado)) return null;

        const now = new Date();
        const promised = new Date(ticket.fecha_prometida);
        const isSameDay = now.toDateString() === promised.toDateString();

        if (promised < now && !isSameDay) {
            return { 
                className: 'border-l-4 border-red-500 bg-red-50/50 dark:bg-transparent dark:border-red-500', 
                text: 'VENCIDO PLAZO', 
                textColor: 'text-red-600 dark:text-red-400 font-bold' 
            };
        }
        if (isSameDay) {
            return { 
                className: 'border-l-4 border-orange-500 bg-orange-50/50 dark:bg-transparent dark:border-orange-500', 
                text: 'ENTREGA HOY', 
                textColor: 'text-orange-600 dark:text-orange-400 font-bold' 
            };
        }
        return null;
    };

    const getReadyTime = (ticket) => {
        if (ticket.estado !== 'LISTO') return null;
        const dateStr = ticket.actualizado_en || ticket.creado_en;
        if (!dateStr) return null;

        const updated = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
        
        return diffDays <= 0 ? "Desde hoy" : `Hace ${diffDays} días`;
    };

    // --- ACCIONES ---
    const handleViewDetails = async (id) => {
        setModalLoading(true);
        setSelectedTicket(null);
        setShowCancelOptions(false);
        setShowPayModal(false);
        setSuccessMsg('');
        setModalConfig({ ...modalConfig, show: false });
        try {
            const response = await api.get(`tickets/${id}/`);
            setSelectedTicket(response.data);
            setNewStatus(response.data.estado);
            setStatusComment('');
        } catch (error) {
            showAlert('Error', 'No se pudieron cargar los detalles del ticket.');
        } finally {
            setModalLoading(false);
        }
    };

    const executeStatusUpdate = async () => {
        setActionLoading(true);
        closeModal();
        try {
            await api.post(`tickets/${selectedTicket.id}/update_estado/`, {
                estado: newStatus,
                comentario: statusComment || "Actualización rápida"
            });
            setSuccessMsg('Estado actualizado');
            setTimeout(() => {
                setSuccessMsg(''); 
                handleViewDetails(selectedTicket.id); 
                fetchTickets(); 
            }, 1000); 
        } catch (error) {
            const msg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.error || "Error al actualizar estado";
            showAlert('Error al Actualizar', msg);
        } finally {
            setActionLoading(false);
        }
    };

    const onSaveStatusClick = () => {
        if (!selectedTicket || newStatus === selectedTicket.estado) return;
        if (newStatus === 'ENTREGADO' && selectedTicket.saldo_pendiente > 0) {
            showAlert('Restricción de Entrega', `Saldo pendiente: S/ ${selectedTicket.saldo_pendiente.toFixed(2)}. Debe saldar la cuenta.`, 'error');
            setNewStatus(selectedTicket.estado);
            return;
        }
        showConfirm('Confirmar Cambio', `¿Cambiar estado a "${newStatus}"?`, executeStatusUpdate, 'warning');
    };

    const executePayment = async () => {
        setActionLoading(true);
        try {
            await api.post('pagos/', {
                ticket: selectedTicket.id,
                monto: parseFloat(payAmount),
                metodo_pago: payMethod,
                estado: 'PAGADO',
                origen: 'TICKETS'
            });

            setShowPayModal(false);
            setPayAmount('');
            setModalConfig({ ...modalConfig, show: false });
            setSuccessMsg('Pago registrado correctamente');

            setTimeout(() => {
                setSuccessMsg(''); 
                handleViewDetails(selectedTicket.id);
                fetchTickets();
            }, 1500);

        } catch (error) {
            const serverError = error.response?.data?.error || error.response?.data?.detail || "No se pudo procesar el pago.";
            setModalConfig({ 
                show: true, 
                title: 'No se pudo pagar', 
                message: serverError,
                type: 'error', 
                confirmText: 'Entendido',
                action: null 
            });
        } finally {
            setActionLoading(false);
        }
    };

    const onRegisterPaymentClick = () => {
        if (!payAmount || parseFloat(payAmount) <= 0) return showAlert('Monto Inválido', 'Ingrese un monto mayor a 0.', 'warning');
        showConfirm('Confirmar Pago', `¿Pagar S/ ${parseFloat(payAmount).toFixed(2)} con ${payMethod}?`, executePayment, 'money');
    };

    const executeCancelTicket = async () => {
        setActionLoading(true);
        closeModal();
        try {
            await api.post(`tickets/${selectedTicket.id}/cancelar/`, { motivo: cancelReason });
            setSuccessMsg('Ticket cancelado');
            setTimeout(() => {
                setSuccessMsg('');
                setSelectedTicket(null); 
                fetchTickets(); 
            }, 1000);
        } catch (error) {
            showAlert('Error', error.response?.data?.error || "Error al cancelar.");
        } finally {
            setActionLoading(false);
        }
    };

    const onConfirmCancelClick = () => {
        if (!cancelReason.trim()) return showAlert('Motivo Obligatorio', 'Ingrese un motivo.', 'warning');
        showConfirm('¿Cancelar Ticket?', 'Esta acción anulará el servicio. ¿Está seguro?', executeCancelTicket, 'danger');
    };

    const handleReprintTicket = () => {
        if (!selectedTicket) return;
        const ticketWindow = window.open('', '_blank', 'width=400,height=600');
        const qrUrl = selectedTicket.qr_code_url || selectedTicket.qr_code;
        const html = `
            <html>
            <head>
                <title>Reimpresión Ticket #${selectedTicket.numero_ticket}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; text-align: center; }
                    .header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .info { text-align: left; margin-bottom: 10px; font-size: 11px; line-height: 1.4; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
                    th { text-align: left; border-bottom: 1px solid #000; font-weight: bold; }
                    td { padding: 4px 0; vertical-align: top; text-align: left;}
                    .text-right { text-align: right; }
                    .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 5px;}
                    .sub-row { display: flex; justify-content: space-between; font-size: 12px; }
                    .qr-container { margin-top: 20px; display: flex; flex-direction: column; align-items: center; }
                    img { width: 120px; height: 120px; }
                    .watermark { font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 5px; margin-top: 10px; display: inline-block;}
                    .qr-text { font-size: 10px; margin-top: 5px; font-weight: bold; }
                    .qr-subtext { font-size: 10px; margin-top: 2px; }
                    .footer-system { margin-top: 20px; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <strong>LAVANDERÍA SUPER CLEAN</strong><br>
                    RUC: 20601234567<br>
                    Av. Principal 123
                </div>
                <div class="info">
                    <strong>TICKET: ${selectedTicket.numero_ticket}</strong><br>
                    Cliente: <strong>${selectedTicket.cliente_info?.nombre_completo}</strong>
                </div>
                <table>
                    <thead><tr><th>Cant</th><th>Desc</th><th class="text-right">Total</th></tr></thead>
                    <tbody>
                        ${selectedTicket.items.map(item => `
                            <tr><td>${item.cantidad}</td><td>${item.servicio_nombre}</td><td class="text-right">${parseFloat(item.subtotal).toFixed(2)}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <div class="total-row"><span>TOTAL:</span><span>S/ ${selectedTicket.total.toFixed(2)}</span></div>
                    <div class="sub-row"><span>Pagado:</span><span>S/ ${(selectedTicket.total - selectedTicket.saldo_pendiente).toFixed(2)}</span></div>
                    <div class="sub-row"><span>Saldo:</span><span>S/ ${selectedTicket.saldo_pendiente.toFixed(2)}</span></div>
                </div>
                ${selectedTicket.saldo_pendiente <= 0 ? '<div class="watermark">¡PAGADO!</div>' : ''}
                <div class="qr-container">
                    ${qrUrl ? `<img src="${qrUrl}" />` : ''}
                    <div class="qr-text">Escanear para ver estado</div>
                    <div class="qr-subtext">¡Gracias por su preferencia!</div>
                    <div class="qr-subtext">Conserve este ticket para el recojo.</div>
                </div>
                <div class="footer-system">Sistema Washly v1.0</div>
            </body>
            </html>
        `;
        ticketWindow.document.write(html);
        ticketWindow.document.close();
        setTimeout(() => { ticketWindow.focus(); ticketWindow.print(); }, 800);
    };

    const filteredTickets = tickets.filter(t => 
        t.numero_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col text-gray-800 dark:text-gray-100 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Gestión de Tickets</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Control de tiempos y entregas</p>
                </div>
                <button onClick={() => navigate('/pos')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
                    <Plus size={20} /> Nuevo Servicio
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"/>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-sm outline-none dark:text-gray-300 p-1"/>
                    <ArrowRight size={14} className="text-gray-400"/>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-sm outline-none dark:text-gray-300 p-1"/>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium dark:text-white">
                    <option value="">Todos los Estados</option>
                    <option value="RECIBIDO">Recibido</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="LISTO">Listo</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4">Orden</th>
                                <th className="p-4">Registro</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Estado / Aviso</th>
                                <th className="p-4">Prometido</th>
                                <th className="p-4 text-right">Saldo</th>
                                <th className="p-4 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? <tr><td colSpan="7" className="p-8 text-center animate-pulse">Cargando...</td></tr> : 
                             filteredTickets.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-gray-500">Sin resultados</td></tr> :
                             filteredTickets.map(ticket => {
                                const statusData = getDateStatus(ticket);
                                const readyMsg = getReadyTime(ticket);
                                return (
                                    <tr key={ticket.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${statusData?.className || ''}`}>
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">
                                            {ticket.numero_ticket}
                                            {statusData && <div className={`flex items-center gap-1 mt-1 text-[10px] font-black ${statusData.textColor}`}><AlertTriangle size={10}/> {statusData.text}</div>}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">{new Date(ticket.creado_en).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium dark:text-gray-200">{ticket.cliente_nombre}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getStatusBadge(ticket.estado)}`}>{ticket.estado}</span>
                                            {readyMsg && <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle size={10}/> {readyMsg}</div>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{new Date(ticket.fecha_prometida).toLocaleString([], {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                                        <td className="p-4 text-right">
                                            {ticket.saldo_pendiente > 0 
                                            ? <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Debe: S/ {ticket.saldo_pendiente.toFixed(2)}</span>
                                            : <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Pagado</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleViewDetails(ticket.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30"><Eye size={18}/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <button disabled={!prevPage} onClick={() => fetchTickets(prevPage)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!prevPage ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}><ChevronLeft size={16}/> Anterior</button>
                    <span className="text-xs text-gray-500">Navegación de Registros</span>
                    <button disabled={!nextPage} onClick={() => fetchTickets(nextPage)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!nextPage ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>Siguiente <ChevronRight size={16}/></button>
                </div>
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedTicket && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fixed top-0 left-0 w-full h-full">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in border border-gray-200 dark:border-gray-700 relative">
                        
                        {/* ALERTAS Y CONFIRMACIONES */}
                        {modalConfig.show && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl animate-in fade-in p-4">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full text-center">
                                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                                        modalConfig.type === 'money' ? 'bg-emerald-100 text-emerald-600' : 
                                        ['danger', 'error'].includes(modalConfig.type) ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {modalConfig.type === 'money' ? <DollarSign size={24}/> : 
                                         ['danger', 'error'].includes(modalConfig.type) ? <AlertCircle size={24}/> : <AlertTriangle size={24}/>}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{modalConfig.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{modalConfig.message}</p>
                                    <div className="flex gap-3">
                                        {modalConfig.action && (
                                            <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold text-sm transition-colors">Cancelar</button>
                                        )}
                                        <button onClick={modalConfig.action || closeModal} className={`flex-1 px-4 py-2 text-white rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${
                                            modalConfig.type === 'money' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                                            ['danger', 'error'].includes(modalConfig.type) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}>
                                            {modalConfig.confirmText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MENSAJE FLOTANTE DE ÉXITO (Toast) */}
                        {successMsg && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-bottom-4">
                                <div className="bg-green-500 rounded-full p-1"><CheckCircle size={14} className="text-white"/></div>
                                <span className="font-bold text-sm">{successMsg}</span>
                            </div>
                        )}

                        {/* Header Modal - LIMPIO */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                    Ticket {selectedTicket.numero_ticket}
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(selectedTicket.estado)}`}>{selectedTicket.estado}</span>
                                </h2>
                                <div className="text-base text-gray-700 dark:text-gray-300 font-bold mt-1 flex items-center gap-2">
                                    <User size={16} className="text-gray-400"/>
                                    {selectedTicket.cliente_info?.nombre_completo}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                     <span className="flex items-center gap-1"><Clock size={14}/> Entrega: {new Date(selectedTicket.fecha_prometida).toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            
                            {/* Row 1: Gestión de Estado y Finanzas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Gestión de Estado */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 relative">
                                    <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-3 flex items-center gap-2">Gestión de Estado</h3>
                                    
                                    {selectedTicket.estado !== 'CANCELADO' && selectedTicket.estado !== 'ENTREGADO' && (
                                        <button onClick={() => setShowCancelOptions(!showCancelOptions)} className="absolute -top-2 right-0 flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 border border-red-100 dark:border-red-900/30 rounded-full p-2 hover:pr-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group shadow-sm z-10">
                                            <Trash2 size={16} />
                                            <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 text-xs font-bold whitespace-nowrap">Cancelar Ticket</span>
                                        </button>
                                    )}

                                    {['ENTREGADO', 'CANCELADO'].includes(selectedTicket.estado) ? (
                                        <div className={`flex items-center gap-2 p-3 rounded-lg border dark:border-gray-700 ${selectedTicket.estado === 'CANCELADO' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200' : 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200'}`}>
                                            {selectedTicket.estado === 'CANCELADO' ? <Ban size={18} /> : <Lock size={18} />}
                                            <span className="text-xs font-bold">{selectedTicket.estado === 'CANCELADO' ? 'TICKET ANULADO - Operación bloqueada' : 'TICKET FINALIZADO (Entregado)'}</span>
                                        </div>
                                    ) : (
                                        !showCancelOptions ? (
                                            <>
                                                <div className="flex gap-2 mb-2">
                                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex-1 p-2 rounded-lg border text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                                                        <option value="RECIBIDO">Recibido</option>
                                                        <option value="EN_PROCESO">En Proceso</option>
                                                        <option value="LISTO">Listo</option>
                                                        <option value="ENTREGADO">Entregado</option>
                                                    </select>
                                                    <button onClick={onSaveStatusClick} disabled={newStatus === selectedTicket.estado || actionLoading} className={`px-3 rounded-lg font-bold text-white text-xs ${newStatus === selectedTicket.estado || actionLoading ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                        {actionLoading ? '...' : 'Guardar'}
                                                    </button>
                                                </div>
                                                <input type="text" placeholder="Comentario..." value={statusComment} onChange={(e) => setStatusComment(e.target.value)} className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                            </>
                                        ) : (
                                            <div className="mt-2 animate-in fade-in">
                                                <p className="text-xs font-bold text-red-600 mb-1">Motivo de cancelación:</p>
                                                <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-2 text-xs border border-red-300 rounded mb-2 dark:bg-gray-700 dark:text-white" autoFocus/>
                                                <div className="flex gap-2">
                                                    <button onClick={onConfirmCancelClick} disabled={actionLoading} className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded font-bold hover:bg-red-700">Confirmar</button>
                                                    <button onClick={() => setShowCancelOptions(false)} className="px-2 text-gray-500 text-xs hover:underline">Atrás</button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Finanzas */}
                                <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2"><Wallet size={14}/> Finanzas</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-500">Total: <strong className="text-gray-900 dark:text-white">S/ {selectedTicket.total.toFixed(2)}</strong></p>
                                            <p className="text-xs text-emerald-600">Pagado: <strong>S/ {(selectedTicket.total - selectedTicket.saldo_pendiente).toFixed(2)}</strong></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase">Saldo</p>
                                            <p className={`text-xl font-black ${selectedTicket.saldo_pendiente > 0 ? 'text-red-600' : 'text-emerald-500'}`}>S/ {selectedTicket.saldo_pendiente.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    {selectedTicket.saldo_pendiente > 0 && !showPayModal && selectedTicket.estado !== 'CANCELADO' && (
                                        <button onClick={() => {setShowPayModal(true); setPayAmount(selectedTicket.saldo_pendiente);}} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold flex justify-center gap-2 items-center shadow-sm">
                                            <DollarSign size={14}/> Registrar Pago
                                        </button>
                                    )}
                                    {showPayModal && (
                                        <div className="mt-2 flex gap-1 animate-in fade-in flex-col">
                                            <div className="flex gap-1">
                                                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-20 p-2 text-xs border rounded dark:bg-gray-700 dark:text-white" placeholder="Monto"/>
                                                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="flex-1 p-2 text-xs border rounded dark:bg-gray-700 dark:text-white">
                                                    <option value="EFECTIVO">Efectivo</option>
                                                    <option value="YAPE">Yape</option>
                                                    <option value="PLIN">Plin</option>
                                                    <option value="TARJETA">Tarjeta</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <button onClick={onRegisterPaymentClick} disabled={actionLoading} className="flex-1 bg-emerald-600 text-white text-xs rounded py-1 font-bold hover:bg-emerald-700">Pagar</button>
                                                <button onClick={() => setShowPayModal(false)} className="px-2 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-600 rounded"><X size={14}/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Tabla de Prendas y Detalles de Entrega (SIMETRICO 50/50) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Lado Izquierdo: Tabla de Items */}
                                <div className="border rounded-xl overflow-hidden dark:border-gray-700 h-full">
                                    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 text-xs font-bold text-gray-500 uppercase border-b dark:border-gray-700">
                                        Detalle de Prendas
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                                            <tr>
                                                <th className="p-2 text-left w-12 text-center">Cant.</th>
                                                <th className="p-2 text-left">Prenda / Servicio</th>
                                                <th className="p-2 text-right">Importe</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700 dark:text-gray-300">
                                            {selectedTicket.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="p-2 font-bold w-12 text-center">{item.cantidad}</td>
                                                    <td className="p-2">
                                                        <span className="font-bold">{item.prenda_nombre || 'Item'}</span>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.servicio_nombre}</div>
                                                        {item.descripcion && <div className="text-xs text-gray-400 italic">{item.descripcion}</div>}
                                                    </td>
                                                    <td className="p-2 text-right">S/ {item.subtotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Lado Derecho: Información de Entrega y Observaciones (SIMÉTRICO) */}
                                <div className="border rounded-xl dark:border-gray-700 overflow-hidden h-full flex flex-col">
                                    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 text-xs font-bold text-gray-500 uppercase border-b dark:border-gray-700">
                                        Información de Entrega
                                    </div>
                                    
                                    <div className="p-4 flex flex-col gap-4 flex-1 bg-white dark:bg-gray-800">
                                        
                                        {/* Tipo de Entrega */}
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Tipo de Entrega</span>
                                            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                                <Truck size={16} className="text-blue-500"/>
                                                {selectedTicket.tipo_entrega || 'Recojo en Local'}
                                            </div>
                                        </div>
                                        
                                        {/* Observaciones (Simplificado y Limpio) */}
                                        <div className="flex-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Observaciones</span>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic break-words">
                                                {selectedTicket.observaciones || selectedTicket.notas || 'Sin observaciones.'}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                                <button onClick={handleReprintTicket} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-xl transition-colors font-bold border border-gray-200 dark:border-gray-600">
                                    <Printer size={18}/> Ver / Reimprimir Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;