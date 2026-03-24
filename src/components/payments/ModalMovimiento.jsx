import {
    Wallet, Search, ArrowUpRight, ArrowDownLeft,
    DollarSign, CreditCard, Lock, RotateCcw,
    RefreshCw, X, Clock, FileText, Calendar, User, Eye, AlertTriangle,
    CheckCircle, Unlock, ArrowDownCircle, AlertCircle, PlusCircle, MinusCircle, BookOpen
} from 'lucide-react';

import PaymentMethodSelect from '../../components/PaymentMethodSelect';

export const ModalMovimiento = (props) => {
    const { showMovimientoModal, setShowMovimientoModal, movimientoForm, setMovimientoForm, handleRegisterMovimiento } = props;

    if (!showMovimientoModal) return null;

    return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Wallet size={20} /> Registrar {movimientoForm.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                    </h3>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4 dark:bg-gray-700">
                        <button
                            onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'INGRESO' })}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${movimientoForm.tipo === 'INGRESO' ? 'bg-white shadow text-emerald-600 dark:bg-gray-600 dark:text-emerald-400' : 'text-gray-500'}`}
                        >
                            INGRESO (+)
                        </button>
                        <button
                            onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'EGRESO' })}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${movimientoForm.tipo === 'EGRESO' ? 'bg-white shadow text-red-600 dark:bg-gray-600 dark:text-red-400' : 'text-gray-500'}`}
                        >
                            GASTO (-)
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Categoría</label>
                            <input
                                list="categorias"
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                value={movimientoForm.categoria}
                                onChange={e => setMovimientoForm({ ...movimientoForm, categoria: e.target.value })}
                                placeholder="Ej. Proveedor, Personal, Vuelto..."
                            />
                            <datalist id="categorias">
                                <option value="PAGO PROVEEDOR" />
                                <option value="PAGO PERSONAL" />
                                <option value="SERVICIOS" />
                                <option value="SOBRANTE CAJA" />
                                <option value="OTROS" />
                            </datalist>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">S/</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                    value={movimientoForm.monto}
                                    onChange={e => setMovimientoForm({ ...movimientoForm, monto: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Método de Pago</label>
                            <PaymentMethodSelect
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold dark:bg-gray-900 dark:border-gray-600"
                                value={movimientoForm.metodo_pago}
                                onChange={e => setMovimientoForm({ ...movimientoForm, metodo_pago: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Nota (Opcional)</label>
                            <textarea
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600 h-16 resize-none"
                                value={movimientoForm.descripcion}
                                onChange={e => setMovimientoForm({ ...movimientoForm, descripcion: e.target.value })}
                                placeholder="Detalles adicionales..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setShowMovimientoModal(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:bg-gray-700">Cancelar</button>
                        <button onClick={handleRegisterMovimiento} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-black">Guardar</button>
                    </div>
                </div>
            </div>
    );
};
