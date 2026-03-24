import React from 'react';
import { X, Loader, UserPlus, CheckCircle, AlertTriangle, Printer } from 'lucide-react';


export const ModalExitoTicket = (props) => {
    const { createdTicket, handlePrintTicket, resetPOS } = props;

    if (!createdTicket) return null;

    return (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-96 text-center animate-in fade-in zoom-in border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400 mx-auto">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Orden Emitida!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Ticket N° <span className="font-mono text-gray-900 dark:text-white font-bold">{createdTicket.numero_ticket}</span></p>

                        <div className="mt-6 flex gap-3">
                            <button onClick={handlePrintTicket} className="flex-1 btn-secondary py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold flex justify-center gap-2 items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Printer size={20} /> Imprimir
                            </button>
                            <button onClick={resetPOS} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                                Nueva
                            </button>
                        </div>
                    </div>
                </div>

    );
};
