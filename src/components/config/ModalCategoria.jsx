import React from 'react';
import { ModalContainer } from './Shared';

export const ModalCategoria = ({ modalCategoria, setModalCategoria, handleSaveCategoria }) => {
    if (!modalCategoria.open) return null;

    return (
        <ModalContainer title={modalCategoria.data ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModalCategoria({ open: false, data: null })}>
          <form onSubmit={handleSaveCategoria} className="space-y-4">
            <div className="form-group"><label className="label">Nombre</label><input name="nombre" defaultValue={modalCategoria.data?.nombre} className="input" required /></div>
            <div className="form-group"><label className="label">Descripción</label><textarea name="descripcion" defaultValue={modalCategoria.data?.descripcion} className="input min-h-[80px]" rows="3" /></div>
            <div className="form-group"><label className="label">Orden</label><input type="number" name="orden" defaultValue={modalCategoria.data?.orden || 0} className="input" /></div>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
    );
};