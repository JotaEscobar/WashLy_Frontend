import { useState, useEffect } from 'react';
import { 
    Wallet, Search, ArrowUpRight, ArrowDownLeft, 
    DollarSign, CreditCard, Lock, Unlock, 
    FileText, AlertTriangle, CheckCircle, RefreshCw, Plus 
} from 'lucide-react';
import api from '../api/axiosConfig';

const Payments = () => {
    // --- ESTADOS ---
    const [caja, setCaja] = useState(null); // Objeto caja o null
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PAGOS'); // 'PAGOS' | 'MOVIMIENTOS'
    
    // Listados
    const [pagos, setPagos] = useState([]);
    const [movimientos, setMovimientos] = useState([]); // Gastos manuales
    
    // Filtros Pagos
    const [searchTerm, setSearchTerm] = useState('');

    // Modales
    const [showAbrir, setShowAbrir] = useState(false);
    const [showCerrar, setShowCerrar] = useState(false);
    const [showGasto, setShowGasto] = useState(false);
    
    // Formularios
    const [montoInicial, setMontoInicial] = useState('');
    const [gastoForm, setGastoForm] = useState({ monto: '', descripcion: '', categoria: 'PROVEEDORES' });
    const [cierreForm, setCierreForm] = useState({ montoReal: '', comentarios: '' });

    // --- CARGA INICIAL ---
    const fetchCaja = async () => {
        setLoading(true);
        try {
            const res = await api.get('pagos/caja/mi_caja/');
            setCaja(res.data); // Si es null, muestra pantalla de apertura
            if (res.data) {
                fetchData(res.data.id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        // Cargar Pagos (Ventas)
        try {
            const resPagos = await api.get(`pagos/lista/?search=${searchTerm}`);
            setPagos(resPagos.data.results || resPagos.data);
            // Nota: Aquí idealmente cargaríamos también los movimientos manuales
            // si tuvieras un endpoint para listarlos, o vienen dentro del objeto caja
        } catch(e) {}
    };

    useEffect(() => { fetchCaja(); }, []);
    useEffect(() => { if(caja) fetchData(); }, [searchTerm]);

    // --- ACCIONES DE CAJA ---
    const handleAbrir = async () => {
        if(!montoInicial) return alert("Ingrese monto");
        try {
            const res = await api.post('pagos/caja/abrir/', { monto_inicial: montoInicial });
            setCaja(res.data);
            setShowAbrir(false);
        } catch (e) { alert(e.response?.data?.error || "Error"); }
    };

    const handleCerrar = async () => {
        if(!cierreForm.montoReal) return alert("Ingrese monto real");
        try {
            await api.post(`pagos/caja/${caja.id}/cerrar/`, { 
                monto_real: cierreForm.montoReal,
                comentarios: cierreForm.comentarios
            });
            alert("Caja Cerrada Correctamente");
            setCaja(null);
            setShowCerrar(false);
        } catch (e) { alert("Error al cerrar"); }
    };

    const handleRegistrarGasto = async () => {
        try {
            await api.post(`pagos/caja/${caja.id}/movimiento/`, {
                tipo: 'EGRESO',
                ...gastoForm
            });
            alert("Gasto registrado");
            setShowGasto(false);
            setGastoForm({ monto: '', descripcion: '', categoria: 'PROVEEDORES' });
            fetchCaja(); // Recargar saldo
        } catch (e) { alert("Error"); }
    };

    const handleAnularPago = async (id) => {
        if(!window.confirm("¿Seguro de anular este pago? Se liberará la deuda en el ticket.")) return;
        try {
            await api.post(`pagos/lista/${id}/anular/`);
            fetchData();
            fetchCaja();
        } catch (e) { alert("Error al anular"); }
    };

    // --- RENDERIZADO: PANTALLA CAJA CERRADA ---
    if (!loading && !caja) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
                    <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32}/>
                    </div>
                    <h1 className="text-2xl font-black mb-2">Caja Cerrada</h1>
                    <p className="text-gray-500 mb-6">Inicia tu turno aperturando la caja con el saldo inicial.</p>
                    <div className="text-left mb-4">
                        <label className="text-xs font-bold uppercase text-gray-500">Monto Inicial (S/)</label>
                        <input 
                            type="number" 
                            value={montoInicial} 
                            onChange={e => setMontoInicial(e.target.value)}
                            className="w-full p-3 text-xl font-bold border rounded-xl mt-1 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    <button onClick={handleAbrir} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
                        Abrir Caja
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="p-10 text-center">Cargando Sistema Financiero...</div>;

    // --- RENDERIZADO: CAJA ABIERTA (DASHBOARD) ---
    return (
        <div className="p-6 h-full flex flex-col text-gray-800 dark:text-gray-100 overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Wallet className="text-emerald-500"/> Gestión de Caja
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200 uppercase font-bold">Activa</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Turno de: <strong>{caja.usuario || 'Usuario'}</strong></p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCaja} className="p-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"><RefreshCw size={20}/></button>
                    <button onClick={() => setShowGasto(true)} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-bold border border-red-200 flex gap-2 items-center">
                        <ArrowDownLeft size={18}/> Registrar Gasto
                    </button>
                    <button onClick={() => setShowCerrar(true)} className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-xl font-bold flex gap-2 items-center shadow-lg">
                        <Lock size={18}/> Cerrar Caja
                    </button>
                </div>
            </div>

            {/* Scorecards (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* 1. Saldo Real (Lo más importante) */}
                <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] opacity-20"><DollarSign size={100}/></div>
                    <p className="text-blue-100 text-xs font-bold uppercase mb-1">Efectivo en Caja (Teórico)</p>
                    <p className="text-3xl font-black">S/ {caja.total_efectivo.toFixed(2)}</p>
                    <p className="text-xs text-blue-200 mt-2">Base: S/ {caja.monto_inicial}</p>
                </div>

                {/* 2. Ventas Digitales */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Dinero Digital</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">S/ {caja.total_digital.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><CreditCard size={20}/></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Yape, Plin, Tarjetas</p>
                </div>

                {/* 3. Total Ventas (Tickets) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Ventas del Turno</p>
                            <p className="text-2xl font-black text-emerald-600">S/ {caja.total_ventas.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowUpRight size={20}/></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Proveniente de Tickets</p>
                </div>

                {/* 4. Gastos */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Salidas / Gastos</p>
                            <p className="text-2xl font-black text-red-600">S/ {caja.total_gastos.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowDownLeft size={20}/></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Manuales</p>
                </div>
            </div>

            {/* TABLA DE PAGOS (TICKETS) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Toolbar Tabla */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Ingresos por Tickets</h3>
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, ticket..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Hora</th>
                                <th className="p-4">Ticket</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Método</th>
                                <th className="p-4 text-right">Monto</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {pagos.map(pago => (
                                <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-mono text-gray-500">{new Date(pago.fecha_pago).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                    <td className="p-4 font-bold text-blue-600">{pago.ticket_numero}</td>
                                    <td className="p-4 font-medium">{pago.cliente_nombre}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold border border-gray-200 dark:border-gray-600">{pago.metodo_pago}</span></td>
                                    <td className="p-4 text-right font-black">S/ {pago.monto}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black border uppercase ${pago.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {pago.estado}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {pago.estado === 'PAGADO' && (
                                            <button onClick={() => handleAnularPago(pago.id)} className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline">
                                                Anular
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {pagos.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay pagos registrados hoy</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL REGISTRAR GASTO */}
            {showGasto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Registrar Salida de Dinero</h3>
                        <div className="space-y-3">
                            <input 
                                type="number" placeholder="Monto (S/)" 
                                className="w-full p-3 border rounded-xl font-bold dark:bg-gray-700 dark:border-gray-600"
                                value={gastoForm.monto} onChange={e => setGastoForm({...gastoForm, monto: e.target.value})}
                            />
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                                value={gastoForm.categoria} onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})}
                            >
                                <option value="PROVEEDORES">Pago Proveedores</option>
                                <option value="SERVICIOS">Luz / Agua / Internet</option>
                                <option value="PERSONAL">Adelanto Personal</option>
                                <option value="INSUMOS">Compra Insumos</option>
                                <option value="OTROS">Otros Gastos</option>
                            </select>
                            <textarea 
                                placeholder="Descripción del gasto..." 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 h-20"
                                value={gastoForm.descripcion} onChange={e => setGastoForm({...gastoForm, descripcion: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowGasto(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleRegistrarGasto} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Registrar Salida</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CIERRE CAJA */}
            {showCerrar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl border-t-4 border-gray-900">
                        <h3 className="text-lg font-bold mb-1">Cierre de Caja</h3>
                        <p className="text-sm text-gray-500 mb-6">Ingresa el dinero físico contado.</p>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-300 uppercase">Sistema Calcula (Efectivo + Digital)</p>
                            <p className="text-2xl font-black">S/ {caja.saldo_actual.toFixed(2)}</p>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold uppercase text-gray-500">Monto Real (Contado)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-xl text-center text-xl font-bold dark:bg-gray-900 dark:border-gray-600"
                                placeholder="0.00"
                                value={cierreForm.montoReal} onChange={e => setCierreForm({...cierreForm, montoReal: e.target.value})}
                            />
                            {cierreForm.montoReal && (
                                <p className={`text-center text-xs font-bold mt-2 ${parseFloat(cierreForm.montoReal) - caja.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Diferencia: S/ {(parseFloat(cierreForm.montoReal) - caja.saldo_actual).toFixed(2)}
                                </p>
                            )}
                        </div>
                        
                        <textarea 
                            placeholder="Comentarios del cierre..." 
                            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 h-20 text-sm mb-6"
                            value={cierreForm.comentarios} onChange={e => setCierreForm({...cierreForm, comentarios: e.target.value})}
                        />

                        <div className="flex gap-2">
                            <button onClick={() => setShowCerrar(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleCerrar} className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-bold">Cerrar Turno</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Payments;