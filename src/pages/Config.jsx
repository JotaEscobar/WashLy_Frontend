import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axiosConfig';
import { 
  BuildingStorefrontIcon, 
  CreditCardIcon, 
  TagIcon, 
  TicketIcon,
  UserGroupIcon,
  CubeIcon,
  BellIcon,
  MapPinIcon,
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  QrCodeIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserIcon,
  KeyIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// --- SUB-COMPONENTES EXTRAÍDOS ---

const SectionHeader = ({ title, icon: Icon, actionButton }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {actionButton}
  </div>
);

const TabNegocio = ({ 
  empresa, 
  setEmpresa, 
  editMode, 
  setEditMode, 
  loading, 
  handleGuardar, 
  sedes, 
  setModalSede, 
  handleDeleteSede 
}) => {
  if (!empresa) return <div className="p-12 text-center text-gray-400"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto"/> Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* INFO EMPRESA */}
      <div className="card">
        <SectionHeader 
          title="Información del Negocio" 
          icon={BuildingStorefrontIcon}
          actionButton={
            !editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-secondary">
                <PencilIcon className="h-4 w-4" /> Editar Datos
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="btn-danger">Cancelar</button>
                {/* CORRECCIÓN: Ahora setEditMode(false) se ejecuta al guardar */}
                <button onClick={() => { handleGuardar(); setEditMode(false); }} disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="form-group">
            <label className="label">Nombre Comercial</label>
            <input 
              disabled={!editMode}
              value={empresa.nombre || ''} 
              onChange={e => setEmpresa({...empresa, nombre: e.target.value})} 
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="Ej: Mi Lavandería"
            />
          </div>
          <div className="form-group">
            <label className="label">RUC / Identificación</label>
            <input 
              disabled={!editMode}
              value={empresa.ruc || ''} 
              onChange={e => setEmpresa({...empresa, ruc: e.target.value})} 
              className={!editMode ? 'input-readonly font-mono text-sm' : 'input'}
            />
          </div>
          <div className="form-group">
            <label className="label">Moneda</label>
            <select 
              disabled={!editMode}
              value={empresa.moneda || 'PEN'} 
              onChange={e => setEmpresa({...empresa, moneda: e.target.value})} 
              className={!editMode ? 'input-readonly bg-transparent appearance-none text-sm' : 'input'}
            >
              <option value="PEN">Soles (S/)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>
          <div className="form-group lg:col-span-2">
            <label className="label">Dirección Fiscal</label>
            <input
              disabled={!editMode}
              value={empresa.direccion_fiscal || ''} 
              onChange={e => setEmpresa({...empresa, direccion_fiscal: e.target.value})} 
              className={!editMode ? 'input-readonly text-sm' : 'input'}
            />
          </div>
          <div className="form-group">
            <label className="label">Teléfono</label>
            <input 
              disabled={!editMode}
              value={empresa.telefono_contacto || ''} 
              onChange={e => setEmpresa({...empresa, telefono_contacto: e.target.value})} 
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="+51..."
            />
          </div>
          <div className="form-group">
            <label className="label">Email de Contacto</label>
            <input 
              type="email"
              disabled={!editMode}
              value={empresa.email_contacto || ''} 
              onChange={e => setEmpresa({...empresa, email_contacto: e.target.value})} 
              className={!editMode ? 'input-readonly text-sm' : 'input'}
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>
      </div>

      {/* SEDES */}
      <div className="card">
        <SectionHeader 
          title="Sedes y Sucursales" 
          icon={MapPinIcon}
          actionButton={
            <button onClick={() => setModalSede({ open: true, data: null })} className="btn-primary">
              <PlusIcon className="h-5 w-5" /> Nueva Sede
            </button>
          }
        />
        
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Nombre</th>
                <th className="th">Código</th>
                <th className="th hidden md:table-cell">Dirección</th>
                <th className="th">Horario</th>
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedes.length === 0 && (
                <tr><td colSpan="5" className="td text-center text-gray-500 py-8">No hay sedes registradas</td></tr>
              )}
              {sedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="td font-semibold">{sede.nombre}</td>
                  <td className="td"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono font-bold">{sede.codigo}</span></td>
                  <td className="td hidden md:table-cell text-gray-500">{sede.direccion}</td>
                  <td className="td text-sm text-gray-500">{sede.horario_apertura} - {sede.horario_cierre}</td>
                  <td className="td text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalSede({ open: true, data: sede })} className="btn-icon">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteSede(sede.id)} className="btn-icon text-red-500 hover:bg-red-50">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TabSuscripcion = ({ empresa }) => {
  if (!empresa) return null;
  const diasRestantes = empresa.fecha_vencimiento ? Math.ceil((new Date(empresa.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)) : 30;
  return (
    <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none max-w-4xl mx-auto">
      <div className="flex items-start gap-6">
        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
          <SparklesIcon className="h-12 w-12 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">Plan {empresa.plan || 'FREE'}</h2>
          <p className="text-blue-100 mb-6 text-lg">Tu suscripción se encuentra activa.</p>
          
          <div className="bg-white/10 rounded-xl p-6 mb-6 backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-100">Días restantes</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-xs font-bold border border-green-500/30">
                {empresa.estado || 'ACTIVO'}
              </span>
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="text-4xl font-bold">{diasRestantes > 0 ? diasRestantes : 0}</div>
                <button className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm">
                    Gestionar Plan
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabPagos = ({ metodosPago, setModalPago }) => (
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
            <div className="flex gap-2">
              <span className={`h-6 px-2 flex items-center rounded-full text-[10px] font-bold uppercase border ${metodo.activo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {metodo.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => setModalPago({ open: true, data: metodo })} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                <PencilIcon className="h-4 w-4" />
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

const TabServicios = ({ servicios, categorias, setModalServicio, setModalCategoria, setModalPrecios }) => (
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
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      s.tipo_cobro === 'POR_KILO' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
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
                    {s.disponible ? <CheckIcon className="w-5 h-5 text-green-500 mx-auto"/> : <XMarkIcon className="w-5 h-5 text-gray-300 mx-auto"/>}
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalServicio({ open: true, data: s })} className="btn-icon">
                        <PencilIcon className="h-4 w-4"/>
                      </button>
                      {s.tipo_cobro === 'POR_PRENDA' && (
                        <button onClick={() => setModalPrecios({ open: true, data: s })} className="btn-icon text-purple-600 bg-purple-50 hover:bg-purple-100" title="Configurar Precios por Prenda">
                          <CurrencyDollarIcon className="h-4 w-4"/>
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

const TabTickets = ({ empresa, setEmpresa, editMode, setEditMode, handleGuardar }) => (
  <div className="max-w-3xl mx-auto">
    <div className="card p-8">
      <SectionHeader 
        title="Configuración de Tickets" 
        icon={TicketIcon}
        actionButton={
            !editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-secondary">
                <PencilIcon className="h-4 w-4" /> Editar Configuración
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="btn-danger">Cancelar</button>
                <button onClick={() => { handleGuardar(); setEditMode(false); }} className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            )
        }
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Prefijo Ticket</label>
            <input 
                disabled={!editMode}
                value={empresa?.ticket_prefijo || 'TK-'} 
                onChange={e => setEmpresa({...empresa, ticket_prefijo: e.target.value})}
                className={!editMode ? 'input-readonly text-sm' : 'input text-sm'} 
            />
          </div>
          <div className="form-group">
            <label className="label">Días Entrega (Defecto)</label>
            <input 
                type="number" 
                disabled={!editMode}
                value={empresa?.ticket_dias_entrega || 2} 
                onChange={e => setEmpresa({...empresa, ticket_dias_entrega: e.target.value})}
                className={!editMode ? 'input-readonly text-sm' : 'input text-sm'} 
            />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Mensaje al Pie</label>
          <textarea 
            disabled={!editMode}
            value={empresa?.ticket_mensaje_pie || ''} 
            onChange={e => setEmpresa({...empresa, ticket_mensaje_pie: e.target.value})}
            className={!editMode ? 'input-readonly min-h-[100px] py-3 text-sm' : 'input min-h-[100px] py-3 text-sm'} 
            rows="3" 
            placeholder="Ej: Gracias por su preferencia..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
);

// --- NUEVO COMPONENTE: TAB USUARIOS ---
const TabUsuarios = ({ usuarios, sedes, setModalUsuario, handleDeleteUsuario }) => {
    
    // Función auxiliar para color del rol
    const getRoleBadge = (rol) => {
        switch(rol) {
            case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'CAJERO': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoleLabel = (rol) => {
        switch(rol) {
            case 'ADMIN': return 'Administrador';
            case 'CAJERO': return 'Cajero';
            default: return 'Operario';
        }
    };

    return (
        <div className="card">
            <SectionHeader 
                title="Equipo de Trabajo" 
                icon={UserGroupIcon}
                actionButton={
                    <button onClick={() => setModalUsuario({ open: true, data: null })} className="btn-primary">
                        <PlusIcon className="h-5 w-5" /> Nuevo Usuario
                    </button>
                }
            />
            
            <div className="table-container">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">Usuario / Email</th>
                            <th className="th">Rol</th>
                            <th className="th">Sede Asignada</th>
                            <th className="th text-center">Estado</th>
                            <th className="th text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 && (
                             <tr><td colSpan="5" className="td text-center text-gray-500 py-8">No hay usuarios registrados</td></tr>
                        )}
                        {usuarios.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="td">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</div>
                                            <div className="text-xs text-gray-500 font-mono">@{u.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="td">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRoleBadge(u.rol)}`}>
                                        {getRoleLabel(u.rol)}
                                    </span>
                                </td>
                                <td className="td">
                                    {u.nombre_sede ? (
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <MapPinIcon className="w-4 h-4 text-gray-400"/>
                                            <span className="text-sm font-medium">{u.nombre_sede}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Acceso Global</span>
                                    )}
                                </td>
                                <td className="td text-center">
                                    {u.is_active ? (
                                        <span className="inline-flex w-2 h-2 rounded-full bg-green-500"></span>
                                    ) : (
                                        <span className="inline-flex w-2 h-2 rounded-full bg-red-500"></span>
                                    )}
                                </td>
                                <td className="td">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setModalUsuario({ open: true, data: u })} className="btn-icon">
                                            <PencilIcon className="h-4 w-4"/>
                                        </button>
                                        <button onClick={() => handleDeleteUsuario(u.id)} className="btn-icon text-red-500 hover:bg-red-50">
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TabInventario = ({ empresa, setEmpresa, editMode, setEditMode, handleGuardar }) => (
  <div className="card max-w-xl mx-auto">
    <SectionHeader 
        title="Ajustes de Inventario" 
        icon={CubeIcon} 
        actionButton={
            !editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-secondary text-sm">
                <PencilIcon className="h-4 w-4" /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="btn-danger text-sm">Cancelar</button>
                <button onClick={() => { handleGuardar(); setEditMode(false); }} className="btn-primary text-sm">
                  Guardar
                </button>
              </div>
            )
        }
    />
    <div className="form-group">
      <label className="label">Stock Mínimo Global</label>
      <div className="flex gap-4">
        <input 
          type="number" 
          disabled={!editMode}
          value={empresa?.stock_minimo_global || 10} 
          onChange={e => setEmpresa({...empresa, stock_minimo_global: parseInt(e.target.value)})}
          className={!editMode ? 'input-readonly text-sm' : 'input text-sm'} 
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <BellIcon className="w-4 h-4"/> Alerta cuando insumos bajen de este nivel.
      </p>
    </div>
  </div>
);

const TabNotificaciones = ({ empresa, setEmpresa, handleGuardar }) => (
  <div className="card max-w-3xl mx-auto">
    <SectionHeader title="Notificaciones" icon={BellIcon} />
    <div className="space-y-4">
      <label className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
        <input 
          type="checkbox" 
          checked={empresa?.notif_email_activas || false}
          onChange={e => setEmpresa({...empresa, notif_email_activas: e.target.checked})}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <div>
          <div className="font-bold text-gray-900 dark:text-white">Email</div>
          <div className="text-sm text-gray-500">Notificar al cliente por correo.</div>
        </div>
      </label>
      <div className="pt-4">
          <button onClick={handleGuardar} className="btn-primary">Guardar Preferencias</button>
      </div>
    </div>
  </div>
);

// --- MODAL WRAPPER (Global) ---
const ModalContainer = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
          <XMarkIcon className="h-5 w-5"/>
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

// --- COMPONENTE GESTOR DE PRECIOS POR PRENDA ---
const ModalPreciosManager = ({ modalPrecios, setModalPrecios, prendas, handleSavePrecioPrenda, handleDeletePrecioPrenda }) => {
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
                        <TrashIcon className="h-4 w-4"/>
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
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"/>
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
                            <PlusIcon className="h-3 w-3"/> Se creará una nueva prenda: <strong>"{searchTerm}"</strong>
                        </p>
                    )}
                    {(selectedPrenda || exactMatch) && (
                         <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckIcon className="h-3 w-3"/> Seleccionado: <strong>{selectedPrenda?.nombre || exactMatch?.nombre}</strong>
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

// --- COMPONENTE PRINCIPAL (CONTROLADOR) ---

const Config = () => {
  const [activeTab, setActiveTab] = useState('negocio');
  
  // --- ESTADOS DE DATOS ---
  const [empresa, setEmpresa] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prendas, setPrendas] = useState([]); 
  const [usuarios, setUsuarios] = useState([]); // NUEVO ESTADO
  
  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(false);
  
  // Modos de Edición Independientes
  const [editModeEmpresa, setEditModeEmpresa] = useState(false);
  const [editModeTickets, setEditModeTickets] = useState(false);
  const [editModeInventario, setEditModeInventario] = useState(false);
  
  // Modales
  const [modalSede, setModalSede] = useState({ open: false, data: null });
  const [modalPago, setModalPago] = useState({ open: false, data: null });
  const [modalServicio, setModalServicio] = useState({ open: false, data: null });
  const [modalPrecios, setModalPrecios] = useState({ open: false, data: null });
  const [modalCategoria, setModalCategoria] = useState({ open: false, data: null });
  const [modalUsuario, setModalUsuario] = useState({ open: false, data: null }); // NUEVO MODAL

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resEmpresa, resSedes, resPagos, resCats, resServicios, resPrendas, resUsuarios] = await Promise.all([
        axios.get('/core/empresa/'),
        axios.get('/core/sedes/'),
        axios.get('/pagos/config/'),
        axios.get('/categorias-servicio/'),
        axios.get('/servicios/'),
        axios.get('/prendas/'),
        axios.get('/usuarios/') // NUEVO ENDPOINT
      ]);

      if (resEmpresa.data.results && resEmpresa.data.results.length > 0) {
        setEmpresa(resEmpresa.data.results[0]);
      } else {
        setEmpresa({ nombre: '', ruc: '', moneda: 'PEN' });
      }

      setSedes(resSedes.data.results || []);
      setMetodosPago(resPagos.data.results || []);
      setCategorias(resCats.data.results || []);
      setServicios(resServicios.data.results || []);
      setPrendas(resPrendas.data.results || []);
      setUsuarios(resUsuarios.data.results || []); // SET USUARIOS
    } catch (error) {
      console.error("Error cargando configuración", error);
      toast.error("Error al cargar datos del sistema");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleGuardarEmpresa = async () => {
    if (!empresa?.id) {
        toast.error("No se identificó la empresa para actualizar.");
        return;
    }
    setLoading(true);
    try {
      await axios.patch(`/core/empresa/${empresa.id}/`, empresa);
      toast.success("Configuración actualizada correctamente");
      fetchInitialData();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (modalSede.data?.id) {
        await axios.patch(`/core/sedes/${modalSede.data.id}/`, data);
        toast.success("Sede actualizada");
      } else {
        await axios.post('/core/sedes/', data);
        toast.success("Sede creada correctamente");
      }
      setModalSede({ open: false, data: null });
      const res = await axios.get('/core/sedes/');
      setSedes(res.data.results);
    } catch (error) {
      console.error(error);
      toast.error("Error guardando sede");
    }
  };

  const handleDeleteSede = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta sede?")) return;
    try {
      await axios.delete(`/core/sedes/${id}/`);
      setSedes(sedes.filter(s => s.id !== id));
      toast.success("Sede eliminada");
    } catch (error) {
      toast.error("No se puede eliminar (puede tener tickets asociados)");
    }
  };

  const handleSavePago = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const isActive = formData.get('activo') === 'on' ? 'True' : 'False';
    formData.set('activo', isActive);
    const imageFile = formData.get('imagen_qr');
    if (imageFile instanceof File && imageFile.size === 0) {
        formData.delete('imagen_qr');
    }
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    try {
      if (modalPago.data) {
        await axios.patch(`/pagos/config/${modalPago.data.id}/`, formData, config);
        toast.success("Método actualizado");
      } else {
        await axios.post('/pagos/config/', formData, config);
        toast.success("Método creado");
      }
      setModalPago({ open: false, data: null });
      const res = await axios.get('/pagos/config/');
      setMetodosPago(res.data.results);
    } catch (error) {
      console.error(error);
      toast.error("Error guardando método de pago");
    }
  };

  const handleSaveServicio = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.disponible = formData.get('disponible') === 'on';
    try {
      if (modalServicio.data) {
        await axios.patch(`/servicios/${modalServicio.data.id}/`, data);
        toast.success("Servicio actualizado");
      } else {
        await axios.post('/servicios/', data);
        toast.success("Servicio creado");
      }
      setModalServicio({ open: false, data: null });
      const res = await axios.get('/servicios/');
      setServicios(res.data.results);
    } catch (error) {
      toast.error("Error guardando servicio");
    }
  };

  const handleSavePrecioPrenda = async (payload) => {
    try {
      await axios.post(`/servicios/${modalPrecios.data.id}/establecer_precio_prenda/`, payload);
      toast.success("Catálogo actualizado");
      
      const [resServicios, resPrendas] = await Promise.all([
          axios.get('/servicios/'),
          axios.get('/prendas/')
      ]);
      setServicios(resServicios.data.results);
      setPrendas(resPrendas.data.results);

      const updatedService = resServicios.data.results.find(s => s.id === modalPrecios.data.id);
      setModalPrecios({ open: true, data: updatedService });
      
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar precio");
    }
  };

  const handleDeletePrecioPrenda = async (prendaId) => {
      if(!window.confirm("¿Quitar esta prenda del catálogo de este servicio?")) return;
      try {
          await axios.post(`/servicios/${modalPrecios.data.id}/eliminar_precio_prenda/`, { prenda_id: prendaId });
          toast.success("Prenda desvinculada");
          
          const resServicios = await axios.get('/servicios/');
          setServicios(resServicios.data.results);
          const updatedService = resServicios.data.results.find(s => s.id === modalPrecios.data.id);
          setModalPrecios({ open: true, data: updatedService });
      } catch (error) {
          toast.error("Error al eliminar");
      }
  }

  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      if (modalCategoria.data) {
        await axios.patch(`/categorias-servicio/${modalCategoria.data.id}/`, data);
        toast.success("Categoría actualizada");
      } else {
        await axios.post('/categorias-servicio/', data);
        toast.success("Categoría creada");
      }
      setModalCategoria({ open: false, data: null });
      const res = await axios.get('/categorias-servicio/');
      setCategorias(res.data.results);
    } catch (error) {
      toast.error("Error guardando categoría");
    }
  };
  
