import { useState, useEffect } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle, AlertTriangle, History, X } from 'lucide-react';
import api from '../api/axiosConfig';

const Inventory = () => {
    // --- ESTADOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal Movimiento
    const [showModal, setShowModal] = useState(false);
    const [moveType, setMoveType] = useState('COMPRA'); // COMPRA | CONSUMO
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Formulario Movimiento
    const [moveData, setMoveData] = useState({
        cantidad: '', motivo: '', costo_unitario: ''
    });

    // Modal Kardex
    const [showKardex, setShowKardex] = useState(false);
    const [kardexHistory, setKardexHistory] = useState([]);

    // --- CARGA DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('inventario/productos/'),
                api.get('inventario/categorias/')
            ]);
            setProducts(prodRes.data.results || prodRes.data);
            setCategories(catRes.data.results || catRes.data);
        } catch (error) {
            console.error("Error loading inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- HANDLERS ---
    const handleOpenMove = (product, type) => {
        setSelectedProduct(product);
        setMoveType(type);
        setMoveData({ cantidad: '', motivo: '', costo_unitario: '' });
        setShowModal(true);
    };

    const handleSaveMove = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                producto: selectedProduct.id,
                tipo: moveType,
                cantidad: parseFloat(moveData.cantidad),
                motivo: moveData.motivo,
                costo_unitario: moveType === 'COMPRA' && moveData.costo_unitario ? parseFloat(moveData.costo_unitario) : null
            };
            
            await api.post('inventario/movimientos/', payload);
            setShowModal(false);
            fetchData(); // Recargar stock
        } catch (error) {
            // Ahora mostrará el mensaje de validación del serializer si falta stock
            alert("Error: " + JSON.stringify(error.response?.data));
        }
    };

    const handleOpenKardex = async (product) => {
        setSelectedProduct(product);
        try {
            const res = await api.get(`inventario/productos/${product.id}/kardex/`);
            setKardexHistory(res.data);
            setShowKardex(true);
        } catch (error) {
            console.error(error);
        }
    };

    // --- FILTRO LOCAL ---
    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase()) || 
        p.codigo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white">Inventario</h1>
                    <p className="text-gray-500">Control de compras y consumo de insumos</p>
                </div>
                
                {/* KPI Rápido */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p>
                        <p className="text-xl font-black text-green-600">
                            S/ {products.reduce((acc, curr) => acc + (curr.valor_inventario || 0), 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar insumo por nombre o código..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* TABLA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
                <div className="overflow-y-auto h-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4 text-center">Stock Actual</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (<tr><td colSpan="5" className="p-8 text-center">Cargando...</td></tr>) : 
                             filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{product.nombre}</div>
                                        <div className="text-xs text-gray-500">{product.codigo} - {product.unidad_medida}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                        {product.categoria_nombre}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-mono font-bold text-lg">{parseFloat(product.stock_actual).toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">{product.unidad_medida}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {product.estado === 'BAJO' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={12}/> BAJO</span>}
                                        {product.estado === 'AGOTADO' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">AGOTADO</span>}
                                        {product.estado === 'OK' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">OK</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenMove(product, 'COMPRA')}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                title="Registrar Compra/Entrada"
                                            >
                                                <ArrowUpCircle size={16}/> Compra
                                            </button>
                                            <button 
                                                onClick={() => handleOpenMove(product, 'CONSUMO')}
                                                className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                title="Registrar Consumo/Salida"
                                            >
                                                <ArrowDownCircle size={16}/> Consumo
                                            </button>
                                            <button 
                                                onClick={() => handleOpenKardex(product)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                title="Ver Kardex"
                                            >
                                                <History size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL MOVIMIENTO */}
            {showModal && selectedProduct && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-black flex items-center gap-2 
                                ${moveType === 'COMPRA' ? 'text-blue-600' : 'text-orange-600'}`}>
                                {moveType === 'COMPRA' ? <ArrowUpCircle/> : <ArrowDownCircle/>}
                                {moveType === 'COMPRA' ? 'Registrar Compra' : 'Registrar Consumo'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="text-gray-400"/></button>
                        </div>
                        
                        <form onSubmit={handleSaveMove} className="space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase font-bold">Producto</p>
                                <p className="font-bold text-gray-800 dark:text-white">{selectedProduct.nombre}</p>
                                <p className="text-sm text-gray-500">Stock actual: {selectedProduct.stock_actual} {selectedProduct.unidad_medida}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Cantidad ({selectedProduct.unidad_medida})</label>
                                <input 
                                    type="number" step="0.01" required autoFocus
                                    className="w-full mt-1 p-3 border rounded-xl font-bold text-lg dark:bg-gray-700 dark:border-gray-600"
                                    value={moveData.cantidad}
                                    onChange={e => setMoveData({...moveData, cantidad: e.target.value})}
                                />
                            </div>

                            {moveType === 'COMPRA' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Costo Unitario (Opcional)</label>
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full mt-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                                        placeholder={`Precio actual: ${selectedProduct.precio_compra || 0}`}
                                        value={moveData.costo_unitario}
                                        onChange={e => setMoveData({...moveData, costo_unitario: e.target.value})}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Motivo / Nota</label>
                                <input 
                                    type="text"
                                    className="w-full mt-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                                    placeholder={moveType === 'COMPRA' ? "Ej: Factura F001-230" : "Ej: Uso semanal lavadoras"}
                                    value={moveData.motivo}
                                    onChange={e => setMoveData({...moveData, motivo: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg mt-2
                                    ${moveType === 'COMPRA' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                            >
                                CONFIRMAR MOVIMIENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KARDEX */}
            {showKardex && selectedProduct && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
                    <div className="w-[500px] h-full bg-white dark:bg-gray-800 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black">Kardex</h3>
                                <p className="text-sm text-gray-500">{selectedProduct.nombre}</p>
                            </div>
                            <button onClick={() => setShowKardex(false)}><X/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {kardexHistory.length === 0 ? (
                                <p className="text-center text-gray-400 py-10">Sin movimientos registrados</p>
                            ) : kardexHistory.map(mov => (
                                <div key={mov.id} className="border-l-4 border-gray-200 pl-4 py-1 relative">
                                    <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full 
                                        ${mov.tipo === 'COMPRA' ? 'bg-blue-500' : mov.tipo === 'CONSUMO' ? 'bg-orange-500' : 'bg-gray-500'}`}
                                    />
                                    <div className="flex justify-between">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded 
                                            ${mov.tipo === 'COMPRA' ? 'bg-blue-100 text-blue-700' : 
                                              mov.tipo === 'CONSUMO' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {mov.tipo}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(mov.creado_en).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{mov.motivo || 'Sin detalle'}</p>
                                            <p className="text-xs text-gray-400">Por: {mov.usuario}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800 dark:text-white text-lg">
                                                {mov.tipo === 'CONSUMO' ? '-' : '+'}{parseFloat(mov.cantidad).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-400">Saldo: {parseFloat(mov.stock_nuevo).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;