import React from 'react';
import { X, Loader, UserPlus, CheckCircle, AlertTriangle, Printer } from 'lucide-react';


export const ModalInfo = (props) => {
    const { infoModal, closeInfoModal } = props;

    if (!infoModal.show) return null;

    return (
                <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-96 text-center border border-gray-200 dark:border-gray-700">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${infoModal.type === 'error' ? 'bg-red-100 text-red-500' :
                            infoModal.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-blue-100 text-blue-500'
                            }`}>
                            {infoModal.type === 'error' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                        </div>
                        <h3 className="text-lg font-bold mb-2 dark:text-white">{infoModal.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{infoModal.message}</p>
                        <div className="flex gap-2">
                            {infoModal.showCancel && (
                                <button onClick={closeInfoModal} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold dark:bg-gray-700 dark:text-white hover:bg-gray-200">Cancelar</button>
                            )}
                            <button onClick={infoModal.action || closeInfoModal} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg">{infoModal.confirmText}</button>
                        </div>
                    </div>
                </div>

    );
};
