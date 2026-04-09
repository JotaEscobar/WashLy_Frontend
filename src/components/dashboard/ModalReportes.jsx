import React from 'react';
import { Package, DollarSign, FileText, TrendingUp, Archive, Users, Printer, X, Download, Activity } from 'lucide-react';

export const ModalReportes = (props) => {
    const {
        showReportModal, setShowReportModal,
        reportConfig, setReportConfig,
        filterOptions, handleDownload, downloading
    } = props;

    if (!showReportModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[550px] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                            <Printer className="text-blue-600" /> Centro de Reportes
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Genera exportaciones detalladas en PDF/HTML</p>
                    </div>
                    <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={20} /></button>
                </div>

                {/* Body: Grid Layout */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                    {/* Sidebar: Módulos */}
                    <div className="col-span-4 border-r dark:border-gray-700 pr-4 space-y-2 overflow-y-auto">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Módulos</label>
                        {[
                            { id: 'TICKETS', label: 'Tickets', icon: Package },
                            { id: 'PAGOS', label: 'Caja y Pagos', icon: DollarSign },
                            { id: 'DIARIO_ELECTRONICO', label: 'Diario Electrónico', icon: FileText },
                            { id: 'VENTAS', label: 'Ventas', icon: TrendingUp },
                            { id: 'INVENTARIO', label: 'Inventario', icon: Archive },
                            { id: 'CLIENTES', label: 'Clientes', icon: Users },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setReportConfig({ ...reportConfig, module: m.id })}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${reportConfig.module === m.id
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <m.icon size={18} /> {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Content: Filtros */}
                    <div className="col-span-8 flex flex-col gap-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Configuración del Reporte</h4>

                            {['TICKETS', 'PAGOS', 'VENTAS', 'CLIENTES', 'DIARIO_ELECTRONICO'].includes(reportConfig.module) && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fecha Inicio</label>
                                        <input type="date" value={reportConfig.dateStart} onChange={e => setReportConfig({ ...reportConfig, dateStart: e.target.value })} className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-600 cursor-text" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fecha Fin</label>
                                        <input type="date" value={reportConfig.dateEnd} onChange={e => setReportConfig({ ...reportConfig, dateEnd: e.target.value })} className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-600 cursor-text" />
                                    </div>
                                </div>
                            )}

                            {/* CONTROLES TICKETS Y PAGOS */}
                            {['TICKETS', 'PAGOS'].includes(reportConfig.module) && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Filtro Estado</label>
                                        <select
                                            value={reportConfig.status}
                                            onChange={e => setReportConfig({ ...reportConfig, status: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todos los estados</option>
                                            {reportConfig.module === 'TICKETS' ? (
                                                <>
                                                    <option value="RECIBIDOS">Solo Recibidos</option>
                                                    <option value="ENTREGADOS">Solo Entregados</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="PAGADO">Solo Pagados</option>
                                                    <option value="PENDIENTE">Solo Pendientes</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    {reportConfig.module === 'PAGOS' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Método de Pago</label>
                                            <select
                                                value={reportConfig.paymentMethod}
                                                onChange={e => setReportConfig({ ...reportConfig, paymentMethod: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="TODOS">Todos los métodos</option>
                                                {filterOptions.paymentMethods.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre_mostrar}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CONTROLES VENTAS */}
                            {reportConfig.module === 'VENTAS' && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoría de Servicio</label>
                                        <select
                                            value={reportConfig.serviceCategory}
                                            onChange={e => setReportConfig({ ...reportConfig, serviceCategory: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todas las categorías</option>
                                            {filterOptions.serviceCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* CONTROLES INVENTARIO */}
                            {reportConfig.module === 'INVENTARIO' && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nivel de Stock</label>
                                        <select
                                            value={reportConfig.stockAlert}
                                            onChange={e => setReportConfig({ ...reportConfig, stockAlert: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todo el stock</option>
                                            <option value="BAJO">Stock Bajo (Para comprar)</option>
                                            <option value="AGOTADO">Sin Stock (Agotados)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoría Insumo</label>
                                        <select
                                            value={reportConfig.productCategory}
                                            onChange={e => setReportConfig({ ...reportConfig, productCategory: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todas las categorías</option>
                                            {filterOptions.productCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* CONTROLES CLIENTES */}
                            {reportConfig.module === 'CLIENTES' && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estado de Deuda</label>
                                        <select
                                            value={reportConfig.debtStatus}
                                            onChange={e => setReportConfig({ ...reportConfig, debtStatus: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todos los clientes</option>
                                            <option value="DEUDORES">Con saldos pendientes (Deudores)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nivel de Fidelización</label>
                                        <select
                                            value={reportConfig.fidelityLevel}
                                            onChange={e => setReportConfig({ ...reportConfig, fidelityLevel: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm font-medium dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="TODOS">Todo el histórico</option>
                                            <option value="VIP">Clientes VIP (Alto consumo)</option>
                                            <option value="NUEVO">Nuevos (Últimos 30 días)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                                Se generará un reporte estructurado del módulo <strong>{reportConfig.label || reportConfig.module}</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={() => setShowReportModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors">Cerrar</button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {downloading ? (
                            <><Activity className="animate-spin" size={18} /> Generando...</>
                        ) : (
                            <><Download size={18} /> Descargar Reporte</>
                        )}
                    </button>
                </div>
            </div>
        </div>

    );
};
