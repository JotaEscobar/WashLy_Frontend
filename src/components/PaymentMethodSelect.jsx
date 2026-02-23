import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function PaymentMethodSelect({ value, onChange, className }) {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                // Fetch active payment methods from the backend
                const response = await api.get('pagos/config/');
                // La API podría retornar array directo o paginado via {results: [...]}
                const data = response.data.results || response.data;
                setMethods(data);

                // Si no hay valor seleccionado y cargamos métodos, autoseleccionar el primero
                if (!value && data.length > 0) {
                    // Try to default to efectivo
                    const efectivo = data.find(m => m.codigo_metodo === 'EFECTIVO');
                    onChange(efectivo ? efectivo.id : data[0].id);
                }
            } catch (error) {
                console.error("Error cargando métodos de pago:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMethods();
    }, []);

    if (loading) {
        return (
            <select className={className} disabled>
                <option>Cargando...</option>
            </select>
        );
    }

    if (methods.length === 0) {
        return (
            <select className={className} disabled>
                <option>Sin métodos activos</option>
            </select>
        );
    }

    return (
        <select value={value} onChange={onChange} className={className}>
            <option value="" disabled>Seleccione método</option>
            {methods.map(method => (
                <option key={method.id} value={method.id}>
                    {method.nombre_mostrar}
                </option>
            ))}
        </select>
    );
}
