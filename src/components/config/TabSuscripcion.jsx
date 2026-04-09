import React, { useState, useMemo } from 'react';
import {
  BuildingStorefrontIcon, CreditCardIcon, TagIcon, TicketIcon,
  UserGroupIcon, BellIcon, MapPinIcon, PencilIcon, TrashIcon,
  PlusIcon, QrCodeIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon,
  ArrowPathIcon, SparklesIcon, EnvelopeIcon, UserIcon, KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SectionHeader, ModalContainer } from './Shared';

const METODO_BADGES = {
  YAPE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  PLIN: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  TRANSFERENCIA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  EFECTIVO: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export const TabSuscripcion = ({ empresa, historial = [] }) => {
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  if (!empresa) return null;

  const diasRestantes = empresa.fecha_vencimiento
    ? Math.ceil((new Date(empresa.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  const estaVencida = diasRestantes <= 0;
  const porVencer = diasRestantes > 0 && diasRestantes <= 15;
  const urgente = diasRestantes <= 3;

  const planLabels = { DEMO: 'Demo (7 días)', MENSUAL: 'Mensual' };
  const planNombre = planLabels[empresa.plan] || empresa.plan || '—';

  const statusDot = estaVencida ? 'bg-red-500' : porVencer ? 'bg-amber-500' : 'bg-emerald-500';
  const statusText = estaVencida ? 'Vencida' : porVencer ? 'Por vencer' : 'Activa';
  const statusBg = estaVencida
    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
    : porVencer
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';

  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* --- SECCIÓN 1: ESTADO --- */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Días restantes */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vigencia</div>
              <div className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                {estaVencida ? 0 : diasRestantes}
              </div>
              <div className="text-xs font-medium text-gray-400 mt-1">días restantes</div>
            </div>
            <div className="h-14 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                  {statusText}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {estaVencida ? 'Tu acceso está limitado. Renueva para seguir operando.' : porVencer ? 'Renueva pronto para evitar interrupciones en tu servicio.' : 'Suscripción vigente. Todas las funciones habilitadas.'}
              </p>
            </div>
          </div>

          {/* Datos clave + Botón renovar */}
          <div className="flex flex-col gap-4 items-end">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan</div>
                <div className="font-semibold text-gray-900 dark:text-white">{planNombre}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Vence</div>
                <div className="font-semibold text-gray-900 dark:text-white">{formatFecha(empresa.fecha_vencimiento)}</div>
              </div>
            </div>
            <button
              onClick={() => setShowRenewalModal(true)}
              className={`relative px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 ${(urgente || estaVencida) ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {(urgente || estaVencida) && (
                <span className="absolute -inset-1 rounded-xl border-2 border-red-400 opacity-0" style={{ animation: 'ping-subtle 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              )}
              Renovar Suscripción
            </button>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: HISTORIAL --- */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historial de Renovaciones</h3>

        {historial.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-300 dark:text-gray-600 mb-2">
              <CreditCardIcon className="h-10 w-10 mx-auto" />
            </div>
            <p className="text-sm text-gray-400">Aún no hay renovaciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-right py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Método</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Periodo</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => (
                  <tr key={h.id || i} className="border-b border-gray-50 dark:border-gray-800 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 text-gray-700 dark:text-gray-300">{formatFecha(h.fecha_pago)}</td>
                    <td className="py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">S/ {parseFloat(h.monto).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${METODO_BADGES[h.metodo] || METODO_BADGES.EFECTIVO}`}>
                        {h.metodo}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {formatFecha(h.periodo_inicio)} — {formatFecha(h.periodo_fin)}
                    </td>
                    <td className="py-3 font-mono text-xs text-gray-400">{h.comprobante_codigo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE RENOVACIÓN --- */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowRenewalModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Renovar Suscripción</h3>
              <p className="text-sm text-gray-500 mt-1">Sigue estos pasos para renovar tu plan mensual</p>
            </div>
            <div className="px-6 pb-6 space-y-5">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Realiza el pago de <span className="text-blue-600">S/ 79.90</span></p>
                  <p className="text-xs text-gray-500 mt-1">Envía por <strong>Yape</strong> o <strong>Plin</strong> al número:</p>
                  <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">981 278 614</p>
                      <p className="text-xs text-gray-500">Jorge Escobar</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">YAPE</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">PLIN</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Envía el voucher por WhatsApp</p>
                  <p className="text-xs text-gray-500 mt-1">Envía una captura del comprobante al mismo número con un breve mensaje indicando el nombre de tu negocio.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Listo — tu plan se renueva</p>
                  <p className="text-xs text-gray-500 mt-1">Procesaremos tu renovación y se extenderán 30 días adicionales a tu suscripción.</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowRenewalModal(false)} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cerrar</button>
              <a href="https://wa.me/51981278614?text=Hola%2C%20acabo%20de%20realizar%20el%20pago%20de%20renovaci%C3%B3n%20de%20mi%20suscripci%C3%B3n%20Washly.%20Adjunto%20el%20voucher." target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl text-center transition-colors">Enviar por WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
