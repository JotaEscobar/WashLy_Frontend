import React from 'react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Términos del Servicio</h1>
                <p className="text-sm text-gray-500 mb-8">Última actualización: 26 de marzo de 2026</p>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-600 font-sans">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">1. Descripción del Servicio</h2>
                        <p>
                            Washly es una plataforma ERP diseñada para la gestión de lavanderías y tintorerías. El servicio incluye la emisión de tickets, control de inventario y notificaciones automáticas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">2. Responsabilidad sobre las Prendas</h2>
                        <p>
                            Cada sede de lavandería es responsable del cuidado de las prendas recibidas. Washly, como proveedor de software, no asume responsabilidad directa sobre daños físicos, pérdida o demora en la entrega de las prendas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">3. Uso de la Cuenta</h2>
                        <p>
                            Cada usuario es responsable de mantener la confidencialidad de sus credenciales. Notifique de inmediato si sospecha de un acceso no autorizado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">4. Pagos y Reembolsos</h2>
                        <p>
                            Cualquier disputa sobre el cobro del servicio de lavandería debe resolverse directamente con la sede encargada del servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">5. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de actualizar estos términos en cualquier momento. El uso continuo de la plataforma después de un cambio implica su aceptación.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
