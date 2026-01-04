import { useState } from 'react';
import { Search, Plus, Trash2, CreditCard, UserPlus, Grid } from 'lucide-react';

// Datos Mock (Placeholder hasta conectar API)
const CATEGORIES = [
    { id: 1, name: 'Lavado' },
    { id: 2, name: 'Secado' },
    { id: 3, name: 'Planchado' },
    { id: 4, name: 'Edredones' },
];

const SERVICES = [
    { id: 1, name: 'Lavado Básico (Kg)', price: 5.00, category: 1, unit: 'kg' },
    { id: 2, name: 'Edredón 2 Plz', price: 25.00, category: 4, unit: 'unid' },
    { id: 3, name: 'Planchado Camisa', price: 3.50, category: 3, unit: 'unid' },
    { id: 4, name: 'Terno Completo', price: 15.00, category: 3, unit: 'unid' },
    { id: 5, name: 'Secado Express', price: 4.00, category: 2, unit: 'kg' },
];

const POS = () => {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const addToCart = (service) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === service.id);
            if (exists) {
                return prev.map(item => 
                    item.id === service.id 
                    ? { ...item, qty: item.qty + 1 } 
                    : item
                );
            }
            return [...prev, { ...service, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const filteredServices = SERVICES.filter(s => 
        s.category === selectedCategory && 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6">
            {/* IZQUIERDA: Catálogo (65%) */}
            <div className="w-[65%] flex flex-col gap-6">
                
                {/* Header: Buscador de Clientes y Servicios */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente (DNI, Nombre)..." 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <button className="bg-primary-50 text-primary-600 px-4 rounded-xl flex items-center gap-2 font-medium hover:bg-primary-100 transition-colors">
                        <UserPlus size={20} />
                        Nuevo
                    </button>
                </div>

                {/* Categorías */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                                selectedCategory === cat.id 
                                ? 'bg-primary-900 text-white shadow-md' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid de Servicios */}
                <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 content-start flex-1">
                    {filteredServices.map(service => (
                        <button
                            key={service.id}
                            onClick={() => addToCart(service)}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex flex-col items-start gap-2 group h-32 justify-between"
                        >
                            <span className="font-semibold text-gray-800 text-left group-hover:text-primary-600 leading-tight">
                                {service.name}
                            </span>
                            <div className="w-full flex justify-between items-end">
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{service.unit}</span>
                                <span className="font-bold text-lg text-primary-900">S/ {service.price.toFixed(2)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* DERECHA: Ticket (35%) */}
            <div className="w-[35%] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Grid size={18} className="text-primary-500" />
                        Ticket Actual
                    </h3>
                    <span className="text-xs font-mono text-gray-400">#NEW-TICKET</span>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <p>Agrega servicios al ticket</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <button 
                                        onClick={() => updateQty(item.id, -1)}
                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white rounded"
                                    >-</button>
                                    <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                                    <button 
                                        onClick={() => updateQty(item.id, 1)}
                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white rounded"
                                    >+</button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">S/ {item.price.toFixed(2)} x {item.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">S/ {(item.price * item.qty).toFixed(2)}</p>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-xs text-red-400 hover:text-red-600 underline"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Totales */}
                <div className="p-6 bg-surface-50 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-gray-500">Total a Pagar</span>
                        <span className="text-3xl font-bold text-gray-900">S/ {total.toFixed(2)}</span>
                    </div>

                    <button className="w-full bg-action-500 hover:bg-action-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-action-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <CreditCard size={24} />
                        COBRAR TICKET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;