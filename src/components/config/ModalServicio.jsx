import React from 'react';
import { ModalContainer } from './Shared';

export const ModalServicio = ({ modalServicio, setModalServicio, handleSaveServicio, categorias }) => {
    if (!modalServicio.open) return null;

    return (
        <ModalContainer title={modalServicio.data ? 'Editar Servicio' : 'Nuevo Servicio'} onClose={() => setModalServicio({ open: false, data: null })}>
          <form onSubmit={handleSaveServicio} className="space-y-4">
            <div className="form-group"><label className="label">Nombre</label><input name="nombre" defaultValue={modalServicio.data?.nombre} className="input" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group"><label className="label">Código</label><input name="codigo" defaultValue={modalServicio.data?.codigo} className="input" required /></div>
              <div className="form-group"><label className="label">Precio Base</label><input type="number" step="0.1" name="precio_base" defaultValue={modalServicio.data?.precio_base} className="input" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Categoría</label>
                <select name="categoria" defaultValue={modalServicio.data?.categoria} className="input">
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Cobro por</label>
                <select name="tipo_cobro" defaultValue={modalServicio.data?.tipo_cobro || 'POR_KILO'} className="input">
                  <option value="POR_UNIDAD">Unidad</option>
                  <option value="POR_KILO">Kilo</option>
                  <option value="POR_PRENDA">Prenda</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
              <input type="checkbox" name="disponible" defaultChecked={modalServicio.data?.disponible !== false} className="w-5 h-5 text-blue-600 rounded" />
              <span className="text-sm font-medium">Disponible en POS</span>
            </label>
            <button className="btn-primary w-full">Guardar Servicio</button>
          </form>
        </ModalContainer>
    );
};