import React from 'react';
import { X, Loader, UserPlus, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { Search } from 'lucide-react';


export const ModalPrendas = (props) => {
    const { modalPrendas, setModalPrendas, addToCart } = props;

    if (!modalPrendas.show) return null;

    return (
                <div className="absolute inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in fade-in zoom-in border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">{modalPrendas.service?.nombre}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione la prenda específica</p>
                            </div>
                            <button onClick={() => setModalPrendas({ ...modalPrendas, show: false })} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Buscar prenda (ej. Camisa, Pantalón)..."
                                    value={modalPrendas.searchTerm}
                                    onChange={(e) => setModalPrendas({ ...modalPrendas, searchTerm: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {modalPrendas.loading ? (
                                <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600" /></div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {modalPrendas.items
                                        .filter(item => item.prenda_nombre.toLowerCase().includes(modalPrendas.searchTerm.toLowerCase()))
                                        .map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => addToCart(modalPrendas.service, item)}
                                                className="flex justify-between items-center p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all text-left group"
                                            >
                                                <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">{item.prenda_nombre}</span>
                                                <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-lg text-sm">S/ {item.precio}</span>
                                            </button>
                                        ))}
                                    {modalPrendas.items.length === 0 && !modalPrendas.loading && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No hay prendas configuradas.<br />Vaya a Configuración &gt; Servicios.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

    );
};
