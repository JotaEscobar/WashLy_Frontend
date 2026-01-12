import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, MessageCircle, Crown, AlertCircle, Edit, History, User, Save, X, Calendar, MapPin } from 'lucide-react';
import api from '../api/axiosConfig';

const Clients = () => {
    // --- ESTADOS ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal y Selección
    const [selectedClient, setSelectedClient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'history'
    const [clientTickets, setClientTickets] = useState([]);

    // Formulario
    const [formData, setFormData] = useState({
        id: null, tipo_documento: 'DNI', numero_documento: '', 
        nombres: '', apellidos: '', telefono: '', email: '', direccion: '', notas: ''
    });

    const searchTimeoutRef = useRef(null);

    // --- CARGA DE DATOS ---
    const fetchClients = async (searchTerm = '') => {
        setLoading(true);
        try {
            const res = await api.get(`clientes/?search=${searchTerm}`);
            setClients(res.data.results || res.data);
        } catch (err) {
            console.error("Error cargando clientes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Buscador con Debounce
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            fetchClients(search);
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [search]);

    // Cargar Historial al seleccionar cliente
    useEffect(() => {
        if (selectedClient && activeTab === 'history') {
            const loadHistory = async () => {
                try {
                    const res = await api.get(`clientes/${selectedClient.id}/tickets/`);
                    setClientTickets(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            loadHistory();
        }
    }, [selectedClient, activeTab]);

    // --- HANDLERS ---
    const handleOpenModal = (client = null) => {
        if (client) {
            setSelectedClient(client);
            setFormData(client);
            setActiveTab('profile');
        } else {
            setSelectedClient(null);
            setFormData({
                tipo_documento: 'DNI', numero_documento: '', nombres: '', apellidos: '', 
                telefono: '', email: '', direccion: '', notas: ''
            });
            setActiveTab('profile');
        }
        setShowModal(true);
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.patch(`clientes/${formData.id}/`, formData);
            } else {
                await api.post('clientes/', formData);
            }
            setShowModal(false);
            fetchClients(search); // Recargar lista
        } catch (err) {
            alert("Error al guardar: " + JSON.stringify(err.response?.data));
        }
    };

    // --- RENDER HELPERS ---
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : 'CLI';
    };

    const formatCurrency = (amount) => `S/ ${parseFloat(amount).toFixed(2)}`;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white">Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gestión de relaciones y seguimiento</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                >
                    <UserPlus size={20} /> Nuevo Cliente
                </button>
            </div>

            {/* BUSCADOR */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, DNI o teléfono..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                />
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
                <div className="overflow-y-auto h-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase sticky top-0">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">Dirección</th> {/* NUEVA COLUMNA */}
                                <th className="p-4">Última Visita</th>
                                <th className="p-4 text-right">Saldo Pendiente</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Cargando clientes...</td></tr>
                            ) : clients.map(client => (
                                <tr key={client.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm relative">
                                                {getInitials(client.nombres)}
                                                {client.es_vip && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5 border-2 border-white dark:border-gray-800" title="Cliente VIP (Gasto > S/200 mes)">
                                                        <Crown size={10} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{client.nombre_completo}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{client.tipo_documento}: {client.numero_documento}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{client.telefono}</span>
                                            {client.telefono && (
                                                <a 
                                                    href={`https://wa.me/51${client.telefono}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-green-500 hover:text-green-600 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg transition-colors"
                                                    title="Abrir WhatsApp"
                                                >
                                                    <MessageCircle size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    {/* NUEVA CELDA: DIRECCIÓN */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 max-w-[200px]">
                                            <MapPin size={14} className="flex-shrink-0" />
                                            <span className="text-sm truncate" title={client.direccion}>
                                                {client.direccion || 'No registrada'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400"/>
                                            {formatDate(client.ultima_visita)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {client.saldo_pendiente > 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                                                <AlertCircle size={12} />
                                                -{formatCurrency(client.saldo_pendiente)}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400">Al día</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => handleOpenModal(client)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL / DRAWER DETALLE */}
            {showModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
                    <div className="w-[600px] h-full bg-white dark:bg-gray-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedClient ? selectedClient.nombre_completo : 'Nuevo Cliente'}
                                    {selectedClient?.es_vip && <Crown className="text-yellow-500 fill-yellow-500" size={24}/>}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    {selectedClient ? `ID: ${selectedClient.numero_documento}` : 'Complete la información'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        {selectedClient && (
                            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                                <button 
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <User size={18} /> Perfil
                                </button>
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <History size={18} /> Historial
                                </button>
                            </div>
                        )}

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50">
                            
                            {/* TAB: PERFIL (FORMULARIO) */}
                            {(!selectedClient || activeTab === 'profile') && (
                                <form onSubmit={handleSaveClient} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo Doc</label>
                                            <select 
                                                className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500"
                                                value={formData.tipo_documento}
                                                onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CE">Carnet Ext.</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Número *</label>
                                            <input 
                                                type="text" required
                                                className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500"
                                                value={formData.numero_documento}
                                                onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nombres *</label>
                                            <input type="text" required className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500" value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Apellidos</label>
                                            <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500" value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono *</label>
                                            <input type="text" required className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                            <input type="email" className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Dirección</label>
                                        <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Notas Internas</label>
                                        <textarea 
                                            rows="3"
                                            className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 ring-blue-500"
                                            value={formData.notas}
                                            onChange={(e) => setFormData({...formData, notas: e.target.value})}
                                            placeholder="Preferencias del cliente, observaciones..."
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg mt-4 flex items-center justify-center gap-2">
                                        <Save size={20}/> GUARDAR CAMBIOS
                                    </button>
                                </form>
                            )}

                            {/* TAB: HISTORIAL */}
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {clientTickets.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400">Sin historial de servicios</div>
                                    ) : clientTickets.map(ticket => (
                                        <div key={ticket.id} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">{ticket.numero_ticket}</span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-300">{formatDate(ticket.fecha_recepcion)}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${ticket.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 
                                                      ticket.estado === 'CANCELADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {ticket.estado}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {ticket.es_extornable ? '⚠️ Posible error' : 'Servicio estándar'}
                                                </span>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900 dark:text-white">{formatCurrency(ticket.total)}</p>
                                                    {ticket.saldo_pendiente > 0 && (
                                                        <p className="text-xs text-red-500 font-bold">Debe: {formatCurrency(ticket.saldo_pendiente)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;