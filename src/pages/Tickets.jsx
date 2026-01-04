import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Calendar, Clock, X, Save, AlertTriangle, CheckCircle, Ban, Trash2, Wallet, ArrowRight, Phone, DollarSign } from 'lucide-react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    
    // Estados Modal
    const [newStatus, setNewStatus] = useState('');
    const [statusComment, setStatusComment] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    
    // Estado Pago Rápido
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('EFECTIVO');

    const navigate = useNavigate();

    // --- CARGA ---
    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('estado', statusFilter);
            if (dateFrom) params.append('fecha_desde', dateFrom);
            if (dateTo) params.append('fecha_hasta', dateTo);
            
            const response = await api.get(`tickets/?${params.toString()}`);
            const sorted = (response.data.results || response.data).sort((a, b) => 
                new Date(a.fecha_prometida) - new Date(b.fecha_prometida)
            );
            setTickets(sorted);
        } catch (error) {
            console.error("Error cargando tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, [statusFilter, dateFrom, dateTo]);

    // --- LÓGICA VISUAL ---
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
        
        // Comparación por día calendario para "HOY"
        const isSameDay = now.getDate() === promised.getDate() && 
                          now.getMonth() === promised.getMonth() && 
                          now.getFullYear() === promised.getFullYear();

        if (promised < now) {
            return { 
                className: 'border-l-4 border-red-500 bg-red-50/50 dark:bg-transparent dark:border-red-500', // En dark solo borde lateral
                text: 'VENCIDO PLAZO ENTREGA', 
                textColor: 'text-red-600 dark:text-red-400' 
            };
        }

        if (isSameDay) {
            return { 
                className: 'border-l-4 border-orange-500 bg-orange-50/50 dark:bg-transparent dark:border-orange-500', 
                text: 'ENTREGA HOY', 
                textColor: 'text-orange-600 dark:text-orange-400' 
            };
        }
        return null;
    };

    const getReadyTime = (ticket) => {
        if (ticket.estado !== 'LISTO') return null;
        // Usamos actualizado_en, si no existe usamos creado_en como fallback
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
        setShowCancelConfirm(false);
        setShowPayModal(false);
        try {
            const response = await api.get(`tickets/${id}/`);
            setSelectedTicket(response.data);
            setNewStatus(response.data.estado);
            setStatusComment('');
        } catch (error) {
            alert("Error al cargar detalles");
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedTicket || newStatus === selectedTicket.estado) return;
        try {
            await api.post(`tickets/${selectedTicket.id}/update_estado/`, {
                estado: newStatus,
                comentario: statusComment || "Actualización rápida"
            });
            alert("✅ Estado actualizado");
            handleViewDetails(selectedTicket.id);
            fetchTickets();
        } catch (error) {
            alert("⚠️ " + (error.response?.data?.non_field_errors?.[0] || "Error en transición de estado"));
        }
    };

    const handleCancelTicket = async () => {
        if (!cancelReason.trim()) return alert("⚠️ Motivo obligatorio.");
        try {
            await api.post(`tickets/${selectedTicket.id}/cancelar/`, { motivo: cancelReason });
            alert("✅ Ticket Cancelado");
            setSelectedTicket(null);
            fetchTickets();
        } catch (error) {
            alert("❌ Error: " + (error.response?.data?.error || "Desconocido"));
        }
    };

    const handleRegisterPayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) return alert("Monto inválido");
        try {
            await api.post('pagos/', {
                ticket: selectedTicket.id,
                monto: parseFloat(payAmount),
                metodo_pago: payMethod,
                
            });
            alert("✅ Pago registrado");
            setShowPayModal(false);
            setPayAmount('');
            handleViewDetails(selectedTicket.id); // Refrescar modal
            fetchTickets(); // Refrescar lista
        } catch (error) {
            alert("❌ Error al registrar pago");
        }
    };

    // Filtro local
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
                                    <tr key={ticket.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${statusData?.className || ''}`}>
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
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedTicket && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fixed top-0 left-0 w-full h-full">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                    Ticket {selectedTicket.numero_ticket}
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(selectedTicket.estado)}`}>{selectedTicket.estado}</span>
                                </h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Clock size={14}/> Entrega: {new Date(selectedTicket.fecha_prometida).toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14}/> {selectedTicket.tipo_entrega || 'Tienda'}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Panel Acciones */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-3 flex items-center gap-2">Gestión de Estado</h3>
                                    <div className="flex gap-2 mb-2">
                                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex-1 p-2 rounded-lg border text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                                            <option value="RECIBIDO">Recibido</option>
                                            <option value="EN_PROCESO">En Proceso</option>
                                            <option value="LISTO">Listo</option>
                                            <option value="ENTREGADO">Entregado</option>
                                        </select>
                                        <button onClick={handleUpdateStatus} disabled={newStatus === selectedTicket.estado} className={`px-3 rounded-lg font-bold text-white text-xs ${newStatus === selectedTicket.estado ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}>Guardar</button>
                                    </div>
                                    <input type="text" placeholder="Comentario..." value={statusComment} onChange={(e) => setStatusComment(e.target.value)} className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2"><Wallet size={14}/> Pagos</h3>
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
                                    {selectedTicket.saldo_pendiente > 0 && !showPayModal && (
                                        <button onClick={() => {setShowPayModal(true); setPayAmount(selectedTicket.saldo_pendiente);}} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold flex justify-center gap-2 items-center shadow-sm">
                                            <DollarSign size={14}/> Registrar Pago
                                        </button>
                                    )}
                                    {showPayModal && (
                                        <div className="mt-2 flex gap-1 animate-in fade-in">
                                            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-20 p-1 text-xs border rounded dark:bg-gray-700 dark:text-white"/>
                                            <button onClick={handleRegisterPayment} className="flex-1 bg-emerald-600 text-white text-xs rounded font-bold">Cobrar</button>
                                            <button onClick={() => setShowPayModal(false)} className="px-2 text-gray-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                                        <tr><th className="p-2 text-left">Cant.</th><th className="p-2 text-left">Prenda / Servicio</th><th className="p-2 text-right">Subtotal</th></tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700 dark:text-gray-300">
                                        {selectedTicket.items?.map(item => (
                                            <tr key={item.id}>
                                                <td className="p-2 font-bold w-16 text-center">{item.cantidad}</td>
                                                <td className="p-2"><span className="font-bold">{item.prenda_nombre || 'Item'}</span> - {item.servicio_nombre} <div className="text-xs text-gray-400 italic">{item.descripcion}</div></td>
                                                <td className="p-2 text-right">S/ {item.subtotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer (Cancelar) */}
                            {selectedTicket.estado !== 'CANCELADO' && selectedTicket.estado !== 'ENTREGADO' && (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    {!showCancelConfirm ? (
                                        <button onClick={() => setShowCancelConfirm(true)} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold transition-colors border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">
                                            <Trash2 size={14}/> Anular Pedido
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 items-center animate-in fade-in bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900">
                                            <input type="text" placeholder="Motivo..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-40 p-1 border border-red-200 rounded text-xs dark:bg-gray-700 dark:border-red-800 dark:text-white"/>
                                            <button onClick={handleCancelTicket} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">Confirmar</button>
                                            <button onClick={() => setShowCancelConfirm(false)} className="text-gray-400 hover:text-gray-600 px-2"><X size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;