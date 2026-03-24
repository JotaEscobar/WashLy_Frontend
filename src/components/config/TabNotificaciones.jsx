import React, { useState } from 'react';
import {
  BellIcon, EnvelopeIcon, KeyIcon, InboxIcon, 
  ShieldCheckIcon, ServerIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { SectionHeader } from './Shared';

export const TabNotificaciones = ({ empresa, setEmpresa, handleGuardar }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setEmpresa({ ...empresa, [field]: value });
  };

  return (
    <div className="card max-w-4xl mx-auto overflow-hidden">
      <SectionHeader title="Centro de Notificaciones" icon={BellIcon} />
      
      <div className="p-6 space-y-8">
        {/* Interruptor Maestro */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <EnvelopeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">Notificaciones por Email</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Habilita el envío automático de correos a clientes</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={empresa?.notif_email_activas || false}
              onChange={e => handleChange('notif_email_activas', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {empresa?.notif_email_activas && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Configuración SMTP */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">
                <ServerIcon className="w-4 h-4" />
                Configuración del Servidor (SMTP)
              </div>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Servidor SMTP</label>
                  <input
                    type="text"
                    placeholder="ej. smtp.gmail.com"
                    value={empresa?.email_host || ''}
                    onChange={e => handleChange('email_host', e.target.value)}
                    className="input-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Puerto</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={empresa?.email_port || ''}
                      onChange={e => {
                        const val = e.target.value;
                        handleChange('email_port', val === '' ? null : parseInt(val));
                      }}
                      className="input-base"
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={empresa?.email_use_tls || false}
                        onChange={e => handleChange('email_use_tls', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs font-semibold">Usar TLS</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Usuario / Email</label>
                  <input
                    type="email"
                    placeholder="tu-correo@gmail.com"
                    value={empresa?.email_host_user || ''}
                    onChange={e => handleChange('email_host_user', e.target.value)}
                    className="input-base"
                  />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Contraseña de Aplicación</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={empresa?.email_host_password || ''}
                      onChange={e => handleChange('email_host_password', e.target.value)}
                      className="input-base pr-10"
                      placeholder="••••••••••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    >
                      <KeyIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  * Si usas Gmail, recuerda generar una "Contraseña de Aplicación" en tu cuenta de Google.
                </p>
              </div>
            </div>

            {/* Eventos a Notificar */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">
                <CheckCircleIcon className="w-4 h-4" />
                Eventos a Notificar
              </div>
              <div className="space-y-3">
                {[
                  { id: 'notif_event_creacion', label: 'Creación de Ticket', desc: 'Enviar comprobante al recibir prenda' },
                  { id: 'notif_event_listo', label: 'Pedido Listo', desc: 'Avisar cuando las prendas están limpias' },
                  { id: 'notif_event_entregado', label: 'Pedido Entregado', desc: 'Enviar confirmación de entrega' },
                ].map(event => (
                  <label key={event.id} className="group flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${empresa?.[event.id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <InboxIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{event.label}</div>
                        <div className="text-[11px] text-gray-500">{event.desc}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={empresa?.[event.id] || false}
                      onChange={e => handleChange(event.id, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
                  Las notificaciones solo se enviarán si el cliente tiene un correo electrónico válido registrado. 
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
           <button 
            onClick={handleGuardar} 
            className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none translate-y-0 active:translate-y-1 transition-all"
           >
             Guardar Configuración
           </button>
        </div>
      </div>
    </div>
  );
};
