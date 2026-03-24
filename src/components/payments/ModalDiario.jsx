import {
    Wallet, Search, ArrowUpRight, ArrowDownLeft,
    DollarSign, CreditCard, Lock, RotateCcw,
    RefreshCw, X, Clock, FileText, Calendar, User, Eye, AlertTriangle,
    CheckCircle, Unlock, ArrowDownCircle, AlertCircle, PlusCircle, MinusCircle, BookOpen
} from 'lucide-react';

export const ModalDiario = (props) => {
    const {
        showDiarioModal, setShowDiarioModal,
        diarioFilters, setDiarioFilters,
        fetchDiario, diarioEvents, loadingDiario, openTransactionDetail,
        today
    } = props;

    if (!showDiarioModal) return null;

    return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-5xl shadow-2xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-4 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen size={24} /> Diario Electrónico</h3>
                            <p className="text-xs text-gray-500 mt-1">Historial detallado de movimientos</p>
                        </div>
                        <button onClick={() => setShowDiarioModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full dark:bg-gray-700"><X size={20} /></button>
                    </div>

                    {/* Filtros de Fecha */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl mb-4 flex gap-3 items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Periodo:</span>
                        <input
                            type="date"
                            value={diarioFilters.desde}
                            onChange={(e) => setDiarioFilters({ ...diarioFilters, desde: e.target.value })}
                            className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={diarioFilters.hasta}
                            onChange={(e) => setDiarioFilters({ ...diarioFilters, hasta: e.target.value })}
                            className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                        <button
                            onClick={fetchDiario}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Search size={16} /> Filtrar
                        </button>
                    </div>

                    {/* Tabla de Movimientos */}
                    <div className="flex-1 overflow-auto rounded-xl border dark:border-gray-700">
                        <div className="min-w-full">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                                        <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Movimiento</th>
                                        <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                                        <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                                    {diarioEvents.map((ev, idx) => (
                                        <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${ev.estado === 'ANULADO' ? 'opacity-50 line-through' : ''}`}>
                                            <td className="p-4 text-xs font-mono text-gray-500">
                                                {/* Mostrar fecha si es distinta a hoy, sino solo hora */}
                                                {new Date(ev.fecha).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? new Date(ev.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : new Date(ev.fecha).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                }
                                            </td>

                                            <td className="p-4">
                                                {/* CAMBIO: Quitar font-bold de la descripción */}
                                                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                                                    {ev.tipo_evento === 'VENTA' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                                    {ev.tipo_evento === 'EGRESO' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                                    {ev.tipo_evento === 'INGRESO' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                    {ev.tipo_evento === 'APERTURA' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                                    {ev.tipo_evento === 'CIERRE' && <div className="w-2 h-2 rounded-full bg-gray-900"></div>}
                                                    {ev.descripcion}
                                                </div>
                                            </td>

                                            {/* CAMBIO: Quitar font-bold del monto */}
                                            <td className={`p-4 text-right font-mono text-sm ${ev.es_entrada === true ? 'text-emerald-600' :
                                                ev.es_entrada === false ? 'text-red-600' : 'text-gray-800 dark:text-gray-300'
                                                }`}>
                                                {ev.es_entrada !== null ? (ev.es_entrada ? '+' : '-') : ''} S/ {parseFloat(ev.monto).toFixed(2)}
                                            </td>

                                            <td className="p-4 pl-8 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                                {ev.usuario}
                                            </td>

                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => openTransactionDetail(ev)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingDiario && diarioEvents.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay movimientos registrados en este periodo.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
};
