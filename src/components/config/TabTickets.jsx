import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

export const TabTickets = ({ empresa, setEmpresa, editMode, setEditMode, handleGuardar }) => (
  <div className="max-w-3xl mx-auto">
    <div className="card p-8">
      <SectionHeader
        title="Configuración de Tickets"
        icon={TicketIcon}
        actionButton={
          !editMode ? (
            <button onClick={() => setEditMode(true)} className="btn-secondary">
              <PencilIcon className="h-4 w-4" /> Editar Configuración
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="btn-danger">Cancelar</button>
              <button onClick={() => { handleGuardar(); setEditMode(false); }} className="btn-primary">
                Guardar Cambios
              </button>
            </div>
          )
        }
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="form-group col-span-2">
            <label className="label">Prefijo Ticket</label>
            <input
              type="text"
              disabled={!editMode}
              value={empresa?.ticket_prefijo || ''}
              onChange={e => setEmpresa({ ...empresa, ticket_prefijo: e.target.value.toUpperCase() })}
              className={!editMode ? 'input-readonly text-sm' : 'input text-sm'}
              placeholder="TK-"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Mensaje al Pie Principal</label>
          <textarea
            disabled={!editMode}
            value={empresa?.ticket_mensaje_pie || ''}
            onChange={e => setEmpresa({ ...empresa, ticket_mensaje_pie: e.target.value })}
            className={!editMode ? 'input-readonly min-h-[80px] py-3 text-sm' : 'input min-h-[80px] py-3 text-sm'}
            rows="3"
            placeholder="Ej: Gracias por su preferencia..."
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Descripción de Servicios (Inline)</label>
            <input
              type="text"
              disabled={!editMode}
              value={empresa?.ticket_servicios_descripcion || ''}
              onChange={e => setEmpresa({ ...empresa, ticket_servicios_descripcion: e.target.value })}
              className={!editMode ? 'input-readonly text-sm' : 'input text-sm'}
              placeholder="Ej: Lavado, tintorería, planchado..."
            />
          </div>
          <div className="form-group">
            <label className="label">Logo del Ticket</label>
            {editMode ? (
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setEmpresa({ ...empresa, ticket_logo: e.target.files[0] });
                  }
                }}
                className="input text-sm pt-2"
              />
            ) : (
              <div className="mt-2 text-sm text-gray-500 font-medium">
                {empresa?.ticket_logo ? "✓ Logo configurado para impresión" : "— Sin logo"}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Disclaimer / Condiciones de Servicio</label>
          <textarea
            disabled={!editMode}
            value={empresa?.ticket_disclaimer || ''}
            onChange={e => setEmpresa({ ...empresa, ticket_disclaimer: e.target.value })}
            className={!editMode ? 'input-readonly min-h-[100px] py-3 text-sm' : 'input min-h-[100px] py-3 text-sm'}
            rows="4"
            placeholder="Ej: No nos responsabilizamos por prendas extraviadas pasados los 30 días..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
);
