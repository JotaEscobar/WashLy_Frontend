import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

export const TabServicios = ({ servicios, categorias, setModalServicio, setModalCategoria, setModalPrecios }) => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <div className="lg:col-span-1 h-full">
      <div className="card h-full p-4">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Categorías</h4>
          <button onClick={() => setModalCategoria({ open: true, data: null })} className="btn-icon bg-blue-50 text-blue-600">
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {categorias.map(c => (
            <div key={c.id} className="group flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 transition-all cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{c.nombre}</span>
              <button onClick={() => setModalCategoria({ open: true, data: c })} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          {categorias.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Sin categorías registradas</p>}
        </div>
      </div>
    </div>

    <div className="lg:col-span-3">
      <div className="card">
        <SectionHeader
          title="Catálogo de Servicios"
          icon={TagIcon}
          actionButton={
            <button onClick={() => setModalServicio({ open: true, data: null })} className="btn-primary">
              <PlusIcon className="h-5 w-5" /> Nuevo Servicio
            </button>
          }
        />

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Servicio</th>
                <th className="th">Tipo</th>
                <th className="th text-right">Precio Base</th>
                <th className="th text-center">Estado</th>
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="td">
                    <div className="font-bold text-gray-900 dark:text-white">{s.nombre}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{s.codigo}</div>
                  </td>
                  <td className="td">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${s.tipo_cobro === 'POR_KILO' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      s.tipo_cobro === 'POR_PRENDA' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {s.tipo_cobro === 'POR_KILO' ? 'Por Kilo' : s.tipo_cobro === 'POR_PRENDA' ? 'Por Prenda' : 'Fijo'}
                    </span>
                  </td>
                  <td className="td text-right font-mono font-bold text-gray-900 dark:text-white">
                    S/ {parseFloat(s.precio_base).toFixed(2)}
                  </td>
                  <td className="td text-center">
                    {s.disponible ? <CheckIcon className="w-5 h-5 text-green-500 mx-auto" /> : <XMarkIcon className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalServicio({ open: true, data: s })} className="btn-icon">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {s.tipo_cobro === 'POR_PRENDA' && (
                        <button onClick={() => setModalPrecios({ open: true, data: s })} className="btn-icon text-purple-600 bg-purple-50 hover:bg-purple-100" title="Configurar Precios por Prenda">
                          <CurrencyDollarIcon className="h-4 w-4" />
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