// --- CORRECCIÓN EN CONFIG.JSX ---
  
  const handleSaveUsuario = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      // Estructura PLANA para el serializer (sin anidar en 'perfil')
      const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password, // Puede estar vacío en edit
          rol: data.rol,           // Enviamos directo
          sede_id: data.sede ? parseInt(data.sede) : null // Enviamos como 'sede_id' y convertimos a null si está vacío
      };

      // Si es update, eliminamos password si está vacío
      if (modalUsuario.data && !data.password) {
          delete payload.password;
      }
      // Validacion de seguridad para creación
      if (!modalUsuario.data && !payload.password) {
          return toast.error("La contraseña es obligatoria al crear");
      }

      try {
          if (modalUsuario.data) {
              await axios.patch(`/usuarios/${modalUsuario.data.id}/`, payload);
              toast.success("Usuario actualizado");
          } else {
              await axios.post('/usuarios/', payload);
              toast.success("Usuario creado: " + data.first_name);
          }
          setModalUsuario({ open: false, data: null });
          // Recargar lista
          const res = await axios.get('/usuarios/');
          setUsuarios(res.data.results);
      } catch (error) {
          console.error(error);
          // Mostrar mensaje de error específico del backend si existe
          const errorMsg = error.response?.data?.email?.[0] || 
                           error.response?.data?.rol?.[0] || 
                           "Error guardando usuario";
          toast.error(errorMsg);
      }
  };

  const handleDeleteUsuario = async (id) => {
      if (!window.confirm("¿Desactivar este usuario? Ya no podrá acceder al sistema.")) return;
      try {
          await axios.delete(`/usuarios/${id}/`);
          toast.success("Usuario desactivado");
          const res = await axios.get('/usuarios/');
          setUsuarios(res.data.results);
      } catch (error) {
          toast.error("No se pudo desactivar el usuario");
      }
  };

  // --- MENU LATERAL ---
  const tabs = [
    { id: 'negocio', label: 'Mi Negocio', icon: BuildingStorefrontIcon },
    { id: 'suscripcion', label: 'Suscripción', icon: SparklesIcon },
    { id: 'pagos', label: 'Pagos', icon: CreditCardIcon },
    { id: 'servicios', label: 'Servicios', icon: TagIcon },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'usuarios', label: 'Usuarios', icon: UserGroupIcon }, // AHORA FUNCIONAL
    { id: 'inventario', label: 'Inventario', icon: CubeIcon },
    { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* SIDEBAR NAVEGACIÓN */}
      <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex-shrink-0 z-10 shadow-sm">
        <div className="p-6 hidden lg:block">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Ajustes</h1>
          <p className="text-sm text-gray-500 font-medium">Panel de Control</p>
        </div>
        <nav className="p-2 lg:px-4 space-y-1 overflow-x-auto lg:overflow-visible flex lg:block scrollbar-hide">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left whitespace-nowrap group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'negocio' && (
            <TabNegocio 
              empresa={empresa} 
              setEmpresa={setEmpresa} 
              editMode={editModeEmpresa} 
              setEditMode={setEditModeEmpresa}
              loading={loading} 
              handleGuardar={handleGuardarEmpresa}
              sedes={sedes} 
              setModalSede={setModalSede} 
              handleDeleteSede={handleDeleteSede}
            />
          )}
          {activeTab === 'suscripcion' && <TabSuscripcion empresa={empresa} />}
          {activeTab === 'pagos' && <TabPagos metodosPago={metodosPago} setModalPago={setModalPago} />}
          {activeTab === 'servicios' && (
            <TabServicios 
              servicios={servicios} 
              categorias={categorias} 
              setModalServicio={setModalServicio} 
              setModalCategoria={setModalCategoria} 
              setModalPrecios={setModalPrecios}
            />
          )}
          {activeTab === 'tickets' && (
            <TabTickets 
                empresa={empresa} 
                setEmpresa={setEmpresa} 
                editMode={editModeTickets} 
                setEditMode={setEditModeTickets}
                handleGuardar={handleGuardarEmpresa}
            />
          )}
          {activeTab === 'usuarios' && (
              <TabUsuarios 
                  usuarios={usuarios} 
                  sedes={sedes}
                  setModalUsuario={setModalUsuario}
                  handleDeleteUsuario={handleDeleteUsuario}
              />
          )}
          {activeTab === 'inventario' && (
            <TabInventario 
                empresa={empresa} 
                setEmpresa={setEmpresa} 
                editMode={editModeInventario}
                setEditMode={setEditModeInventario}
                handleGuardar={handleGuardarEmpresa} 
            />
          )}
          {activeTab === 'notificaciones' && <TabNotificaciones empresa={empresa} setEmpresa={setEmpresa} handleGuardar={handleGuardarEmpresa} />}
        </div>
      </main>

      {/* MODAL SEDE */}
      {modalSede.open && (
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
      )}

      {/* MODAL PAGO */}
      {modalPago.open && (
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
      )}

      {/* MODAL SERVICIO */}
      {modalServicio.open && (
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
      )}

      {/* MODAL GESTOR DE PRECIOS */}
      {modalPrecios.open && (
        <ModalPreciosManager 
            modalPrecios={modalPrecios} 
            setModalPrecios={setModalPrecios}
            prendas={prendas}
            handleSavePrecioPrenda={handleSavePrecioPrenda}
            handleDeletePrecioPrenda={handleDeletePrecioPrenda}
        />
      )}

      {/* MODAL CATEGORIA */}
      {modalCategoria.open && (
        <ModalContainer title={modalCategoria.data ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModalCategoria({ open: false, data: null })}>
          <form onSubmit={handleSaveCategoria} className="space-y-4">
            <div className="form-group"><label className="label">Nombre</label><input name="nombre" defaultValue={modalCategoria.data?.nombre} className="input" required /></div>
            <div className="form-group"><label className="label">Descripción</label><textarea name="descripcion" defaultValue={modalCategoria.data?.descripcion} className="input min-h-[80px]" rows="3" /></div>
            <div className="form-group"><label className="label">Orden</label><input type="number" name="orden" defaultValue={modalCategoria.data?.orden || 0} className="input" /></div>
            <button className="btn-primary w-full">Guardar</button>
          </form>
        </ModalContainer>
      )}

      {/* NUEVO MODAL: USUARIO */}
      {modalUsuario.open && (
          <ModalContainer title={modalUsuario.data ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModalUsuario({ open: false, data: null })}>
              <form onSubmit={handleSaveUsuario} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                          <label className="label flex items-center gap-1"><UserIcon className="w-4 h-4"/> Nombres</label>
                          <input name="first_name" defaultValue={modalUsuario.data?.first_name} className="input" required placeholder="Ej: Juan" />
                      </div>
                      <div className="form-group">
                          <label className="label flex items-center gap-1"><UserIcon className="w-4 h-4"/> Apellidos</label>
                          <input name="last_name" defaultValue={modalUsuario.data?.last_name} className="input" required placeholder="Ej: Perez" />
                      </div>
                  </div>
                  
                  <div className="form-group">
                      <label className="label flex items-center gap-1"><EnvelopeIcon className="w-4 h-4"/> Correo Electrónico</label>
                      <input type="email" name="email" defaultValue={modalUsuario.data?.email} className="input" required placeholder="usuario@empresa.com" />
                  </div>

                  <div className="form-group">
                      <label className="label flex items-center gap-1">
                          <KeyIcon className="w-4 h-4"/> Contraseña
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
      )}
    </div>
  );
};

export default Config;