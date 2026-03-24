import React from 'react';
import { ModalContainer } from './Shared';

export const ModalSede = ({ modalSede, setModalSede, handleSaveSede }) => {
    if (!modalSede.open) return null;

    return (
        <ModalContainer title={modalSede.data ? 'Editar Sede' : 'Registrar Nueva Sede'} onClose={() => setModalSede({ open: false, data: null })}>
          <form onSubmit={handleSaveSede} className="space-y-4">
            <div className="form-group"><label className="label">Nombre</label><input name="nombre" defaultValue={modalSede.data?.nombre} className="input" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group"><label className="label">Código</label><input name="codigo" defaultValue={modalSede.data?.codigo} className="input" required /></div>
              <div className="form-group"><label className="label">Teléfono</label><input name="telefono" defaultValue={modalSede.data?.telefono} className="input" /></div>
            </div>
            <div className="form-group"><label className="label">Dirección</label><input name="direccion" defaultValue={modalSede.data?.direccion} className="input" required /></div>
            <div className="form-group"><label className="label">Email</label><input type="email" name="email" defaultValue={modalSede.data?.email} className="input" /></div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="form-group mb-0"><label className="label text-xs">Apertura</label><input type="time" name="horario_apertura" defaultValue={modalSede.data?.horario_apertura || "08:00"} className="input text-sm" /></div>
              <div className="form-group mb-0"><label className="label text-xs">Cierre</label><input type="time" name="horario_cierre" defaultValue={modalSede.data?.horario_cierre || "20:00"} className="input text-sm" /></div>
            </div>
            <button className="btn-primary w-full mt-2">Guardar Sede</button>
          </form>
        </ModalContainer>
    );
};