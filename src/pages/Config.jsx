import React, { useState, useEffect, useMemo } from 'react';
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
  CheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


import { SectionHeader, ModalContainer } from '../components/config/Shared';
import { TabNegocio } from '../components/config/TabNegocio';
import { TabSuscripcion } from '../components/config/TabSuscripcion';
import { TabPagos } from '../components/config/TabPagos';
import { TabServicios } from '../components/config/TabServicios';
import { TabTickets } from '../components/config/TabTickets';
import { TabUsuarios } from '../components/config/TabUsuarios';
import { ModalSede } from '../components/config/ModalSede';
import { ModalPago } from '../components/config/ModalPago';
import { ModalServicio } from '../components/config/ModalServicio';
import { ModalCategoria } from '../components/config/ModalCategoria';
import { ModalUsuario } from '../components/config/ModalUsuario';
import { TabNotificaciones } from '../components/config/TabNotificaciones';
import { ModalPreciosManager } from '../components/config/ModalPreciosManager';


const Config = () => {
  const { user, updateUser } = useAuth(); // Added useAuth hook
  const [activeTab, setActiveTab] = useState('negocio');

  // --- ESTADOS DE DATOS ---
  const [empresa, setEmpresa] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [historialSuscripcion, setHistorialSuscripcion] = useState([]);

  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(false);

  // Modos de Edición Independientes
  const [editModeEmpresa, setEditModeEmpresa] = useState(false);
  const [editModeTickets, setEditModeTickets] = useState(false);


  // Modales
  const [modalSede, setModalSede] = useState({ open: false, data: null });
  const [modalPago, setModalPago] = useState({ open: false, data: null });
  const [modalServicio, setModalServicio] = useState({ open: false, data: null });
  const [modalPrecios, setModalPrecios] = useState({ open: false, data: null });
  const [modalCategoria, setModalCategoria] = useState({ open: false, data: null });
  const [modalUsuario, setModalUsuario] = useState({ open: false, data: null }); // NUEVO MODAL

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resEmpresa, resSedes, resPagos, resCats, resServicios, resPrendas, resUsuarios, resHistorial] = await Promise.all([
        axios.get('/core/empresa/'),
        axios.get('/core/sedes/'),
        axios.get('/pagos/config/?todos=true'),
        axios.get('/categorias-servicio/'),
        axios.get('/servicios/'),
        axios.get('/prendas/'),
        axios.get('/usuarios/'),
        axios.get('/core/historial-suscripcion/')
      ]);

      // Helper: DRF puede devolver {results:[...]} (paginado) o [...] (sin paginación)
      const extractList = (res) => Array.isArray(res.data) ? res.data : (res.data.results || []);

      const empresaList = extractList(resEmpresa);
      if (empresaList.length > 0) {
        setEmpresa(empresaList[0]);
      } else {
        setEmpresa({ nombre: '', ruc: '', moneda: 'PEN' });
      }

      setSedes(extractList(resSedes));
      setMetodosPago(extractList(resPagos));
      setCategorias(extractList(resCats));
      setServicios(extractList(resServicios));
      setPrendas(extractList(resPrendas));
      setUsuarios(extractList(resUsuarios));
      setHistorialSuscripcion(extractList(resHistorial));
    } catch (error) {
      console.error("Error cargando configuración", error);
      toast.error("Error al cargar datos del sistema");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleGuardarEmpresa = async () => {
    if (!empresa?.id) {
      toast.error("No se identificó la empresa para actualizar.");
      return;
    }
    setLoading(true);
    try {
      // 1. Preparar datos para el envío. 
      // Omitimos los campos que son URLs de imágenes para que PATCH no intente sobreescribirlos con strings.
      // Pero incluimos explícitamente los Files para subida de imágenes.
      const cleanedData = {};
      const fieldsToSave = [
        'nombre', 'ruc', 'moneda', 'direccion_fiscal', 'telefono_contacto', 'email_contacto',
        'ticket_prefijo', 'ticket_mensaje_pie', 'ticket_servicios_descripcion', 'ticket_disclaimer',
        'stock_minimo_global', 'notif_email_activas', 'email_host', 'email_port', 'email_use_tls', 
        'email_host_user', 'email_host_password', 'notif_event_creacion', 'notif_event_listo', 'notif_event_entregado'
      ];

      fieldsToSave.forEach(key => {
        const value = empresa[key];
        if (value === undefined) return;
        
        // Si el valor es un File, se incluye siempre
        if (value instanceof File) {
          cleanedData[key] = value;
        } else {
          // Si es una cadena, solo se incluye si NO es una URL de imagen
          const isImageUrl = typeof value === 'string' && (value.startsWith('http') || value.startsWith('/media/'));
          if (!isImageUrl) {
            cleanedData[key] = value;
          }
        }
      });
      
      // También manejamos los campos de imagen principales de forma explícita
      if (empresa.logo instanceof File) cleanedData.logo = empresa.logo;
      if (empresa.ticket_logo instanceof File) cleanedData.ticket_logo = empresa.ticket_logo;

      let data = cleanedData;
      let config = {};

      // 2. Soporte para carga de archivos binarios (multipart/form-data)
      const hasFiles = Object.values(cleanedData).some(val => val instanceof File);
      if (hasFiles) {
        data = new FormData();
        Object.entries(cleanedData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
             data.append(key, value);
          }
        });
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      const response = await axios.patch(`/core/empresa/${empresa.id}/`, data, config);

      // 3. Sincronizar con el contexto global y refrescar estado local
      const updatedEmpresa = response.data;
      updateUser({ ...user, empresa: updatedEmpresa });
      setEmpresa(updatedEmpresa);

      toast.success("Configuración actualizada correctamente");
      setEditModeEmpresa(false);
      setEditModeTickets(false);
    } catch (error) {
      console.error("Error al guardar empresa:", error);
      toast.error(error.response?.data?.detail || "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (modalSede.data?.id) {
        await axios.patch(`/core/sedes/${modalSede.data.id}/`, data);
        toast.success("Sede actualizada");
      } else {
        await axios.post('/core/sedes/', data);
        toast.success("Sede creada correctamente");
      }
      setModalSede({ open: false, data: null });
      const res = await axios.get('/core/sedes/');
      setSedes(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error(error);
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
      toast.error("No se puede eliminar (puede tener tickets asociados)");
    }
  };

  const handleSavePago = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const isActive = formData.get('activo') === 'on' ? 'True' : 'False';
    formData.set('activo', isActive);
    const imageFile = formData.get('imagen_qr');
    if (imageFile instanceof File && imageFile.size === 0) {
      formData.delete('imagen_qr');
    }
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
      const res = await axios.get('/pagos/config/?todos=true');
      setMetodosPago(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error(error);
      toast.error("Error guardando método de pago");
    }
  };

  const handleDeleteMetodoPago = async (id) => {
    if (!window.confirm("¿Eliminar este método de pago? Los pagos existentes no se verán afectados.")) return;
    try {
      await axios.delete(`/pagos/config/${id}/`);
      setMetodosPago(metodosPago.filter(m => m.id !== id));
      toast.success("Método de pago eliminado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar (puede tener pagos asociados)");
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
      setServicios(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      toast.error("Error guardando servicio");
    }
  };

  const handleSavePrecioPrenda = async (payload) => {
    try {
      await axios.post(`/servicios/${modalPrecios.data.id}/establecer_precio_prenda/`, payload);
      toast.success("Catálogo actualizado");

      const [resServicios, resPrendas] = await Promise.all([
        axios.get('/servicios/'),
        axios.get('/prendas/')
      ]);
      const svcList = Array.isArray(resServicios.data) ? resServicios.data : (resServicios.data.results || []);
      const prnList = Array.isArray(resPrendas.data) ? resPrendas.data : (resPrendas.data.results || []);
      setServicios(svcList);
      setPrendas(prnList);

      const updatedService = svcList.find(s => s.id === modalPrecios.data.id);
      setModalPrecios({ open: true, data: updatedService });

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar precio");
    }
  };

  const handleDeletePrecioPrenda = async (prendaId) => {
    if (!window.confirm("¿Quitar esta prenda del catálogo de este servicio?")) return;
    try {
      await axios.post(`/servicios/${modalPrecios.data.id}/eliminar_precio_prenda/`, { prenda_id: prendaId });
      toast.success("Prenda desvinculada");

      const resServicios = await axios.get('/servicios/');
      const svcList2 = Array.isArray(resServicios.data) ? resServicios.data : (resServicios.data.results || []);
      setServicios(svcList2);
      const updatedService = svcList2.find(s => s.id === modalPrecios.data.id);
      setModalPrecios({ open: true, data: updatedService });
    } catch (error) {
      toast.error("Error al eliminar");
    }
  }

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
      setCategorias(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      toast.error("Error guardando categoría");
    }
  };

  // --- CORRECCIÓN EN CONFIG.JSX ---

  const handleSaveUsuario = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Estructura PLANA para el serializer (sin anidar en 'perfil')
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password, // Puede estar vacío en edit
      rol: data.rol,           // Enviamos directo
      sede_id: data.sede ? parseInt(data.sede) : null // Enviamos como 'sede_id' y convertimos a null si está vacío
    };

    // Si es update, eliminamos password si está vacío
    if (modalUsuario.data && !data.password) {
      delete payload.password;
    }
    // Validacion de seguridad para creación
    if (!modalUsuario.data && !payload.password) {
      return toast.error("La contraseña es obligatoria al crear");
    }

    try {
      if (modalUsuario.data) {
        await axios.patch(`/usuarios/${modalUsuario.data.id}/`, payload);
        toast.success("Usuario actualizado");
      } else {
        await axios.post('/usuarios/', payload);
        toast.success("Usuario creado: " + data.first_name);
      }
      setModalUsuario({ open: false, data: null });
      // Recargar lista
      const res = await axios.get('/usuarios/');
      setUsuarios(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error(error);
      // Mostrar mensaje de error específico del backend si existe
      const errorMsg = error.response?.data?.email?.[0] ||
        error.response?.data?.rol?.[0] ||
        "Error guardando usuario";
      toast.error(errorMsg);
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (!window.confirm("¿Desactivar este usuario? Ya no podrá acceder al sistema.")) return;
    try {
      await axios.delete(`/usuarios/${id}/`);
      toast.success("Usuario desactivado");
      const res = await axios.get('/usuarios/');
      setUsuarios(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      toast.error("No se pudo desactivar el usuario");
    }
  };

  // --- MENU LATERAL ---
  const tabs = [
    { id: 'negocio', label: 'Mi Negocio', icon: BuildingStorefrontIcon },
    { id: 'suscripcion', label: 'Suscripción', icon: SparklesIcon },
    { id: 'pagos', label: 'Pagos', icon: CreditCardIcon },
    { id: 'servicios', label: 'Servicios', icon: TagIcon },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'usuarios', label: 'Usuarios', icon: UserGroupIcon }, // AHORA FUNCIONAL

    { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* SIDEBAR NAVEGACIÓN */}
      <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex-shrink-0 z-10 shadow-sm">
        <div className="p-6 hidden lg:block">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Ajustes</h1>
          <p className="text-sm text-gray-500 font-medium">Panel de Control</p>
        </div>
        <nav className="p-2 lg:px-4 space-y-1 overflow-x-auto lg:overflow-visible flex lg:block scrollbar-hide">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left whitespace-nowrap group
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'negocio' && (
            <TabNegocio
              empresa={empresa}
              setEmpresa={setEmpresa}
              editMode={editModeEmpresa}
              setEditMode={setEditModeEmpresa}
              loading={loading}
              handleGuardar={handleGuardarEmpresa}
              sedes={sedes}
              setModalSede={setModalSede}
              handleDeleteSede={handleDeleteSede}
            />
          )}
          {activeTab === 'suscripcion' && <TabSuscripcion empresa={empresa} historial={historialSuscripcion} />}
          {activeTab === 'pagos' && <TabPagos metodosPago={metodosPago} setModalPago={setModalPago} onDeleteMetodo={handleDeleteMetodoPago} />}
          {activeTab === 'servicios' && (
            <TabServicios
              servicios={servicios}
              categorias={categorias}
              setModalServicio={setModalServicio}
              setModalCategoria={setModalCategoria}
              setModalPrecios={setModalPrecios}
            />
          )}
          {activeTab === 'tickets' && (
            <TabTickets
              empresa={empresa}
              setEmpresa={setEmpresa}
              editMode={editModeTickets}
              setEditMode={setEditModeTickets}
              handleGuardar={handleGuardarEmpresa}
            />
          )}
          {activeTab === 'usuarios' && (
            <TabUsuarios
              usuarios={usuarios}
              sedes={sedes}
              setModalUsuario={setModalUsuario}
              handleDeleteUsuario={handleDeleteUsuario}
            />
          )}

          {activeTab === 'notificaciones' && <TabNotificaciones empresa={empresa} setEmpresa={setEmpresa} handleGuardar={handleGuardarEmpresa} />}
        </div>
      </main>

      {/* MODAL SEDE */}
          <ModalSede modalSede={modalSede} setModalSede={setModalSede} handleSaveSede={handleSaveSede} />

      {/* MODAL PAGO */}
          <ModalPago modalPago={modalPago} setModalPago={setModalPago} handleSavePago={handleSavePago} />

      {/* MODAL SERVICIO */}
          <ModalServicio modalServicio={modalServicio} setModalServicio={setModalServicio} handleSaveServicio={handleSaveServicio} categorias={categorias} />

      {/* MODAL GESTOR DE PRECIOS */}
      {modalPrecios.open && (
        <ModalPreciosManager
          modalPrecios={modalPrecios}
          setModalPrecios={setModalPrecios}
          prendas={prendas}
          handleSavePrecioPrenda={handleSavePrecioPrenda}
          handleDeletePrecioPrenda={handleDeletePrecioPrenda}
        />
      )}

      {/* MODAL CATEGORIA */}
          <ModalCategoria modalCategoria={modalCategoria} setModalCategoria={setModalCategoria} handleSaveCategoria={handleSaveCategoria} />

      {/* NUEVO MODAL: USUARIO */}
          <ModalUsuario modalUsuario={modalUsuario} setModalUsuario={setModalUsuario} handleSaveUsuario={handleSaveUsuario} sedes={sedes} />
    </div>
  );
};

export default Config;