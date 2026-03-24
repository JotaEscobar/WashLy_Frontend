import React from 'react';
import { X, Loader, UserPlus, CheckCircle, AlertTriangle, Printer } from 'lucide-react';


export const ModalCrearCliente = (props) => {
    const { showClientModal, setShowClientModal, handleCreateClient, newClientData, setNewClientData } = props;

    if (!showClientModal) return null;

    return (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-[500px] border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <UserPlus className="text-blue-600" /> Nuevo Cliente
                            </h2>
                            <button onClick={() => setShowClientModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipo Doc.</label>
                                    <select
                                        className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
                                        value={newClientData.tipo_documento}
                                        onChange={(e) => setNewClientData({ ...newClientData, tipo_documento: e.target.value })}
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                        <option value="CE">Carnet Ext.</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nro Documento *</label>
                                    <input
                                        type="text" required
                                        className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
                                        value={newClientData.numero_documento}
                                        onChange={(e) => setNewClientData({ ...newClientData, numero_documento: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nombres *</label>
                                    <input type="text" required className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none" value={newClientData.nombres} onChange={(e) => setNewClientData({ ...newClientData, nombres: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Apellidos</label>
                                    <input type="text" className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none" value={newClientData.apellidos} onChange={(e) => setNewClientData({ ...newClientData, apellidos: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono *</label>
                                    <input type="text" required className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none" value={newClientData.telefono} onChange={(e) => setNewClientData({ ...newClientData, telefono: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                    <input type="email" className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none" value={newClientData.email} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Dirección</label>
                                <input type="text" className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none" value={newClientData.direccion} onChange={(e) => setNewClientData({ ...newClientData, direccion: e.target.value })} />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all mt-2">
                                GUARDAR CLIENTE
                            </button>
                        </form>
                    </div>
                </div>

    );
};
