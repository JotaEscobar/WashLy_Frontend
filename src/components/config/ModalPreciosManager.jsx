import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

export const ModalPreciosManager = ({ modalPrecios, setModalPrecios, prendas, handleSavePrecioPrenda, handleDeletePrecioPrenda }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrenda, setSelectedPrenda] = useState(null);
  const [price, setPrice] = useState('');

  const availablePrendas = useMemo(() => {
    const configuredIds = modalPrecios.data?.precios_prendas?.map(p => p.prenda) || [];
    return prendas.filter(p => !configuredIds.includes(p.id));
  }, [prendas, modalPrecios.data]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return availablePrendas.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, availablePrendas]);

  const exactMatch = availablePrendas.find(p => p.nombre.toLowerCase() === searchTerm.toLowerCase().trim());

  const handleSelectPrenda = (prenda) => {
    setSelectedPrenda(prenda);
    setSearchTerm(prenda.nombre);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      precio: price,
      prenda_id: selectedPrenda?.id || (exactMatch?.id) || null,
      nombre_prenda: (!selectedPrenda && !exactMatch) ? searchTerm : null
    };
    handleSavePrecioPrenda(payload);
    setSearchTerm('');
    setSelectedPrenda(null);
    setPrice('');
  };

  return (
    <ModalContainer title={`Catálogo: ${modalPrecios.data?.nombre}`} onClose={() => setModalPrecios({ open: false, data: null })}>
      <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg flex gap-3 border border-purple-100 dark:border-purple-800">
        <CurrencyDollarIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
        <div className="text-sm text-purple-800 dark:text-purple-300">
          Gestiona qué prendas acepta este servicio y su precio específico.
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 mb-6 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        {modalPrecios.data?.precios_prendas?.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No hay prendas configuradas</p>}
        {modalPrecios.data?.precios_prendas?.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 px-3 rounded shadow-sm border border-gray-100 dark:border-gray-700 group">
            <span className="font-medium text-sm">{p.prenda_nombre}</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">S/ {p.precio}</span>
              <button
                onClick={() => handleDeletePrecioPrenda(p.prenda)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar del catálogo"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <label className="label text-xs mb-1">Buscar o Crear Prenda</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedPrenda(null); }}
                  placeholder="Ej: Camisa, Terno, Vestido..."
                  className="input pl-9 text-sm w-full"
                  required
                  autoComplete="off"
                />
                {searchTerm && !selectedPrenda && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPrenda(p)}
                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-sm flex justify-between"
                      >
                        <span>{p.nombre}</span>
                        <span className="text-gray-400 text-xs italic">Existente</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.10"
                placeholder="0.00"
                className="w-24 input text-sm text-right font-bold"
                required
              />
            </div>
            {searchTerm && !selectedPrenda && !exactMatch && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <PlusIcon className="h-3 w-3" /> Se creará una nueva prenda: <strong>"{searchTerm}"</strong>
              </p>
            )}
            {(selectedPrenda || exactMatch) && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckIcon className="h-3 w-3" /> Seleccionado: <strong>{selectedPrenda?.nombre || exactMatch?.nombre}</strong>
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full shadow-sm py-2">
            {selectedPrenda || exactMatch ? 'Vincular Prenda' : 'Crear y Vincular'}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};
