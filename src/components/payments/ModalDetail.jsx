import {
    Wallet, Search, ArrowUpRight, ArrowDownLeft,
    DollarSign, CreditCard, Lock, RotateCcw,
    RefreshCw, X, Clock, FileText, Calendar, User, Eye, AlertTriangle,
    CheckCircle, Unlock, ArrowDownCircle, AlertCircle, PlusCircle, MinusCircle, BookOpen
} from 'lucide-react';

export const ModalDetail = (props) => {
    const { showDetailModal, setShowDetailModal, detailContent } = props;

    if (!showDetailModal || !detailContent) return null;

    return (
            <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                    <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={18} /></button>

                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                        {detailContent.tipo_evento === 'VENTA' ? <CreditCard size={18} className="text-blue-500" /> :
                            detailContent.tipo_evento === 'APERTURA' ? <Unlock size={18} className="text-emerald-500" /> :
                                detailContent.tipo_evento === 'CIERRE' ? <Lock size={18} className="text-gray-500" /> :
                                    detailContent.tipo_evento === 'INGRESO' ? <ArrowUpRight size={18} className="text-blue-500" /> :
                                        detailContent.tipo_evento === 'EGRESO' ? <ArrowDownLeft size={18} className="text-red-500" /> :
                                            <FileText size={18} className="text-gray-500" />}
                        Detalle de Transacción
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 font-mono">{new Date(detailContent.fecha).toLocaleString()}</p>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4 border dark:border-gray-700">
                        {detailContent.detalles && Object.keys(detailContent.detalles).length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {Object.entries(detailContent.detalles).map(([key, value]) => (
                                    <li key={key} className="flex justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 pb-1 last:pb-0">
                                        <span className="font-bold text-gray-500 text-xs uppercase">{key}:</span>
                                        <span className="font-mono text-gray-900 dark:text-gray-200">
                                            {typeof value === 'number' ? `S/ ${value.toFixed(2)}` : value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-400 text-xs italic">Sin detalles adicionales registrados.</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                        <span className="text-xs font-bold uppercase text-gray-500">Monto Total</span>
                        <span className="text-xl font-black text-gray-800 dark:text-white">S/ {parseFloat(detailContent.monto).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
};
