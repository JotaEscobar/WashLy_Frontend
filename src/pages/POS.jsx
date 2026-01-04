import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, CreditCard, UserPlus, Grid, Save, Loader, AlertCircle, X, Clock, FileText, Printer, CheckCircle, Wallet, DollarSign, MapPin, Truck, Store, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig';

const POS = () => {
    // --- DATOS ---
    const [categories, setCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [clients, setClients] = useState([]);
    
    // --- INTERFAZ ---
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- TICKET ---
    const [cart, setCart] = useState([]);
    const [ticketObservations, setTicketObservations] = useState('');
    // Error state solo para validación visual de items incompletos
    const [validationError, setValidationError] = useState(null);
    
    // --- NEGOCIO ---
    const [isDelivery, setIsDelivery] = useState(false); 
    const [paymentStatus, setPaymentStatus] = useState('PENDIENTE'); 
    const [paymentAmount, setPaymentAmount] = useState(''); 
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO'); 

    // --- MODALES ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [createdTicket, setCreatedTicket] = useState(null);

    const searchTimeoutRef = useRef(null);

    // Fecha Default
    const getDefaultDeliveryDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
        return tomorrow.toISOString().slice(0, 16);
    };
    const [deliveryDate, setDeliveryDate] = useState(getDefaultDeliveryDate());

    // 1. CARGA INICIAL
    useEffect(() => {
        const loadCatalog = async () => {
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
                setError("Error de conexión con el servidor.");
                setLoading(false);
            }
        };
        loadCatalog();
    }, []);

    // 2. BUSCADOR CLIENTES
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

    // --- CÁLCULOS ---
    const total = cart.reduce((acc, item) => acc + (item.precio_base * (parseFloat(item.qty) || 0)), 0);

    useEffect(() => {
        if (paymentStatus === 'PAGADO') setPaymentAmount(total.toFixed(2)); 
        else if (paymentStatus === 'PENDIENTE') setPaymentAmount(''); 
    }, [paymentStatus, total]);

    // --- CARRITO ---
    const addToCart = (service) => {
        setCart(prev => {
            if (prev.find(i => i.id === service.id)) return prev;
            return [...prev, { 
                id: service.id, nombre: service.nombre, precio_base: parseFloat(service.precio_base),
                qty: '', description: ''   
            }];
        });
        setValidationError(null); // Limpiar error al agregar
    };

    const updateItem = (id, field, value) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

    // --- VALIDACIÓN Y CONFIRMACIÓN ---
    const validateAndAskConfirmation = () => {
        if (!selectedClient) return alert("⚠️ Selecciona un cliente.");
        if (cart.length === 0) return alert("⚠️ Carrito vacío.");
        if (cart.some(i => !i.qty || parseFloat(i.qty) <= 0)) return alert("⚠️ Revisa las cantidades.");
        
        // VALIDACIÓN DE DETALLE OBLIGATORIO
        const missingDesc = cart.find(item => !item.description || item.description.trim() === '');
        if (missingDesc) {
            setValidationError(missingDesc.id); // Marcar item con error
            alert(`⚠️ El detalle es OBLIGATORIO para: ${missingDesc.nombre}`);
            return;
        }
        setValidationError(null);

        if (paymentStatus === 'PARCIAL' && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
            return alert("⚠️ Ingresa el monto a cuenta.");
        }

        setShowConfirmModal(true);
    };

    const handleEmitTicket = async () => {
        setShowConfirmModal(false);
        
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
            metodo_pago: paymentMethod,
            items: cart.map(item => ({
                servicio: item.id,
                cantidad: parseFloat(item.qty),
                precio_unitario: item.precio_base,
                descripcion: item.description 
            }))
        };

        try {
            const response = await api.post('tickets/', payload);
            setCreatedTicket(response.data);
        } catch (err) {
            console.error("Error:", err);
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
                    alert("❌ Error 500: Revisa que no haya código duplicado en serializers.py");
                } else {
                    alert(`❌ ERROR:\n${JSON.stringify(err.response.data, null, 2)}`);
                }
            } else {
                alert("❌ Error de conexión.");
            }
        }
    };

    const resetPOS = () => {
        setCart([]); setSelectedClient(null); setClientSearch(''); setTicketObservations('');
        setPaymentStatus('PENDIENTE'); setPaymentAmount(''); setIsDelivery(false);
        setDeliveryDate(getDefaultDeliveryDate()); setCreatedTicket(null); setValidationError(null);
    };

    // --- IMPRESIÓN DE TICKET TÉRMICO (DISEÑO MEJORADO) ---
    const handlePrintTicket = () => {
        if (!createdTicket) return;

        const ticketWindow = window.open('', '_blank', 'width=400,height=600');
        const qrUrl = createdTicket.qr_code;

        const html = `
            <html>
            <head>
                <title>Ticket #${createdTicket.numero_ticket}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; text-align: center; }
                    .system-name { font-size: 10px; color: #666; margin-bottom: 5px; }
                    .business-name { font-size: 18px; font-weight: bold; margin: 5px 0; text-transform: uppercase; }
                    .header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .info { text-align: left; margin-bottom: 10px; font-size: 11px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
                    th { text-align: left; border-bottom: 1px solid #000; }
                    td { padding: 4px 0; vertical-align: top; text-align: left;}
                    .text-right { text-align: right; }
                    .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 5px;}
                    .sub-row { display: flex; justify-content: space-between; font-size: 12px; }
                    .qr-container { margin-top: 20px; }
                    img { width: 120px; height: 120px; }
                    .footer { margin-top: 20px; font-size: 10px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="system-name">WASHLY SYSTEM 1.0</div>
                    <div class="business-name">LAVANDERÍA SUPER CLEAN</div>
                    <div>RUC: 20601234567</div>
                    <div>Av. Principal 123, Lima</div>
                    <div>Telf: (01) 234-5678</div>
                </div>
                
                <div class="info">
                    <strong>N° ORDEN: ${createdTicket.numero_ticket}</strong><br>
                    F. Emisión: ${new Date(createdTicket.creado_en || Date.now()).toLocaleString()}<br>
                    <strong>Cliente: ${selectedClient?.nombre_completo || 'Público General'}</strong><br>
                    Modo: ${createdTicket.tipo_entrega}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="15%">Cant</th>
                            <th width="60%">Descripción</th>
                            <th width="25%" class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(item => `
                            <tr>
                                <td>${item.qty}</td>
                                <td>
                                    <strong>${item.nombre}</strong><br>
                                    <span style="font-size:10px;">${item.description || ''}</span>
                                </td>
                                <td class="text-right">${((parseFloat(item.qty)||0) * item.precio_base).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>TOTAL A PAGAR:</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>
                    <div class="sub-row">
                        <span>A Cuenta:</span>
                        <span>S/ ${paymentStatus === 'PENDIENTE' ? '0.00' : parseFloat(paymentAmount || 0).toFixed(2)}</span>
                    </div>
                    <div class="sub-row" style="margin-top: 2px;">
                        <span>Saldo Pendiente:</span>
                        <span>S/ ${(total - (paymentStatus === 'PENDIENTE' ? 0 : parseFloat(paymentAmount || 0))).toFixed(2)}</span>
                    </div>
                </div>

                ${ticketObservations ? `
                <div style="text-align:left; margin-top: 10px; border: 1px solid #000; padding: 5px;">
                    <strong>OBSERVACIONES:</strong><br>${ticketObservations}
                </div>` : ''}

                <div class="qr-container">
                    ${qrUrl ? `<img src="${qrUrl}" />` : 'QR Generado en Servidor'}
                    <br>Escanear para estado
                </div>

                <div class="footer">
                    ¡Gracias por su preferencia!<br>
                    No hay lugar a reclamo pasados 30 días.
                </div>
            </body>
            </html>
        `;

        ticketWindow.document.write(html);
        ticketWindow.document.close();
        // Esperar carga de imagen para imprimir
        setTimeout(() => {
            ticketWindow.focus();
            ticketWindow.print();
        }, 800);
    };

    const filteredServices = allServices.filter(s => selectedCategory ? s.categoria == selectedCategory : true);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-blue-600"/></div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-2 relative text-gray-800 dark:text-gray-100">
            
            {/* MODAL CONFIRMACIÓN */}
            {showConfirmModal && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-96 text-center animate-in fade-in zoom-in">
                        <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-bold mb-2">¿Confirmar Emisión?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                            Se registrará la orden por <strong>S/ {total.toFixed(2)}</strong>.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">Cancelar</button>
                            <button onClick={handleEmitTicket} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">SI, EMITIR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ÉXITO */}
            {createdTicket && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 text-center animate-in fade-in zoom-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 mx-auto">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">¡Orden Emitida!</h2>
                        <p className="text-gray-500 mt-1">Ticket N° <span className="font-mono text-gray-800 font-bold">{createdTicket.numero_ticket}</span></p>
                        
                        <div className="mt-4 bg-blue-50 py-2 px-4 rounded-lg inline-flex items-center gap-2 text-blue-800 font-bold text-sm">
                            {createdTicket.tipo_entrega === 'DELIVERY' ? <Truck size={16}/> : <MapPin size={16} />}
                            {createdTicket.tipo_entrega === 'DELIVERY' ? 'Entrega por Delivery' : 'Recojo en Local'}
                        </div>
                        
                        <div className="mt-6 flex gap-3">
                            <button onClick={handlePrintTicket} className="flex-1 btn-secondary py-3 rounded-xl border border-gray-200 text-gray-700 font-bold flex justify-center gap-2 items-center hover:bg-gray-50">
                                <Printer size={20}/> Imprimir
                            </button>
                            <button onClick={resetPOS} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                Nueva
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* IZQUIERDA: CATÁLOGO */}
            <div className="w-[65%] flex flex-col gap-4">
                <div className="flex flex-col gap-4 relative z-50">
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="text"
                                    value={selectedClient ? selectedClient.nombre_completo : clientSearch}
                                    onChange={(e) => { setClientSearch(e.target.value); if(selectedClient) setSelectedClient(null); }}
                                    placeholder="Buscar Cliente (DNI, Nombre)..."
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none shadow-sm dark:bg-gray-800 dark:border-gray-700 ${selectedClient ? 'bg-green-50 border-green-500 font-bold text-green-800' : 'focus:ring-2 focus:ring-blue-500'}`}
                                />
                                {selectedClient && <button onClick={() => {setSelectedClient(null); setClientSearch('')}} className="absolute right-3 top-3 text-green-700"><X size={20}/></button>}
                            </div>
                            <button className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 shadow-sm"><UserPlus size={24}/></button>
                        </div>
                        {clients.length > 0 && !selectedClient && (
                            <div className="absolute top-full left-0 w-full bg-white mt-1 rounded-xl shadow-xl border z-50 max-h-60 overflow-y-auto">
                                {clients.map(c => (
                                    <div key={c.id} onClick={() => {setSelectedClient(c); setClients([])}} className="p-3 hover:bg-blue-50 cursor-pointer border-b flex justify-between">
                                        <div><p className="font-bold">{c.nombre_completo}</p><p className="text-xs text-gray-500">{c.numero_documento}</p></div>
                                        <Plus className="text-blue-500"/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap shadow-sm transition-all ${selectedCategory == cat.id ? 'bg-gray-800 text-white scale-105' : 'bg-white border hover:bg-gray-50'}`}>
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-3 gap-3 content-start">
                        {filteredServices.map(service => (
                            <button key={service.id} onClick={() => addToCart(service)} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 hover:border-blue-500 hover:shadow-lg text-left h-32 flex flex-col justify-between group active:scale-95 transition-all">
                                <span className="font-bold line-clamp-2 text-sm group-hover:text-blue-700 dark:text-gray-200">{service.nombre}</span>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 rounded font-mono">{service.codigo}</span>
                                    <span className="font-black text-xl text-blue-600">S/ {parseFloat(service.precio_base).toFixed(2)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* DERECHA: TICKET */}
            <div className="w-[35%] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600"/>
                        <span className="font-bold text-gray-700 dark:text-gray-200">Nueva Orden</span>
                    </div>
                    <span className="text-xs font-mono bg-white dark:bg-gray-700 px-2 py-1 border dark:border-gray-600 rounded font-bold text-blue-600">
                        {cart.length} ITEMS
                    </span>
                </div>

                {/* ITEMS TICKET */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                            <Grid size={40} className="opacity-20"/>
                            <p>Ticket vacío</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.id} className={`bg-white dark:bg-gray-700 border p-3 rounded-xl shadow-sm flex flex-col gap-2 ${validationError === item.id ? 'border-red-500 ring-1 ring-red-500' : 'dark:border-gray-600'}`}>
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm w-3/4 dark:text-gray-200">{item.nombre}</span>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><X size={16}/></button>
                            </div>
                            
                            {/* CAMPO DE DETALLE OBLIGATORIO */}
                            <input 
                                type="text" 
                                placeholder="⚠️ Detalle OBLIGATORIO (Ej. Color, Marca)" 
                                value={item.description} 
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                                className={`w-full text-xs border-b bg-transparent outline-none pb-1 ${validationError === item.id ? 'border-red-400 placeholder-red-400' : 'border-gray-100 focus:border-blue-500 dark:border-gray-600 dark:text-gray-300'}`}
                            />
                            
                            <div className="flex justify-between items-center mt-1">
                                <div className="bg-gray-50 dark:bg-gray-600 rounded p-1 border dark:border-gray-500 flex items-center gap-1">
                                    <input type="number" placeholder="0" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-12 text-center bg-transparent font-bold outline-none dark:text-white"/>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-300">unid/kg</span>
                                </div>
                                <span className="font-black dark:text-white">S/ {((parseFloat(item.qty)||0) * item.precio_base).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-y-3">
                    
                    {/* CHECKBOX DELIVERY */}
                    <div className="flex justify-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={isDelivery} 
                                onChange={(e) => setIsDelivery(e.target.checked)} 
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 accent-blue-600"
                            />
                            <div className="flex items-center gap-1.5">
                                {isDelivery ? <Truck size={14} className="text-blue-600"/> : <Store size={14} className="text-gray-500"/>}
                                <span className={`text-xs font-bold ${isDelivery ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {isDelivery ? 'Entrega por Delivery' : 'Recojo en Local'}
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 flex-1 flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/>
                            <input type="datetime-local" value={deliveryDate} onChange={(e)=>setDeliveryDate(e.target.value)} className="w-full text-xs font-bold bg-transparent outline-none dark:text-gray-300"/>
                        </div>
                    </div>
                    {/* OBSERVACIONES OPCIONALES */}
                    <textarea 
                        placeholder="Observaciones generales (Opcional)..." 
                        value={ticketObservations} 
                        onChange={(e)=>setTicketObservations(e.target.value)} 
                        className="w-full bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 text-xs outline-none h-10 resize-none dark:text-gray-300"
                    />

                    {/* CONTROL DE PAGO */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase flex gap-1 items-center"><Wallet size={14}/> Estado de Pago</span>
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-0.5 border dark:border-gray-700">
                                {['PENDIENTE', 'PARCIAL', 'PAGADO'].map(status => (
                                    <button key={status} onClick={() => setPaymentStatus(status)} 
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${paymentStatus === status ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentStatus !== 'PENDIENTE' && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="relative flex-1">
                                    <DollarSign size={14} className="absolute left-2 top-2.5 text-gray-400"/>
                                    <input 
                                        type="number" 
                                        placeholder="Monto" 
                                        value={paymentAmount} 
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        readOnly={paymentStatus === 'PAGADO'} 
                                        className={`w-full pl-6 pr-2 py-2 rounded-lg border text-sm font-bold outline-none ${paymentStatus === 'PAGADO' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-white dark:bg-gray-800 dark:text-white focus:ring-2 ring-blue-500'}`}
                                    />
                                </div>
                                <select 
                                    value={paymentMethod} 
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 text-xs font-bold outline-none w-24 dark:text-gray-300"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="YAPE">Yape</option>
                                    <option value="PLIN">Plin</option>
                                    <option value="TARJETA">Tarjeta</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-1">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Estimado</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">S/ {total.toFixed(2)}</span>
                        </div>
                        <button onClick={validateAndAskConfirmation} className="w-full bg-gray-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-black dark:hover:bg-blue-700 shadow-lg shadow-gray-900/20 active:scale-95 transition-all flex justify-center gap-2 items-center">
                            <Save size={20}/> EMITIR TICKET
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;