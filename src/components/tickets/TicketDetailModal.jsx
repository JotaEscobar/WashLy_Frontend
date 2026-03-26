import React from 'react';
import { 
    Plus, Search, Eye, Clock, X, AlertTriangle, CheckCircle, Trash2, Wallet, ArrowRight, DollarSign, MapPin, Printer, ChevronLeft, ChevronRight, User, AlertCircle, Lock, Ban, Truck, MessageSquare, Loader 
} from 'lucide-react';


import PaymentMethodSelect from '../../components/PaymentMethodSelect';


export const TicketDetailModal = (props) => {
    const { 
        selectedTicket, setSelectedTicket, modalConfig, closeModal, successMsg, 
        getStatusBadge, actionLoading, newStatus, setNewStatus, onSaveStatusClick, 
        statusComment, setStatusComment, showCancelOptions, setShowCancelOptions, 
        cancelReason, setCancelReason, onConfirmCancelClick, showPayModal, setShowPayModal,
        payAmount, setPayAmount, payMethod, setPayMethod, onRegisterPaymentClick, handleReprintTicket
    } = props;

    if (!selectedTicket) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fixed top-0 left-0 w-full h-full">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in border border-gray-200 dark:border-gray-700 relative overflow-hidden">

                {/* ALERTAS Y CONFIRMACIONES */}
                {modalConfig.show && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in p-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full text-center">
                            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${modalConfig.type === 'money' ? 'bg-emerald-100 text-emerald-600' :
                                ['danger', 'error'].includes(modalConfig.type) ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                {modalConfig.type === 'money' ? <DollarSign size={24} /> :
                                    ['danger', 'error'].includes(modalConfig.type) ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{modalConfig.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{modalConfig.message}</p>
                            <div className="flex gap-3">
                                {modalConfig.action && (
                                    <button onClick={closeModal} disabled={actionLoading} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">Cancelar</button>
                                )}
                                <button disabled={actionLoading} onClick={modalConfig.action || closeModal} className={`flex-1 px-4 py-2 text-white rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${modalConfig.type === 'money' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    ['danger', 'error'].includes(modalConfig.type) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}>
                                    {actionLoading && <Loader className="animate-spin" size={16} />}
                                    {actionLoading ? 'Procesando...' : modalConfig.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MENSAJE FLOTANTE DE ÉXITO (Toast) */}
                {successMsg && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-bottom-4">
                        <div className="bg-green-500 rounded-full p-1"><CheckCircle size={14} className="text-white" /></div>
                        <span className="font-bold text-sm">{successMsg}</span>
                    </div>
                )}

                {/* Header Modal - LIMPIO */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            Ticket {selectedTicket.numero_ticket}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(selectedTicket.estado)}`}>{selectedTicket.estado}</span>
                        </h2>
                        <div className="text-base text-gray-700 dark:text-gray-300 font-bold mt-1 flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            {selectedTicket.cliente_info?.nombre_completo}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={14} /> Entrega: {new Date(selectedTicket.fecha_prometida).toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    {/* Row 1: Gestión de Estado y Finanzas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Gestión de Estado */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 relative">
                            <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-3 flex items-center gap-2">Gestión de Estado</h3>

                            {selectedTicket.estado !== 'CANCELADO' && selectedTicket.estado !== 'ENTREGADO' && (
                                <button onClick={() => setShowCancelOptions(!showCancelOptions)} className="absolute -top-2 right-0 flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 border border-red-100 dark:border-red-900/30 rounded-full p-2 hover:pr-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group shadow-sm z-10">
                                    <Trash2 size={16} />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 text-xs font-bold whitespace-nowrap">Cancelar Ticket</span>
                                </button>
                            )}

                            {['ENTREGADO', 'CANCELADO'].includes(selectedTicket.estado) ? (
                                <div className={`flex items-center gap-2 p-3 rounded-lg border dark:border-gray-700 ${selectedTicket.estado === 'CANCELADO' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200' : 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200'}`}>
                                    {selectedTicket.estado === 'CANCELADO' ? <Ban size={18} /> : <Lock size={18} />}
                                    <span className="text-xs font-bold">{selectedTicket.estado === 'CANCELADO' ? 'TICKET ANULADO - Operación bloqueada' : 'TICKET FINALIZADO (Entregado)'}</span>
                                </div>
                            ) : (
                                !showCancelOptions ? (
                                    <>
                                        <div className="flex gap-2 mb-2">
                                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex-1 p-2 rounded-lg border text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                                                <option value="RECIBIDO">Recibido</option>
                                                <option value="EN_PROCESO">En Proceso</option>
                                                <option value="LISTO">Listo</option>
                                                <option value="ENTREGADO">Entregado</option>
                                            </select>
                                            <button onClick={onSaveStatusClick} disabled={newStatus === selectedTicket.estado || actionLoading} className={`px-3 rounded-lg font-bold text-white text-xs ${newStatus === selectedTicket.estado || actionLoading ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                {actionLoading ? '...' : 'Guardar'}
                                            </button>
                                        </div>
                                        <input type="text" placeholder="Comentario..." value={statusComment} onChange={(e) => setStatusComment(e.target.value)} className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </>
                                ) : (
                                    <div className="mt-2 animate-in fade-in">
                                        <p className="text-xs font-bold text-red-600 mb-1">Motivo de cancelación:</p>
                                        <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-2 text-xs border border-red-300 rounded mb-2 dark:bg-gray-700 dark:text-white" autoFocus />
                                        <div className="flex gap-2">
                                            <button onClick={onConfirmCancelClick} disabled={actionLoading} className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded font-bold hover:bg-red-700">Confirmar</button>
                                            <button onClick={() => setShowCancelOptions(false)} className="px-2 text-gray-500 text-xs hover:underline">Atrás</button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Finanzas */}
                        <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2"><Wallet size={14} /> Finanzas</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-500">Total: <strong className="text-gray-900 dark:text-white">S/ {selectedTicket.total.toFixed(2)}</strong></p>
                                    <p className="text-xs text-emerald-600">Pagado: <strong>S/ {(selectedTicket.total - selectedTicket.saldo_pendiente).toFixed(2)}</strong></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase">Saldo</p>
                                    <p className={`text-xl font-black ${selectedTicket.saldo_pendiente > 0 ? 'text-red-600' : 'text-emerald-500'}`}>S/ {selectedTicket.saldo_pendiente.toFixed(2)}</p>
                                </div>
                            </div>
                            {selectedTicket.saldo_pendiente > 0 && !showPayModal && selectedTicket.estado !== 'CANCELADO' && (
                                <button onClick={() => { setShowPayModal(true); setPayAmount(selectedTicket.saldo_pendiente); }} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold flex justify-center gap-2 items-center shadow-sm">
                                    <DollarSign size={14} /> Registrar Pago
                                </button>
                            )}
                            {showPayModal && (
                                <div className="mt-2 flex gap-1 animate-in fade-in flex-col">
                                    <div className="flex gap-1">
                                        <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-20 p-2 text-xs border rounded dark:bg-gray-700 dark:text-white" placeholder="Monto" />
                                        <PaymentMethodSelect
                                            value={payMethod}
                                            onChange={(e) => setPayMethod(e.target.value)}
                                            className="flex-1 p-2 text-xs border rounded dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={onRegisterPaymentClick} disabled={actionLoading} className="flex-1 bg-emerald-600 text-white text-xs rounded py-1 font-bold hover:bg-emerald-700">Pagar</button>
                                        <button onClick={() => setShowPayModal(false)} className="px-2 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-600 rounded"><X size={14} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Tabla de Prendas y Detalles de Entrega (SIMETRICO 50/50) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Lado Izquierdo: Tabla de Items */}
                        <div className="border rounded-xl overflow-hidden dark:border-gray-700 h-full">
                            <div className="bg-gray-100 dark:bg-gray-700/50 p-2 text-xs font-bold text-gray-500 uppercase border-b dark:border-gray-700">
                                Detalle de Prendas
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                                    <tr>
                                        <th className="p-2 text-left w-12 text-center">Cant.</th>
                                        <th className="p-2 text-left">Prenda / Servicio</th>
                                        <th className="p-2 text-right">Importe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700 dark:text-gray-300">
                                    {selectedTicket.items?.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-2 font-bold w-12 text-center">{item.cantidad}</td>
                                            <td className="p-2">
                                                <span className="font-bold">{item.prenda_nombre || 'Item'}</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.servicio_nombre}</div>
                                                {item.descripcion && <div className="text-xs text-gray-400 italic">{item.descripcion}</div>}
                                            </td>
                                            <td className="p-2 text-right">S/ {item.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Lado Derecho: Información de Entrega y Observaciones (SIMÉTRICO) */}
                        <div className="border rounded-xl dark:border-gray-700 overflow-hidden h-full flex flex-col">
                            <div className="bg-gray-100 dark:bg-gray-700/50 p-2 text-xs font-bold text-gray-500 uppercase border-b dark:border-gray-700">
                                Información de Entrega
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-1 bg-white dark:bg-gray-800">

                                {/* Tipo de Entrega */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Tipo de Entrega</span>
                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                        <Truck size={16} className="text-blue-500" />
                                        {selectedTicket.tipo_entrega || 'Recojo en Local'}
                                    </div>
                                </div>

                                {/* Observaciones (Simplificado y Limpio) */}
                                <div className="flex-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Observaciones</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic break-words">
                                        {selectedTicket.observaciones || selectedTicket.notas || 'Sin observaciones.'}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <button onClick={handleReprintTicket} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-xl transition-colors font-bold border border-gray-200 dark:border-gray-600">
                            <Printer size={18} /> Ver / Reimprimir Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
