import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Clock, X, AlertTriangle, CheckCircle, Trash2, Wallet, ArrowRight, DollarSign, MapPin, Printer, ChevronLeft, ChevronRight, User, AlertCircle, Lock, Ban, Truck, MessageSquare } from 'lucide-react';
import api from '../api/axiosConfig';
import { useSedeStore } from '../stores/sedeStore';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelect from '../components/PaymentMethodSelect';
import { printTicket } from '../utils/ticketPrinter';
import { useAuth } from '../context/AuthContext';
import { TicketFilters } from '../components/tickets/TicketFilters';
import { TicketsTable } from '../components/tickets/TicketsTable';
import { TicketDetailModal } from '../components/tickets/TicketDetailModal';

const Tickets = () => {
    const { currentSede } = useSedeStore();
    const { user } = useAuth();
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
    const [payMethod, setPayMethod] = useState('');

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
        if (!url && !tickets.length) setLoading(true);
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

    useEffect(() => {
        if (currentSede) fetchTickets();
    }, [statusFilter, dateFrom, dateTo, currentSede?.id]);

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
        try {
            await api.post(`tickets/${selectedTicket.id}/update_estado/`, {
                estado: newStatus,
                comentario: statusComment || "Actualización rápida"
            });

            // Actualización optimista local sin recargar en blanco
            setSelectedTicket(prev => prev ? { ...prev, estado: newStatus } : null);
            setSuccessMsg('Estado actualizado');
            fetchTickets(); // Refresca lista de fondo
            closeModal(); // Cerramos confirmación

            setTimeout(() => {
                setSuccessMsg('');
            }, 1000);
        } catch (error) {
            closeModal();
            // Intenta extraer el error específico del estado
            const errorEstado = error.response?.data?.estado?.[0];
            const msg = errorEstado || error.response?.data?.non_field_errors?.[0] || error.response?.data?.error || "Error al actualizar estado";
            showAlert('Regla de Negocio o Error', msg, 'error');
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
                metodo_pago_config: payMethod,
                estado: 'PAGADO',
                origen: 'TICKETS'
            });

            // Actualización optimista del saldo local
            const montoPago = parseFloat(payAmount);
            setSelectedTicket(prev => prev ? { ...prev, saldo_pendiente: Math.max(0, prev.saldo_pendiente - montoPago) } : null);

            setSuccessMsg('Pago registrado correctamente');
            setShowPayModal(false);
            setPayAmount('');
            setModalConfig({ ...modalConfig, show: false });
            fetchTickets(); // Lista en 2do plano

            setTimeout(() => {
                setSuccessMsg('');
            }, 1500);

        } catch (error) {
            setModalConfig({ ...modalConfig, show: false });
            const serverError = error.response?.data?.error || error.response?.data?.detail || "No se pudo procesar el pago.";
            showAlert('No se pudo pagar', serverError);
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

    const handleReprintTicket = async () => {
        if (!selectedTicket) return;
        await printTicket(selectedTicket, user?.empresa);
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
            <TicketFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

            {/* Tabla */}
            <TicketsTable loading={loading} filteredTickets={filteredTickets} getDateStatus={getDateStatus} getReadyTime={getReadyTime} getStatusBadge={getStatusBadge} handleViewDetails={handleViewDetails} fetchTickets={fetchTickets} prevPage={prevPage} nextPage={nextPage} />

            {/* --- MODAL DETALLE --- */}
            <TicketDetailModal
                selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket}
                modalConfig={modalConfig} closeModal={closeModal} successMsg={successMsg}
                getStatusBadge={getStatusBadge} actionLoading={actionLoading} newStatus={newStatus}
                setNewStatus={setNewStatus} onSaveStatusClick={onSaveStatusClick}
                statusComment={statusComment} setStatusComment={setStatusComment}
                showCancelOptions={showCancelOptions} setShowCancelOptions={setShowCancelOptions}
                cancelReason={cancelReason} setCancelReason={setCancelReason}
                onConfirmCancelClick={onConfirmCancelClick} showPayModal={showPayModal}
                setShowPayModal={setShowPayModal} payAmount={payAmount} setPayAmount={setPayAmount}
                payMethod={payMethod} setPayMethod={setPayMethod}
                onRegisterPaymentClick={onRegisterPaymentClick} handleReprintTicket={handleReprintTicket}
            />
        </div>
    );
};

export default Tickets;