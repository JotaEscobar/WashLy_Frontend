import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

export const TabUsuarios = ({ usuarios, sedes, setModalUsuario, handleDeleteUsuario }) => {

  // Función auxiliar para color del rol
  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'CAJERO': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (rol) => {
    switch (rol) {
      case 'ADMIN': return 'Administrador';
      case 'CAJERO': return 'Cajero';
      default: return 'Operario';
    }
  };

  return (
    <div className="card">
      <SectionHeader
        title="Equipo de Trabajo"
        icon={UserGroupIcon}
        actionButton={
          <button onClick={() => setModalUsuario({ open: true, data: null })} className="btn-primary">
            <PlusIcon className="h-5 w-5" /> Nuevo Usuario
          </button>
        }
      />

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Usuario / Email</th>
              <th className="th">Rol</th>
              <th className="th">Sede Asignada</th>
              <th className="th text-center">Estado</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr><td colSpan="5" className="td text-center text-gray-500 py-8">No hay usuarios registrados</td></tr>
            )}
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</div>
                      <div className="text-xs text-gray-500 font-mono">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td className="td">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRoleBadge(u.rol)}`}>
                    {getRoleLabel(u.rol)}
                  </span>
                </td>
                <td className="td">
                  {u.nombre_sede ? (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{u.nombre_sede}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Acceso Global</span>
                  )}
                </td>
                <td className="td text-center">
                  {u.is_active ? (
                    <span className="inline-flex w-2 h-2 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="inline-flex w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                </td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalUsuario({ open: true, data: u })} className="btn-icon">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteUsuario(u.id)} className="btn-icon text-red-500 hover:bg-red-50">
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
  );
};
