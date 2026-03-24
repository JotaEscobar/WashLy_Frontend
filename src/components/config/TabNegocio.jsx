import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
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
  if (!empresa) return <div className="p-12 text-center text-gray-400"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto" /> Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* INFO EMPRESA */}
      <div className="card">
        <SectionHeader
          title="Información del Negocio"
          icon={BuildingStorefrontIcon}
          actionButton={
            !editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-secondary">
                <PencilIcon className="h-4 w-4" /> Editar Datos
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="btn-danger">Cancelar</button>
                {/* CORRECCIÓN: Ahora setEditMode(false) se ejecuta al guardar */}
                <button onClick={() => { handleGuardar(); setEditMode(false); }} disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )
          }
        />

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
