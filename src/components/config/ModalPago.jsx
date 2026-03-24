import React from 'react';
import { ModalContainer } from './Shared';

export const ModalPago = ({ modalPago, setModalPago, handleSavePago }) => {
    if (!modalPago.open) return null;

    return (
        <ModalContainer title="Método de Pago" onClose={() => setModalPago({ open: false, data: null })}>
          <form onSubmit={handleSavePago} className="space-y-4">
            <div className="form-group">
              <label className="label">Tipo</label>
              <select name="codigo_metodo" defaultValue={modalPago.data?.codigo_metodo || 'YAPE'} className="input">
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Nombre a Mostrar</label><input name="nombre_mostrar" defaultValue={modalPago.data?.nombre_mostrar} className="input" required /></div>
            <div className="form-group"><label className="label">N° Cuenta / Celular</label><input name="numero_cuenta" defaultValue={modalPago.data?.numero_cuenta} className="input" /></div>
            <div className="form-group">
              <label className="label">Imagen QR</label>
              <input type="file" name="imagen_qr" accept="image/*" className="input text-sm pt-2" />
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
              <input type="checkbox" name="activo" defaultChecked={modalPago.data?.activo !== false} className="w-5 h-5 text-blue-600 rounded" />
              <span className="text-sm font-medium">Método Activo</span>
            </label>
            <button className="btn-primary w-full">Guardar Método</button>
          </form>
        </ModalContainer>
    );
};