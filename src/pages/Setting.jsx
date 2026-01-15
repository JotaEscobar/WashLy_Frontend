import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { 
  BuildingStorefrontIcon, 
  CreditCardIcon, 
  UsersIcon, 
  TicketIcon, 
  BellIcon, 
  CubeIcon,
  TagIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast'; // Opcional: para notificaciones bonitas

const Settings = () => {
  const [activeTab, setActiveTab] = useState('negocio');
  
  // Estados de datos
  const [empresa, setEmpresa] = useState({
    nombre: '', ruc: '', direccion_fiscal: '', 
    telefono_contacto: '', email_contacto: '', moneda: 'PEN', logo: null
  });
  const [sedes, setSedes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [currentSede, setCurrentSede] = useState(null); // Para editar

  // Cargar datos al inicio
  useEffect(() => {
    fetchEmpresa();
    fetchSedes();
    fetchMetodosPago();
  }, []);

  // --- API CALLS ---
  const fetchEmpresa = async () => {
    try {
      const res = await axios.get('/core/empresa/');
      if (res.data.results && res.data.results.length > 0) {
        setEmpresa(res.data.results[0]);
      }
    } catch (error) {
      console.error("Error cargando empresa", error);
    }
  };

  const fetchSedes = async () => {
    try {
      const res = await axios.get('/core/sedes/');
      setSedes(res.data.results || []);
    } catch (error) {
      console.error("Error cargando sedes", error);
    }
  };

  const fetchMetodosPago = async () => {
    try {
      const res = await axios.get('/pagos/config/');
      setMetodosPago(res.data.results || []);
    } catch (error) {
      console.error("Error cargando pagos", error);
    }
  };

  const handleGuardarEmpresa = async () => {
    setLoading(true);
    try {
      // Usamos FormData si hay imagen, o JSON si no (aquí simplificado a JSON por ahora)
      // Nota: Para subir logo se requiere FormData, aquí solo texto para simplificar el ejemplo
      await axios.patch(`/core/empresa/${empresa.id}/`, empresa);
      toast.success ? toast.success("Datos actualizados") : alert("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error guardando", error);
      alert("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (currentSede) {
        await axios.patch(`/core/sedes/${currentSede.id}/`, data);
      } else {
        await axios.post('/core/sedes/', data);
      }
      setIsSedeModalOpen(false);
      setCurrentSede(null);
      fetchSedes();
    } catch (error) {
      console.error("Error guardando sede", error);
      alert("Error al guardar la sede");
    }
  };

  const handleDeleteSede = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta sede?")) return;
    try {
      await axios.delete(`/core/sedes/${id}/`);
      fetchSedes();
    } catch (error) {
      alert("No se puede eliminar la sede (puede tener tickets asociados)");
    }
  };

  // --- COMPONENTES INTERNOS ---

  const SedeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{currentSede ? 'Editar Sede' : 'Nueva Sede'}</h3>
        <form onSubmit={handleSaveSede} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre de la Sede</label>
            <input name="nombre" required defaultValue={currentSede?.nombre} className="w-full border p-2 rounded" placeholder="Ej: Sede Norte" />
          </div>
          <div>
            <label className="block text-sm font-medium">Código Interno</label>
            <input name="codigo" required defaultValue={currentSede?.codigo} className="w-full border p-2 rounded" placeholder="Ej: SEDE-02" />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input name="direccion" required defaultValue={currentSede?.direccion} className="w-full border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Teléfono</label>
              <input name="telefono" defaultValue={currentSede?.telefono} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input name="email" type="email" defaultValue={currentSede?.email} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Apertura</label>
              <input name="horario_apertura" type="time" defaultValue={currentSede?.horario_apertura || "08:00"} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Cierre</label>
              <input name="horario_cierre" type="time" defaultValue={currentSede?.horario_cierre || "20:00"} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setIsSedeModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );

  const TabNegocio = () => (
    <div className="space-y-6">
      {/* SECCIÓN 1: DATOS GENERALES */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
          Información General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
            <input 
              value={empresa.nombre || ''} 
              onChange={e => setEmpresa({...empresa, nombre: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RUC / ID Fiscal</label>
            <input 
              value={empresa.ruc || ''} 
              onChange={e => setEmpresa({...empresa, ruc: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Dirección Fiscal</label>
            <textarea 
              value={empresa.direccion_fiscal || ''} 
              onChange={e => setEmpresa({...empresa, direccion_fiscal: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono Contacto</label>
            <input 
              value={empresa.telefono_contacto || ''} 
              onChange={e => setEmpresa({...empresa, telefono_contacto: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
            <input 
              type="email"
              value={empresa.email_contacto || ''} 
              onChange={e => setEmpresa({...empresa, email_contacto: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Moneda</label>
            <select 
              value={empresa.moneda || 'PEN'} 
              onChange={e => setEmpresa({...empresa, moneda: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="PEN">Soles (S/)</option>
              <option value="USD">Dólares ($)</option>
              <option value="EUR">Euros (€)</option>
              <option value="MXN">Pesos (MXN)</option>
            </select>
          </div>
        </div>
        
        {/* LOGO UPLOAD (Placeholder) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo del Negocio</label>
          <div className="flex items-center gap-4">
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" className="h-16 w-16 object-contain border rounded" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                Logo
              </div>
            )}
            <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleGuardarEmpresa}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: GESTIÓN DE SEDES */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            Sedes y Sucursales
          </h3>
          <button 
            onClick={() => { setCurrentSede(null); setIsSedeModalOpen(true); }}
            className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 font-medium"
          >
            <PlusIcon className="h-4 w-4" /> Nueva Sede
          </button>
        </div>

        {sedes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
            <p>No tienes sedes registradas. Crea la primera para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sede.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sede.codigo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{sede.direccion}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium flex justify-end gap-2">
                      <button onClick={() => { setCurrentSede(sede); setIsSedeModalOpen(true); }} className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteSede(sede.id)} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isSedeModalOpen && <SedeModal />}
    </div>
  );

  // ... (TabPagos y TabServicios se mantienen igual o se pueden simplificar)
  // ... Para brevedad, aquí solo incluyo la lógica de renderizado principal actualizada

  const tabs = [
    { id: 'negocio', label: 'Negocio', icon: BuildingStorefrontIcon },
    { id: 'pagos', label: 'Pagos', icon: CreditCardIcon },
    { id: 'servicios', label: 'Servicios', icon: TagIcon },
    { id: 'suscripcion', label: 'Suscripción', icon: CreditCardIcon },
    // ... otros tabs
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'negocio' && <TabNegocio />}
          {/* Aquí irían los otros componentes TabPagos, etc. Si ya los tenías, mantenlos. */}
          {activeTab !== 'negocio' && (
            <div className="bg-white p-10 rounded-lg text-center text-gray-500">
              <p>El módulo {activeTab} se carga aquí (Implementado en pasos anteriores).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;