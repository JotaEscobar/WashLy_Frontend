import React from 'react';
import { 
    Plus, Search, Eye, Clock, X, AlertTriangle, CheckCircle, Trash2, Wallet, ArrowRight, DollarSign, MapPin, Printer, ChevronLeft, ChevronRight, User, AlertCircle, Lock, Ban, Truck, MessageSquare 
} from 'lucide-react';



export const TicketsTable = ({ loading, filteredTickets, getDateStatus, getReadyTime, getStatusBadge, handleViewDetails, fetchTickets, prevPage, nextPage }) => (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4">Orden</th>
                                <th className="p-4">Registro</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Estado / Aviso</th>
                                <th className="p-4">Prometido</th>
                                <th className="p-4 text-right">Saldo</th>
                                <th className="p-4 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? <tr><td colSpan="7" className="p-8 text-center animate-pulse">Cargando...</td></tr> :
                                filteredTickets.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-gray-500">Sin resultados</td></tr> :
                                    filteredTickets.map(ticket => {
                                        const statusData = getDateStatus(ticket);
                                        const readyMsg = getReadyTime(ticket);
                                        return (
                                            <tr key={ticket.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${statusData?.className || ''}`}>
                                                <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                    {ticket.numero_ticket}
                                                    {statusData && <div className={`flex items-center gap-1 mt-1 text-[10px] font-black ${statusData.textColor}`}><AlertTriangle size={10} /> {statusData.text}</div>}
                                                </td>
                                                <td className="p-4 text-xs text-gray-500">{new Date(ticket.creado_en).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium dark:text-gray-200">{ticket.cliente_nombre}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getStatusBadge(ticket.estado)}`}>{ticket.estado}</span>
                                                    {readyMsg && <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle size={10} /> {readyMsg}</div>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{new Date(ticket.fecha_prometida).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="p-4 text-right">
                                                    {ticket.saldo_pendiente > 0
                                                        ? <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Debe: S/ {ticket.saldo_pendiente.toFixed(2)}</span>
                                                        : <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Pagado</span>}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => handleViewDetails(ticket.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30"><Eye size={18} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <button disabled={!prevPage} onClick={() => fetchTickets(prevPage)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!prevPage ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}><ChevronLeft size={16} /> Anterior</button>
                    <span className="text-xs text-gray-500">Navegación de Registros</span>
                    <button disabled={!nextPage} onClick={() => fetchTickets(nextPage)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!nextPage ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>Siguiente <ChevronRight size={16} /></button>
                </div>
            </div>

);
