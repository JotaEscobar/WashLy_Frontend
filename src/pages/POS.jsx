import { useState, useEffect, useRef } from 'react';
import {
    Search, Plus, Minus, CreditCard, UserPlus, Grid, Save, Loader, AlertCircle, X,
    Clock, FileText, Printer, CheckCircle, Wallet, DollarSign, MapPin, Truck, Store,
    AlertTriangle, User, Phone, Mail, Map, Tag
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useSedeStore } from '../stores/sedeStore';
import PaymentMethodSelect from '../components/PaymentMethodSelect';
import { printTicket } from '../utils/ticketPrinter';
import { useAuth } from '../context/AuthContext';
import { ModalInfo } from '../components/pos/ModalInfo';
import { ModalPrendas } from '../components/pos/ModalPrendas';
import { ModalCrearCliente } from '../components/pos/ModalCrearCliente';
import { ModalExitoTicket } from '../components/pos/ModalExitoTicket';

const POS = () => {
    const { currentSede } = useSedeStore();
    const { user } = useAuth();
    // --- DATOS ---
    const [categories, setCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [clients, setClients] = useState([]);

    // --- INTERFAZ ---
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- TICKET ---
    const [cart, setCart] = useState([]);
    const [ticketObservations, setTicketObservations] = useState('');
    const [validationError, setValidationError] = useState(null);

    // --- NEGOCIO ---
    const [isDelivery, setIsDelivery] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDIENTE');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    // --- MODALES ---
    const [createdTicket, setCreatedTicket] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NUEVO: Modal de selección de prendas
    const [modalPrendas, setModalPrendas] = useState({
        show: false,
        service: null,
        loading: false,
        items: [], // Lista de precios configurados para este servicio
        searchTerm: ''
    });

    const [infoModal, setInfoModal] = useState({
        show: false, title: '', message: '', type: 'info', action: null, confirmText: 'Entendido', showCancel: false
    });

    // --- FORMULARIO NUEVO CLIENTE ---
    const [newClientData, setNewClientData] = useState({
        tipo_documento: 'DNI', numero_documento: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: ''
    });

    const searchTimeoutRef = useRef(null);

    const getDefaultDeliveryDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
        return tomorrow.toISOString().slice(0, 16);
    };
    const [deliveryDate, setDeliveryDate] = useState(getDefaultDeliveryDate());

    // --- HELPERS MODALES ---
    const showInfo = (title, message, type = 'info') => setInfoModal({ show: true, title, message, type, showCancel: false, confirmText: 'Aceptar' });
    const showConfirm = (title, message, action) => setInfoModal({ show: true, title, message, type: 'warning', action, showCancel: true, confirmText: 'Confirmar' });
    const closeInfoModal = () => setInfoModal({ ...infoModal, show: false });

    // CARGA INICIAL
    useEffect(() => {
        const loadCatalog = async () => {
            if (!currentSede) return;
            try {
                const [catsRes, servsRes] = await Promise.all([
                    api.get('categorias-servicio/'),
                    api.get('servicios/?disponible=true')
                ]);
                const catsData = catsRes.data.results || catsRes.data;
                const servsData = servsRes.data.results || servsRes.data;
                setCategories(catsData);
                setAllServices(servsData);
                if (catsData.length > 0) setSelectedCategory(catsData[0].id);
                setLoading(false);
            } catch (err) {
                console.error("Error catálogo:", err);
                showInfo("Error", "Error de conexión al cargar el catálogo.", "error");
                setLoading(false);
            }
        };
        loadCatalog();
    }, [currentSede?.id]);

    // BUSCADOR CLIENTES
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (clientSearch.trim().length < 2) {
            setClients([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await api.get(`clientes/?search=${clientSearch}`);
                setClients(response.data.results || response.data);
            } catch (err) { console.error(err); }
        }, 300);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [clientSearch]);

    // CÁLCULOS
    const total = cart.reduce((acc, item) => acc + (item.precio_unitario * (parseFloat(item.qty) || 0)), 0);

    useEffect(() => {
        if (paymentStatus === 'PAGADO') setPaymentAmount(total.toFixed(2));
        else if (paymentStatus === 'PENDIENTE') setPaymentAmount('');
    }, [paymentStatus, total]);

    // --- LÓGICA CARRITO Y SELECCIÓN ---

    // 1. Manejador de Click en Servicio (Dispatcher)
    const handleServiceClick = async (service) => {
        if (service.tipo_cobro === 'POR_PRENDA') {
            // ABRIR MODAL DE PRENDAS
            setModalPrendas({
                show: true,
                service: service,
                loading: true,
                items: [],
                searchTerm: ''
            });

            try {
                // Obtenemos el detalle completo del servicio que incluye 'precios_prendas'
                // OJO: Ajusta esto si tu backend requiere un endpoint diferente
                const response = await api.get(`servicios/${service.id}/`);
                setModalPrendas(prev => ({
                    ...prev,
                    loading: false,
                    items: response.data.precios_prendas || []
                }));
            } catch (error) {
                console.error(error);
                showInfo("Error", "No se pudo cargar el catálogo de prendas.", "error");
                setModalPrendas(prev => ({ ...prev, show: false }));
            }

        } else {
            // FLUJO NORMAL (Kilo, Unidad, etc.)
            addToCart(service);
        }
    };

    // 2. Agregar al Carrito (Core)
    const addToCart = (service, prendaEspecifica = null) => {
        setCart(prev => {
            // Generar un ID único para el ítem en el carrito
            // Si es prenda específica: "ID_SERVICIO-ID_PRENDA"
            // Si es normal: "ID_SERVICIO"
            const uniqueCartId = prendaEspecifica
                ? `${service.id}-${prendaEspecifica.prenda}`
                : `${service.id}`;

            // Verificar si ya existe este item exacto
            if (prev.find(i => i.cartId === uniqueCartId)) return prev;

            // Determinar valores
            const nombreItem = prendaEspecifica
                ? `${service.nombre} - ${prendaEspecifica.prenda_nombre}`
                : service.nombre;

            const precioFinal = prendaEspecifica
                ? parseFloat(prendaEspecifica.precio)
                : parseFloat(service.precio_base);

            const descripcionInicial = prendaEspecifica
                ? prendaEspecifica.prenda_nombre // Autocompletar detalle con nombre de la prenda
                : '';

            return [...prev, {
                cartId: uniqueCartId, // ID virtual para el frontend
                serviceId: service.id, // ID real del servicio para el backend
                nombre: nombreItem,
                precio_unitario: precioFinal,
                qty: '',
                description: descripcionInicial,
                es_prenda: !!prendaEspecifica
            }];
        });

        // Cerrar modal si estaba abierto
        if (prendaEspecifica) {
            setModalPrendas(prev => ({ ...prev, show: false }));
        }
        setValidationError(null);
    };

    const updateItem = (cartId, field, value) => {
        setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, [field]: value } : item));
    };

    const removeFromCart = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));

    // --- CREAR CLIENTE ---
    const handleCreateClient = async (e) => {
        e.preventDefault();

        if (!newClientData.numero_documento || !newClientData.nombres || !newClientData.telefono) {
            showInfo("Datos Faltantes", "DNI, Nombres y Teléfono son obligatorios.", "warning");
            return;
        }

        try {
            const response = await api.post('clientes/', newClientData);

            setSelectedClient(response.data);
            setShowClientModal(false);
            setNewClientData({
                tipo_documento: 'DNI', numero_documento: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: ''
            });
            showInfo("Cliente Creado", "Cliente registrado correctamente", "success");

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const msg = JSON.stringify(err.response.data);
                if (msg.includes("numero_documento")) showInfo("Duplicado", "El Número de Documento ya existe.", "error");
                else showInfo("Error", `No se pudo crear: ${msg}`, "error");
            } else {
                showInfo("Error", "Error de conexión al crear cliente.", "error");
            }
        }
    };

    // --- EMISIÓN TICKET ---
    const validateAndAskConfirmation = () => {
        if (!selectedClient) return showInfo("Falta Cliente", "Por favor selecciona un cliente.", "warning");
        if (cart.length === 0) return showInfo("Carrito Vacío", "Agrega servicios a la orden.", "warning");
        if (cart.some(i => !i.qty || parseFloat(i.qty) <= 0)) return showInfo("Cantidades", "Revisa las cantidades de los items.", "warning");

        const missingDesc = cart.find(item => !item.description || item.description.trim() === '');
        if (missingDesc) {
            setValidationError(missingDesc.cartId);
            showInfo("Detalle Requerido", `El detalle es OBLIGATORIO para: ${missingDesc.nombre}`, "warning");
            return;
        }
        setValidationError(null);

        if (paymentStatus === 'PARCIAL' && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
            return showInfo("Monto Inválido", "Ingresa el monto a cuenta.", "warning");
        }

        showConfirm(
            "¿Confirmar Emisión?",
            `Se registrará la orden por S/ ${total.toFixed(2)}.`,
            handleEmitTicket
        );
    };

    const handleEmitTicket = async () => {
        closeInfoModal();
        setIsSubmitting(true);

        let montoEnviar = 0;
        if (paymentStatus !== 'PENDIENTE' && paymentAmount) {
            montoEnviar = parseFloat(paymentAmount);
        }

        const payload = {
            cliente: selectedClient.id,
            prioridad: 'NORMAL',
            fecha_prometida: new Date(deliveryDate).toISOString(),
            observaciones: ticketObservations,
            tipo_entrega: isDelivery ? 'DELIVERY' : 'RECOJO',
            pago_monto: montoEnviar,
            items: cart.map(item => ({
                servicio: item.serviceId, // Usamos el ID real del servicio
                cantidad: parseFloat(item.qty),
                precio_unitario: item.precio_unitario,
                descripcion: item.description
            }))
        };

        if (paymentStatus !== 'PENDIENTE' && paymentMethod) {
            payload.metodo_pago_id = paymentMethod;
        }

        try {
            const response = await api.post('tickets/', payload);
            setCreatedTicket(response.data);
        } catch (err) {
            console.error("Error:", err);
            showInfo("Error", err.response?.data?.error || "Error al emitir ticket", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPOS = () => {
        setCart([]); setSelectedClient(null); setClientSearch(''); setTicketObservations('');
        setPaymentStatus('PENDIENTE'); setPaymentAmount(''); setIsDelivery(false);
        setDeliveryDate(getDefaultDeliveryDate()); setCreatedTicket(null); setValidationError(null);
    };

    const handlePrintTicket = () => {
        if (!createdTicket) return;

        // Calculamos saldo inicial para la pre-impresión
        const montoPagado = paymentStatus === 'PENDIENTE' ? 0 : parseFloat(paymentAmount || 0);
        const saldoTicket = total - montoPagado;

        const ticketData = {
            ...createdTicket,
            cliente_nombre: selectedClient?.nombre_completo,
            total: total,
            saldo_pendiente: saldoTicket,
            // Construir los items adaptando el carrito
            items: cart.map(item => ({
                cantidad: item.qty,
                servicio_nombre: item.nombre + (item.description ? `\n(${item.description})` : ''),
                subtotal: (parseFloat(item.qty) || 0) * item.precio_unitario,
                precio_unitario: item.precio_unitario
            }))
        };

        printTicket(ticketData, user?.empresa);
    };

    const filteredServices = allServices.filter(s => selectedCategory ? s.categoria == selectedCategory : true);

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-2 relative text-gray-800 dark:text-gray-100">

            <ModalInfo infoModal={infoModal} closeInfoModal={closeInfoModal} />
            <ModalPrendas modalPrendas={modalPrendas} setModalPrendas={setModalPrendas} addToCart={addToCart} />
            <ModalCrearCliente showClientModal={showClientModal} setShowClientModal={setShowClientModal} handleCreateClient={handleCreateClient} newClientData={newClientData} setNewClientData={setNewClientData} />
            <ModalExitoTicket createdTicket={createdTicket} handlePrintTicket={handlePrintTicket} resetPOS={resetPOS} />

            {/* SECCIÓN IZQUIERDA */}
            <div className="w-[65%] flex flex-col gap-4">
                <div className="flex flex-col gap-4 relative z-50">
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={selectedClient ? selectedClient.nombre_completo : clientSearch}
                                    onChange={(e) => { setClientSearch(e.target.value); if (selectedClient) setSelectedClient(null); }}
                                    placeholder="Buscar Cliente..."
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none shadow-sm dark:bg-gray-800 dark:text-white transition-all 
                                        ${selectedClient
                                            ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400 font-bold'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'}`}
                                />
                                {selectedClient && <button onClick={() => { setSelectedClient(null); setClientSearch('') }} className="absolute right-3 top-3 text-green-700 dark:text-green-400 hover:scale-110 transition-transform"><X size={20} /></button>}
                            </div>

                            <button onClick={() => setShowClientModal(true)} className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                                <UserPlus size={24} />
                            </button>
                        </div>
                        {clients.length > 0 && !selectedClient && (
                            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 mt-1 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
                                {clients.map(c => (
                                    <div key={c.id} onClick={() => { setSelectedClient(c); setClients([]) }} className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 flex justify-between group">
                                        <div><p className="font-bold text-gray-800 dark:text-white">{c.nombre_completo}</p><p className="text-xs text-gray-500 dark:text-gray-400">{c.numero_documento}</p></div>
                                        <Plus className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap shadow-sm transition-all border 
                                    ${selectedCategory == cat.id
                                        ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-blue-500/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-3 gap-3 content-start">
                        {filteredServices.map(service => (
                            <button
                                key={service.id}
                                // CAMBIO: Usamos handleServiceClick en lugar de addToCart directo
                                onClick={() => handleServiceClick(service)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/10 text-left h-32 flex flex-col justify-between group active:scale-95 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"></div>
                                <span className="font-bold line-clamp-2 text-sm text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 z-10">{service.nombre}</span>
                                <div className="flex justify-between items-end z-10">
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-mono">{service.codigo}</span>
                                    {service.tipo_cobro === 'POR_PRENDA' ? (
                                        <span className="font-black text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">POR PRENDA</span>
                                    ) : (
                                        <span className="font-black text-xl text-blue-600 dark:text-blue-400">S/ {parseFloat(service.precio_base).toFixed(2)}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECCIÓN DERECHA: TICKET */}
            <div className="w-[35%] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600" />
                        <span className="font-bold text-gray-700 dark:text-gray-200">Ticket Actual</span>
                    </div>
                    <span className="text-xs font-mono bg-white dark:bg-gray-700 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded font-bold text-blue-600 dark:text-blue-400">
                        {cart.length} ITEMS
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-2">
                            <Grid size={40} className="opacity-20" />
                            <p>Ticket vacío</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.cartId} className={`bg-white dark:bg-gray-700 border p-3 rounded-xl shadow-sm flex flex-col gap-2 transition-all 
                            ${validationError === item.cartId ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500' : 'border-gray-100 dark:border-gray-600'}`}>
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm w-3/4 text-gray-800 dark:text-white">{item.nombre}</span>
                                <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>

                            <input
                                type="text"
                                placeholder="⚠️ Detalle OBLIGATORIO (Ej. Color, Marca)"
                                value={item.description}
                                onChange={(e) => updateItem(item.cartId, 'description', e.target.value)}
                                className={`w-full text-xs border-b bg-transparent outline-none pb-1 transition-colors
                                    ${validationError === item.cartId
                                        ? 'border-red-400 placeholder-red-400 text-red-600'
                                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 text-gray-600 dark:text-gray-300 placeholder-gray-400'}`}
                            />

                            <div className="flex justify-between items-center mt-1">
                                <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-1 border border-gray-200 dark:border-gray-500 flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.cartId, 'qty', e.target.value)}
                                        className="w-12 text-center bg-transparent font-bold outline-none text-gray-800 dark:text-white placeholder-gray-300"
                                    />
                                    <span className="text-[10px] text-gray-400 dark:text-gray-300 font-medium">unid/kg</span>
                                </div>
                                <span className="font-black text-gray-900 dark:text-white">S/ {((parseFloat(item.qty) || 0) * item.precio_unitario).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3">

                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isDelivery}
                                onChange={(e) => setIsDelivery(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 accent-blue-600"
                            />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">¿Requiere Delivery?</span>
                        </label>
                        <div className={`text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-1 transition-colors ${isDelivery ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {isDelivery ? <Truck size={12} /> : <Store size={12} />}
                            {isDelivery ? 'Envío a Domicilio' : 'Recojo en Local'}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 flex items-center gap-2 shadow-sm">
                            <Clock size={16} className="text-blue-500" />
                            <input type="datetime-local" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full text-xs font-bold bg-transparent outline-none text-gray-700 dark:text-gray-200" />
                        </div>
                    </div>

                    <textarea
                        placeholder="Observaciones generales (Opcional)..."
                        value={ticketObservations}
                        onChange={(e) => setTicketObservations(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none h-10 resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 transition-all"
                    />

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase flex gap-1 items-center"><Wallet size={14} /> Estado de Pago</span>
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                                {['PENDIENTE', 'PARCIAL', 'PAGADO'].map(status => (
                                    <button key={status} onClick={() => setPaymentStatus(status)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${paymentStatus === status
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentStatus !== 'PENDIENTE' && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-2 top-2 text-gray-400 dark:text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        placeholder="Monto"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        readOnly={paymentStatus === 'PAGADO'}
                                        className={`w-full pl-6 pr-2 py-2 rounded-lg border text-sm font-bold outline-none transition-colors 
                                            ${paymentStatus === 'PAGADO'
                                                ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 ring-blue-500'}`}
                                    />
                                </div>
                                <PaymentMethodSelect
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 text-xs font-bold outline-none w-24 text-gray-700 dark:text-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-1">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Estimado</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">S/ {total.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={validateAndAskConfirmation} 
                            disabled={isSubmitting}
                            className="w-full bg-gray-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-black dark:hover:bg-blue-700 shadow-lg shadow-gray-900/20 dark:shadow-blue-900/30 active:scale-95 transition-all flex justify-center gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader className="animate-spin" size={20} /> PROCESANDO...</>
                            ) : (
                                <><Save size={20} /> EMITIR TICKET</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;