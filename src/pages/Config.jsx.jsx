import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { 
  BuildingStorefrontIcon, 
  CreditCardIcon, 
  TagIcon, 
  TicketIcon,
  UserGroupIcon,
  CubeIcon,
  BellIcon,
  MapPinIcon,
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  QrCodeIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Config = () => {
  const [activeTab, setActiveTab] = useState('negocio');
  
  // --- ESTADOS DE DATOS ---
  const [empresa, setEmpresa] = useState({
    nombre: '', ruc: '', direccion_fiscal: '', 
    telefono_contacto: '', email_contacto: '', moneda: 'PEN', 
    logo: null, plan: 'FREE', estado: 'ACTIVO',
    stock_minimo_global: 10,
    notif_email_activas: true,
    notif_whatsapp_activas: false,
    notif_sms_activas: false
  });
  const [sedes, setSedes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prendas, setPrendas] = useState([]); 
  
  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [modalSede, setModalSede] = useState({ open: false, data: null });
  const [modalPago, setModalPago] = useState({ open: false, data: null });
  const [modalServicio, setModalServicio] = useState({ open: false, data: null });
  const [modalPrecios, setModalPrecios] = useState({ open: false, data: null });
  const [modalCategoria, setModalCategoria] = useState({ open: false, data: null });

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resEmpresa, resSedes, resPagos, resCats, resServicios, resPrendas] = await Promise.all([
        axios.get('/core/empresa/'),
        axios.get('/core/sedes/'),
        axios.get('/pagos/config/'),
        axios.get('/categorias-servicio/'),
        axios.get('/servicios/'),
        axios.get('/prendas/')
      ]);

      if (resEmpresa.data.results && resEmpresa.data.results.length > 0) {
        setEmpresa(resEmpresa.data.results[0]);
      }
      setSedes(resSedes.data.results || []);
      setMetodosPago(resPagos.data.results || []);
      setCategorias(resCats.data.results || []);
      setServicios(resServicios.data.results || []);
      setPrendas(resPrendas.data.results || []);
    } catch (error) {
      console.error("Error cargando configuración", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleGuardarEmpresa = async () => {
    setLoading(true);
    try {
      await axios.patch(`/core/empresa/${empresa.id}/`, empresa);
      toast.success("Datos actualizados correctamente");
      fetchInitialData();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (modalSede.data) {
        await axios.patch(`/core/sedes/${modalSede.data.id}/`, data);
        toast.success("Sede actualizada");
      } else {
        await axios.post('/core/sedes/', data);
        toast.success("Sede creada");
      }
      setModalSede({ open: false, data: null });
      const res = await axios.get('/core/sedes/');
      setSedes(res.data.results);
    } catch (error) {
      toast.error("Error guardando sede");
    }
  };

  const handleDeleteSede = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta sede?")) return;
    try {
      await axios.delete(`/core/sedes/${id}/`);
      setSedes(sedes.filter(s => s.id !== id));
      toast.success("Sede eliminada");
    } catch (error) {
      toast.error("No se puede eliminar");
    }
  };

  const handleSavePago = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.has('activo')) formData.append('activo', 'False');
    else formData.set('activo', 'True');

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    try {
      if (modalPago.data) {
        await axios.patch(`/pagos/config/${modalPago.data.id}/`, formData, config);
        toast.success("Método actualizado");
      } else {
        await axios.post('/pagos/config/', formData, config);
        toast.success("Método creado");
      }
      setModalPago({ open: false, data: null });
      const res = await axios.get('/pagos/config/');
      setMetodosPago(res.data.results);
    } catch (error) {
      toast.error("Error guardando método");
    }
  };

  const handleSaveServicio = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.disponible = formData.get('disponible') === 'on';
    try {
      if (modalServicio.data) {
        await axios.patch(`/servicios/${modalServicio.data.id}/`, data);
        toast.success("Servicio actualizado");
      } else {
        await axios.post('/servicios/', data);
        toast.success("Servicio creado");
      }
      setModalServicio({ open: false, data: null });
      const res = await axios.get('/servicios/');
      setServicios(res.data.results);
    } catch (error) {
      toast.error("Error guardando servicio");
    }
  };

  const handleSavePrecioPrenda = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      await axios.post(`/servicios/${modalPrecios.data.id}/establecer_precio_prenda/`, data);
      toast.success("Precio agregado");
      const res = await axios.get('/servicios/');
      setServicios(res.data.results);
      const updatedService = res.data.results.find(s => s.id === modalPrecios.data.id);
      setModalPrecios({ open: true, data: updatedService });
      e.target.reset();
    } catch (error) {
      toast.error("Error al guardar precio");
    }
  };

  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      if (modalCategoria.data) {
        await axios.patch(`/categorias-servicio/${modalCategoria.data.id}/`, data);
        toast.success("Categoría actualizada");
      } else {
        await axios.post('/categorias-servicio/', data);
        toast.success("Categoría creada");
      }
      setModalCategoria({ open: false, data: null });
      const res = await axios.get('/categorias-servicio/');
      setCategorias(res.data.results);
    } catch (error) {
      toast.error("Error guardando categoría");
    }
  };

  // --- MENÚ DE NAVEGACIÓN ---
  const tabs = [
    { id: 'negocio', label: 'Mi Negocio', icon: BuildingStorefrontIcon, color: 'blue' },
    { id: 'suscripcion', label: 'Suscripción', icon: SparklesIcon, color: 'purple' },
    { id: 'pagos', label: 'Métodos de Pago', icon: CreditCardIcon, color: 'green' },
    { id: 'servicios', label: 'Servicios y Precios', icon: TagIcon, color: 'orange' },
    { id: 'tickets', label: 'Config. Tickets', icon: TicketIcon, color: 'pink' },
    { id: 'usuarios', label: 'Usuarios y Roles', icon: UserGroupIcon, color: 'indigo' },
    { id: 'inventario', label: 'Inventario', icon: CubeIcon, color: 'teal' },
    { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon, color: 'yellow' },
  ];

  // --- VISTAS / TABS ---

  const TabNegocio = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUMNA IZQUIERDA: INFO EMPRESA */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" /> Información Principal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre Comercial</label>
              <input value={empresa.nombre || ''} onChange={e => setEmpresa({...empresa, nombre: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">RUC</label>
              <input value={empresa.ruc || ''} onChange={e => setEmpresa({...empresa, ruc: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Dirección Fiscal</label>
              <textarea value={empresa.direccion_fiscal || ''} onChange={e => setEmpresa({...empresa, direccion_fiscal: e.target.value})} className="input min-h-[80px]" rows="3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Teléfono</label>
                <input value={empresa.telefono_contacto || ''} onChange={e => setEmpresa({...empresa, telefono_contacto: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Moneda</label>
                <select value={empresa.moneda || 'PEN'} onChange={e => setEmpresa({...empresa, moneda: e.target.value})} className="input">
                  <option value="PEN">Soles (S/)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={empresa.email_contacto || ''} onChange={e => setEmpresa({...empresa, email_contacto: e.target.value})} className="input" />
            </div>
            <button onClick={handleGuardarEmpresa} disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: SEDES */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-green-600" /> Sedes y Sucursales
            </h3>
            <button onClick={() => setModalSede({ open: true, data: null })} className="btn-secondary text-sm">
              <PlusIcon className="h-4 w-4" /> Nueva Sede
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="th">Nombre</th>
                  <th className="th">Código</th>
                  <th className="th">Dirección</th>
                  <th className="th">Horario</th>
                  <th className="th text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sedes.length === 0 && (
                  <tr><td colSpan="5" className="td text-center text-gray-500 dark:text-gray-400 py-8">No hay sedes registradas</td></tr>
                )}
                {sedes.map((sede) => (
                  <tr key={sede.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="td font-semibold text-gray-900 dark:text-white">{sede.nombre}</td>
                    <td className="td font-mono text-sm text-gray-600 dark:text-gray-400">{sede.codigo}</td>
                    <td className="td text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{sede.direccion}</td>
                    <td className="td text-xs text-gray-500 dark:text-gray-400">{sede.horario_apertura} - {sede.horario_cierre}</td>
                    <td className="td text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModalSede({ open: true, data: sede })} className="btn-icon text-blue-600 dark:text-blue-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteSede(sede.id)} className="btn-icon text-red-600 dark:text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const TabSuscripcion = () => {
    const diasRestantes = Math.ceil((new Date(empresa.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
              <SparklesIcon className="h-12 w-12 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plan {empresa.plan}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {empresa.estado === 'ACTIVO' ? (
                  <span className="flex items-center gap-2">
                    <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                    Tu suscripción está activa
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">⚠️ Suscripción {empresa.estado}</span>
                )}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Días restantes</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{diasRestantes > 0 ? diasRestantes : 0}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: `${Math.min(100, (diasRestantes / 30) * 100)}%`}}></div>
                </div>
              </div>
              <button className="btn-primary">
                🚀 Renovar Suscripción
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TabPagos = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-green-600" /> Métodos de Pago Activos
        </h3>
        <button onClick={() => setModalPago({ open: true, data: null })} className="btn-primary text-sm">
          <PlusIcon className="h-4 w-4" /> Nuevo Método
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metodosPago.map(metodo => (
          <div key={metodo.id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-all group relative">
            <button onClick={() => setModalPago({ open: true, data: metodo })} className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {metodo.imagen_qr ? (
                  <img src={metodo.imagen_qr} alt="QR" className="w-full h-full object-cover" />
                ) : (
                  <QrCodeIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">{metodo.nombre_mostrar}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">{metodo.codigo_metodo}</p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${metodo.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                  {metodo.activo ? 'Activo' : 'Inactivo'}
                </span>
                {metodo.numero_cuenta && <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 truncate font-medium">{metodo.numero_cuenta}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TabServicios = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* SIDEBAR: CATEGORÍAS */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Categorías</h4>
            <button onClick={() => setModalCategoria({ open: true, data: null })} className="btn-icon text-blue-600 dark:text-blue-400">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {categorias.map(c => (
              <div key={c.id} className="group flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{c.nombre}</span>
                <button onClick={() => setModalCategoria({ open: true, data: c })} className="opacity-0 group-hover:opacity-100 btn-icon p-1">
                  <PencilIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA SERVICIOS */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-orange-500" /> Catálogo de Servicios
            </h3>
            <button onClick={() => setModalServicio({ open: true, data: null })} className="btn-primary text-sm">
              <PlusIcon className="h-4 w-4" /> Nuevo Servicio
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="th">Servicio</th>
                  <th className="th">Tipo</th>
                  <th className="th">Precio</th>
                  <th className="th text-center">Estado</th>
                  <th className="th text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {servicios.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="td">
                      <div className="font-bold text-gray-900 dark:text-white">{s.nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{s.codigo}</div>
                    </td>
                    <td className="td">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.tipo_cobro === 'POR_KILO' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                        {s.tipo_cobro === 'POR_KILO' ? 'Por Kilo' : s.tipo_cobro === 'POR_PRENDA' ? 'Por Prenda' : 'Fijo'}
                      </span>
                    </td>
                    <td className="td font-mono font-bold text-gray-900 dark:text-gray-200">S/ {parseFloat(s.precio_base).toFixed(2)}</td>
                    <td className="td text-center">
                      {s.disponible ? 
                        <CheckBadgeIcon className="w-5 h-5 text-green-500 mx-auto"/> : 
                        <XMarkIcon className="w-5 h-5 text-gray-400 dark:text-gray-600 mx-auto"/>
                      }
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModalServicio({ open: true, data: s })} className="btn-icon text-blue-600 dark:text-blue-400">
                          <PencilIcon className="h-4 w-4"/>
                        </button>
                        {s.tipo_cobro === 'POR_PRENDA' && (
                          <button onClick={() => setModalPrecios({ open: true, data: s })} className="btn-icon text-purple-600 dark:text-purple-400">
                            <CurrencyDollarIcon className="h-4 w-4"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const TabTickets = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TicketIcon className="h-5 w-5 text-pink-600" /> Configuración de Tickets
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prefijo de Numeración</label>
              <input defaultValue="TK-" className="input" placeholder="TK-" />
            </div>
            <div>
              <label className="label">Plazo de Entrega (días)</label>
              <input type="number" defaultValue="2" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Mensaje al Pie del Ticket</label>
            <textarea className="input min-h-[100px]" rows="4" placeholder="Política de cancelación, términos y condiciones..."></textarea>
          </div>
          <div>
            <label className="label">Tamaño de Papel de Impresión</label>
            <select className="input">
              <option>80mm (Estándar)</option>
              <option>58mm (Compacto)</option>
            </select>
          </div>
          <button className="btn-primary w-full">Guardar Configuración</button>
        </div>
      </div>
    </div>
  );

  const TabUsuarios = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-indigo-600" /> Usuarios y Permisos
        </h3>
        <button className="btn-primary text-sm">
          <PlusIcon className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <UserGroupIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="font-semibold">Gestión de usuarios próximamente</p>
        <p className="text-sm mt-2">Aquí podrás crear usuarios con roles (Admin, Cajero, Operario)</p>
      </div>
    </div>
  );

  const TabInventario = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <CubeIcon className="h-5 w-5 text-teal-600" /> Configuración de Inventario
      </h3>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="label">Stock Mínimo Global (Alerta)</label>
          <input 
            type="number" 
            value={empresa.stock_minimo_global || 10} 
            onChange={e => setEmpresa({...empresa, stock_minimo_global: parseInt(e.target.value)})}
            className="input" 
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se notificará cuando productos bajen de este nivel</p>
        </div>
        <button onClick={handleGuardarEmpresa} className="btn-primary">Guardar Configuración</button>
      </div>
    </div>
  );

  const TabNotificaciones = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <BellIcon className="h-5 w-5 text-yellow-600" /> Configuración de Notificaciones
      </h3>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            ⚠️ Módulo en desarrollo. Configuración disponible próximamente.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Canales de Notificación</h4>
          
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
            <input 
              type="checkbox" 
              checked={empresa.notif_email_activas}
              onChange={e => setEmpresa({...empresa, notif_email_activas: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Email</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Enviar notificaciones por correo electrónico</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer opacity-60">
            <input 
              type="checkbox" 
              checked={empresa.notif_whatsapp_activas}
              onChange={e => setEmpresa({...empresa, notif_whatsapp_activas: e.target.checked})}
              className="w-5 h-5 text-green-600 rounded"
              disabled
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">WhatsApp <span className="text-xs text-yellow-600">(Próximamente)</span></div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Enviar mensajes por WhatsApp Business</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer opacity-60">
            <input 
              type="checkbox" 
              checked={empresa.notif_sms_activas}
              onChange={e => setEmpresa({...empresa, notif_sms_activas: e.target.checked})}
              className="w-5 h-5 text-purple-600 rounded"
              disabled
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">SMS <span className="text-xs text-yellow-600">(Próximamente)</span></div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Enviar mensajes de texto</div>
            </div>
          </label>
        </div>

        <button onClick={handleGuardarEmpresa} className="btn-primary">Guardar Configuración</button>
      </div>
    </div>
  );

  // --- MODAL WRAPPER ---
  const ModalContainer = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
            <XMarkIcon className="h-6 w-6"/>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* SIDEBAR IZQUIERDO - PESTAÑAS */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu sistema</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  isActive
                    ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-300 font-semibold shadow-sm`
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? `text-${tab.color}-600` : 'text-gray-400'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'negocio' && <TabNegocio />}
          {activeTab === 'suscripcion' && <TabSuscripcion />}
          {activeTab === 'pagos' && <TabPagos />}
          {activeTab === 'servicios' && <TabServicios />}
          {activeTab === 'tickets' && <TabTickets />}
          {activeTab === 'usuarios' && <TabUsuarios />}
          {activeTab === 'inventario' && <TabInventario />}
          {activeTab === 'notificaciones' && <TabNotificaciones />}
        </div>
      </div>

      {/* MODALES */}
      {modalSede.open && (
        <ModalContainer title={modalSede.data ? 'Editar Sede' : 'Nueva Sede'} onClose={() => setModalSede({ open: false, data: null })}>
          <form onSubmit={handleSaveSede} className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input name="nombre" defaultValue={modalSede.data?.nombre} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Código</label><input name="codigo" defaultValue={modalSede.data?.codigo} className="input" required /></div>
              <div><label className="label">Teléfono</label><input name="telefono" defaultValue={modalSede.data?.telefono} className="input" /></div>
            </div>
            <div><label className="label">Dirección</label><input name="direccion" defaultValue={modalSede.data?.direccion} className="input" required /></div>
            <div><label className="label">Email</label><input type="email" name="email" defaultValue={modalSede.data?.email} className="input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Apertura</label><input type="time" name="horario_apertura" defaultValue={modalSede.data?.horario_apertura || "08:00"} className="input" /></div>
              <div><label className="label">Cierre</label><input type="time" name="horario_cierre" defaultValue={modalSede.data?.horario_cierre || "20:00"} className="input" /></div>
            </div>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
      )}

      {modalPago.open && (
        <ModalContainer title="Método de Pago" onClose={() => setModalPago({ open: false, data: null })}>
          <form onSubmit={handleSavePago} className="space-y-4">
            <div>
              <label className="label">Tipo</label>
              <select name="codigo_metodo" defaultValue={modalPago.data?.codigo_metodo || 'YAPE'} className="input">
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="label">Nombre a Mostrar</label>
              <input name="nombre_mostrar" defaultValue={modalPago.data?.nombre_mostrar} className="input" required />
            </div>
            <div>
              <label className="label">Número / Cuenta</label>
              <input name="numero_cuenta" defaultValue={modalPago.data?.numero_cuenta} className="input" />
            </div>
            <div>
              <label className="label">QR (Imagen)</label>
              <input type="file" name="imagen_qr" accept="image/*" className="input text-sm" />
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input type="checkbox" name="activo" defaultChecked={modalPago.data?.activo !== false} className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Método Activo</span>
            </label>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
      )}

      {modalServicio.open && (
        <ModalContainer title={modalServicio.data ? 'Editar Servicio' : 'Nuevo Servicio'} onClose={() => setModalServicio({ open: false, data: null })}>
          <form onSubmit={handleSaveServicio} className="space-y-4">
            <div><label className="label">Nombre</label><input name="nombre" defaultValue={modalServicio.data?.nombre} className="input" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Código</label><input name="codigo" defaultValue={modalServicio.data?.codigo} className="input" required /></div>
              <div><label className="label">Precio Base</label><input type="number" step="0.1" name="precio_base" defaultValue={modalServicio.data?.precio_base} className="input" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select name="categoria" defaultValue={modalServicio.data?.categoria} className="input">
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo de Cobro</label>
                <select name="tipo_cobro" defaultValue={modalServicio.data?.tipo_cobro || 'POR_KILO'} className="input">
                  <option value="POR_UNIDAD">Precio Fijo</option>
                  <option value="POR_KILO">Por Kilo</option>
                  <option value="POR_PRENDA">Por Prenda</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input type="checkbox" name="disponible" defaultChecked={modalServicio.data?.disponible !== false} className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Disponible en POS</span>
            </label>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
      )}

      {modalPrecios.open && (
        <ModalContainer title={`Precios: ${modalPrecios.data?.nombre}`} onClose={() => setModalPrecios({ open: false, data: null })}>
          <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Define precios específicos por tipo de prenda
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
            {modalPrecios.data?.precios_prendas?.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Sin precios definidos</p>}
            {modalPrecios.data?.precios_prendas?.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                <span className="font-medium text-gray-900 dark:text-white">{p.prenda_nombre}</span>
                <span className="font-bold text-green-600 dark:text-green-400">S/ {p.precio}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSavePrecioPrenda} className="flex gap-2 border-t dark:border-gray-700 pt-4">
            <select name="prenda" className="flex-1 input text-sm" required>
              <option value="">Seleccionar...</option>
              {prendas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input name="precio" type="number" step="0.10" placeholder="0.00" className="w-24 input text-sm" required />
            <button className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 font-bold">+</button>
          </form>
        </ModalContainer>
      )}

      {modalCategoria.open && (
        <ModalContainer title={modalCategoria.data ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModalCategoria({ open: false, data: null })}>
          <form onSubmit={handleSaveCategoria} className="space-y-4">
            <div><label className="label">Nombre</label><input name="nombre" defaultValue={modalCategoria.data?.nombre} className="input" required /></div>
            <div><label className="label">Descripción</label><textarea name="descripcion" defaultValue={modalCategoria.data?.descripcion} className="input min-h-[80px]" rows="3" /></div>
            <div><label className="label">Orden</label><input type="number" name="orden" defaultValue={modalCategoria.data?.orden || 0} className="input" /></div>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
      )}

      {/* ESTILOS */}
      <style>{`
        .input { 
          @apply w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
          text-gray-900 dark:text-white rounded-lg px-3 py-2.5 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500; 
        }
        .label { 
          @apply block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide; 
        }
        .th { 
          @apply px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider; 
        }
        .td { 
          @apply px-4 py-3 text-sm text-gray-900 dark:text-gray-200; 
        }
        .btn-primary { 
          @apply inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white 
          rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-500 
          transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed; 
        }
        .btn-secondary { 
          @apply inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 
          text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 
          rounded-lg font-bold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors; 
        }
        .btn-icon { 
          @apply inline-flex items-center justify-center p-1.5 rounded-lg 
          hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors; 
        }
      `}</style>
    </div>
  );
};

export default Config;