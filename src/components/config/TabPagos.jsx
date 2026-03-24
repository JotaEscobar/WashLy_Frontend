import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

export const TabPagos = ({ metodosPago, setModalPago, onDeleteMetodo }) => (
  <div className="card">
    <SectionHeader
      title="Métodos de Pago"
      icon={CreditCardIcon}
      actionButton={
        <button onClick={() => setModalPago({ open: true, data: null })} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Nuevo Método
        </button>
      }
    />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metodosPago.map(metodo => (
        <div key={metodo.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all relative group flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden">
              {metodo.imagen_qr ? (
                <img src={metodo.imagen_qr} alt="QR" className="w-full h-full object-cover" />
              ) : (
                <QrCodeIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex gap-1.5">
              <span className={`h-6 px-2 flex items-center rounded-full text-[10px] font-bold uppercase border ${metodo.activo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {metodo.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => setModalPago({ open: true, data: metodo })} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={() => onDeleteMetodo(metodo.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg">{metodo.nombre_mostrar}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">COD: {metodo.codigo_metodo}</p>
            {metodo.numero_cuenta && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Cuenta / Celular</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">{metodo.numero_cuenta}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
