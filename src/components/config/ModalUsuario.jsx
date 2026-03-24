import React from 'react';
import { ModalContainer } from './Shared';
import { UserIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

export const ModalUsuario = ({ modalUsuario, setModalUsuario, handleSaveUsuario, sedes }) => {
    if (!modalUsuario.open) return null;

    return (
        <ModalContainer title={modalUsuario.data ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModalUsuario({ open: false, data: null })}>
          <form onSubmit={handleSaveUsuario} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label flex items-center gap-1"><UserIcon className="w-4 h-4" /> Nombres</label>
                <input name="first_name" defaultValue={modalUsuario.data?.first_name} className="input" required placeholder="Ej: Juan" />
              </div>
              <div className="form-group">
                <label className="label flex items-center gap-1"><UserIcon className="w-4 h-4" /> Apellidos</label>
                <input name="last_name" defaultValue={modalUsuario.data?.last_name} className="input" required placeholder="Ej: Perez" />
              </div>
            </div>

            <div className="form-group">
              <label className="label flex items-center gap-1"><EnvelopeIcon className="w-4 h-4" /> Correo Electrónico</label>
              <input type="email" name="email" defaultValue={modalUsuario.data?.email} className="input" required placeholder="usuario@empresa.com" />
            </div>

            <div className="form-group">
              <label className="label flex items-center gap-1">
                <KeyIcon className="w-4 h-4" /> Contraseña
                {modalUsuario.data && <span className="text-xs font-normal text-gray-400 ml-2">(Dejar vacía para mantener)</span>}
              </label>
              <input
                type="password"
                name="password"
                className="input"
                required={!modalUsuario.data} // Solo obligatoria al crear
                placeholder={modalUsuario.data ? "••••••••" : "Crear contraseña"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Rol en el Negocio</label>
                <select name="rol" defaultValue={modalUsuario.data?.rol || 'OPERARIO'} className="input">
                  <option value="ADMIN">Administrador</option>
                  <option value="CAJERO">Cajero</option>
                  <option value="OPERARIO">Operario</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Sede Asignada</label>
                <select name="sede" defaultValue={modalUsuario.data?.sede_id || ""} className="input">
                  <option value="">-- Acceso Global --</option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Si está vacío, puede acceder a todas.</p>
              </div>
            </div>

            {!modalUsuario.data && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                El <strong>Usuario</strong> se generará automáticamente (Ej: jperez).
              </div>
            )}

            <button className="btn-primary w-full mt-2">
              {modalUsuario.data ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </form>
        </ModalContainer>
    );
};