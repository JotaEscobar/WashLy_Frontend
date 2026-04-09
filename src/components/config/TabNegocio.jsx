import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';
export const TabNegocio = ({
  empresa,
  setEmpresa,
  editMode,
  setEditMode,
  loading,
  handleGuardar,
  sedes,
  setModalSede,
  handleDeleteSede
}) => {
  const fileInputRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  // Funciones auxiliares antes del early return para usarlas en hooks si es necesario
  const getLogoUrl = () => {
    if (!empresa?.logo) return null;

    // 1. Si es un archivo local (previsualización de subida)
    if (empresa.logo instanceof File) {
      try {
        return URL.createObjectURL(empresa.logo);
      } catch (e) {
        return null;
      }
    }

    // 2. Si es una cadena (URL del servidor)
    if (typeof empresa.logo === 'string') {
      if (empresa.logo.startsWith('http')) return empresa.logo;
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const path = empresa.logo.startsWith('/') ? empresa.logo : `/${empresa.logo}`;
      return `${baseUrl}${path}`;
    }
    return null;
  };

  const logoUrl = getLogoUrl();

  // Resetear error si cambia la URL (Hook incondicional en el top)
  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  if (!empresa) return <div className="p-12 text-center text-gray-400"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto" /> Cargando...</div>;

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmpresa({ ...empresa, logo: file });
    }
  };

  const removeLogo = () => {
    setEmpresa({ ...empresa, logo: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* INFO EMPRESA */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
          {/* LOGO CIRCULAR CRUD - ESTILO SOBRIO */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 transition-all shadow-sm
              ${editMode ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''}`}
              onClick={() => editMode && fileInputRef.current.click()}
            >
              {(logoUrl && !imageError) ? (
                <img
                  src={logoUrl}
                  alt="Logo Negocio"
                  className="w-full h-full object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <PhotoIcon className="h-8 w-8 text-gray-200 dark:text-gray-700" />
              )}

              {editMode && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PencilIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>

            {editMode && (
              <div className="absolute -top-1 -right-1 flex flex-col gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-all"
                  title="Cambiar Logo"
                >
                  <PhotoIcon className="h-3.5 w-3.5" />
                </button>
                {empresa.logo && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                    className="p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-all"
                    title="Eliminar Logo"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <SectionHeader
              title="Información del Negocio"
              actionButton={
                !editMode ? (
                  <button onClick={() => setEditMode(true)} className="btn-secondary">
                    <PencilIcon className="h-4 w-4" /> Editar Datos
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="btn-danger">Cancelar</button>
                    <button onClick={() => { handleGuardar(); setEditMode(false); }} disabled={loading} className="btn-primary">
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )
              }
            />
            <p className="text-sm text-gray-500 -mt-4 mb-4">Configura los datos principales de tu empresa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="form-group">
            <label className="label">Nombre Comercial</label>
            <input
              disabled={!editMode}
              value={empresa.nombre || ''}
              onChange={e => setEmpresa({ ...empresa, nombre: e.target.value })}
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="Ej: Mi Lavandería"
            />
          </div>
          <div className="form-group">
            <label className="label">RUC / Identificación</label>
            <input
              disabled={!editMode}
              value={empresa.ruc || ''}
              onChange={e => setEmpresa({ ...empresa, ruc: e.target.value })}
              className={!editMode ? 'input-readonly font-mono text-sm' : 'input'}
            />
          </div>
          <div className="form-group">
            <label className="label">Moneda</label>
            <select
              disabled={!editMode}
              value={empresa.moneda || 'PEN'}
              onChange={e => setEmpresa({ ...empresa, moneda: e.target.value })}
              className={!editMode ? 'input-readonly bg-transparent appearance-none text-sm' : 'input'}
            >
              <option value="PEN">Soles (S/)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>
          <div className="form-group lg:col-span-2">
            <label className="label">Dirección Fiscal</label>
            <input
              disabled={!editMode}
              value={empresa.direccion_fiscal || ''}
              onChange={e => setEmpresa({ ...empresa, direccion_fiscal: e.target.value })}
              className={!editMode ? 'input-readonly text-sm' : 'input'}
            />
          </div>
          <div className="form-group">
            <label className="label">Teléfono</label>
            <input
              disabled={!editMode}
              value={empresa.telefono_contacto || ''}
              onChange={e => setEmpresa({ ...empresa, telefono_contacto: e.target.value })}
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="+51..."
            />
          </div>
          <div className="form-group">
            <label className="label">Email de Contacto</label>
            <input
              type="email"
              disabled={!editMode}
              value={empresa.email_contacto || ''}
              onChange={e => setEmpresa({ ...empresa, email_contacto: e.target.value })}
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>
      </div>

      {/* SEDES */}
      <div className="card">
        <SectionHeader
          title="Sedes y Sucursales"
          icon={MapPinIcon}
          actionButton={
            <button onClick={() => setModalSede({ open: true, data: null })} className="btn-primary">
              <PlusIcon className="h-5 w-5" /> Nueva Sede
            </button>
          }
        />

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Nombre</th>
                <th className="th">Código</th>
                <th className="th hidden md:table-cell">Dirección</th>
                <th className="th">Horario</th>
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedes.length === 0 && (
                <tr><td colSpan="5" className="td text-center text-gray-500 py-8">No hay sedes registradas</td></tr>
              )}
              {sedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="td font-semibold">{sede.nombre}</td>
                  <td className="td"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono font-bold">{sede.codigo}</span></td>
                  <td className="td hidden md:table-cell text-gray-500">{sede.direccion}</td>
                  <td className="td text-sm text-gray-500">{sede.horario_apertura} - {sede.horario_cierre}</td>
                  <td className="td text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalSede({ open: true, data: sede })} className="btn-icon">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteSede(sede.id)} className="btn-icon text-red-500 hover:bg-red-50">
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
  );
};
