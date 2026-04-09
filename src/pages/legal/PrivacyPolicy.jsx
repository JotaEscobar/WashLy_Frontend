import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
                <p className="text-sm text-gray-500 mb-8">Última actualización: 26 de marzo de 2026</p>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">1. Introducción</h2>
                        <p>
                            En Washly, valoramos su privacidad. Esta política describe cómo recolectamos, usamos y protegemos sus datos personales conforme a la <b>Ley N° 29733 (Ley de Protección de Datos Personales de Perú)</b>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">2. Información que Recolectamos</h2>
                        <p>Para la prestación del servicio de lavandería, recolectamos:</p>
                        <ul className="list-disc pl-5 mt-2">
                            <li>Nombres y apellidos.</li>
                            <li>Número de teléfono/WhatsApp (para notificaciones de orden).</li>
                            <li>Correo electrónico (para envío de tickets digitales).</li>
                            <li>Dirección (en caso de servicio a domicilio).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">3. Finalidad del Tratamiento</h2>
                        <p>Sus datos se utilizan exclusivamente para:</p>
                        <ul className="list-disc pl-5 mt-2">
                            <li>Gestionar sus órdenes de servicio.</li>
                            <li>Notificarle cuando sus prendas estén listas.</li>
                            <li>Cumplir con obligaciones tributarias y legales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">4. Derechos ARCO</h2>
                        <p>
                            Usted tiene derecho a <b>Acceder, Rectificar, Cancelar u Oponerse</b> al tratamiento de sus datos. Para ejercer estos derechos, puede enviarnos un correo electrónico a la dirección de contacto de la sede donde se atendió.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">5. Seguridad</h2>
                        <p>
                            Implementamos medidas técnicas y organizativas para evitar la pérdida o el acceso no autorizado a su información, utilizando servidores seguros y cifrado de datos.
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

export default PrivacyPolicy;
