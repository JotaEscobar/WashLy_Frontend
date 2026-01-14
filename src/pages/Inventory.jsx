import { useState, useEffect } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle, AlertTriangle, History, X, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../api/axiosConfig';

const Inventory = () => {
    // --- ESTADOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal Movimiento (Entrada/Salida)
    const [showModal, setShowModal] = useState(false);
    const [moveType, setMoveType] = useState('COMPRA'); // COMPRA | CONSUMO
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [moveData, setMoveData] = useState({
        cantidad: '', motivo: '', costo_unitario: ''
    });

    // Modal Kardex
    const [showKardex, setShowKardex] = useState(false);
    const [kardexHistory, setKardexHistory] = useState([]);

    // Modal Producto (Crear/Editar)
    const [showProductModal, setShowProductModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [productForm, setProductForm] = useState({
        id: null,
        nombre: '',
        codigo: '',
        categoria: '',
        unidad_medida: 'UND',
        stock_minimo: '5',
        precio_compra: '' // Opcional según tu requerimiento
    });

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

    // --- HANDLERS MOVIMIENTOS ---
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

    // --- HANDLERS CRUD PRODUCTOS ---
    const handleOpenProductModal = (product = null) => {
        if (product) {
            setIsEditing(true);
            setProductForm({
                id: product.id,
                nombre: product.nombre,
                codigo: product.codigo,
                categoria: product.categoria,
                unidad_medida: product.unidad_medida,
                stock_minimo: product.stock_minimo,
                precio_compra: product.precio_compra || ''
            });
        } else {
            setIsEditing(false);
            setProductForm({
                id: null,
                nombre: '',
                codigo: '',
                categoria: categories[0]?.id || '',
                unidad_medida: 'UND',
                stock_minimo: '5',
                precio_compra: ''
            });
        }
        setShowProductModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`inventario/productos/${productForm.id}/`, productForm);
            } else {
                await api.post('inventario/productos/', productForm);
            }
            setShowProductModal(false);
            fetchData();
        } catch (error) {
            alert("Error al guardar producto: " + JSON.stringify(error.response?.data));
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este insumo?")) return;
        try {
            await api.delete(`inventario/productos/${id}/`);
            fetchData();
        } catch (error) {
            alert("No se puede eliminar (posiblemente tenga historial).");
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
                    <p className="text-gray-500">Gestión de insumos y consumibles</p>
                </div>
                
                <button 
                    onClick={() => handleOpenProductModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                    <Plus size={20}/> Nuevo Insumo
                </button>
            </div>

            {/* BUSCADOR */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar insumo por nombre o código..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
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
                                <th className="p-4 text-center">Movimientos</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (<tr><td colSpan="6" className="p-8 text-center">Cargando...</td></tr>) : 
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
                                        <span className="font-mono font-bold text-lg dark:text-white">{parseFloat(product.stock_actual).toFixed(2)}</span>
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
                                                title="Entrada"
                                            >
                                                <ArrowUpCircle size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleOpenMove(product, 'CONSUMO')}
                                                className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                title="Salida"
                                            >
                                                <ArrowDownCircle size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleOpenKardex(product)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                title="Historial"
                                            >
                                                <History size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenProductModal(product)} className="text-gray-400 hover:text-blue-500 p-1"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL MOVIMIENTO (Entrada/Salida) */}
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
                                    className="w-full mt-1 p-3 border rounded-xl font-bold text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={moveData.cantidad}
                                    onChange={e => setMoveData({...moveData, cantidad: e.target.value})}
                                />
                            </div>

                            {moveType === 'COMPRA' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Costo Unitario (Opcional)</label>
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full mt-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder={`Ref: ${selectedProduct.precio_compra || 0}`}
                                        value={moveData.costo_unitario}
                                        onChange={e => setMoveData({...moveData, costo_unitario: e.target.value})}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Motivo / Nota</label>
                                <input 
                                    type="text"
                                    className="w-full mt-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                CONFIRMAR
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PRODUCTO (Crear/Editar) */}
            {showProductModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white">
                                {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)}><X className="text-gray-400"/></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                                <input required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.nombre} onChange={e => setProductForm({...productForm, nombre: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Código</label>
                                    <input required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.codigo} onChange={e => setProductForm({...productForm, codigo: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Unidad Medida</label>
                                    <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.unidad_medida} onChange={e => setProductForm({...productForm, unidad_medida: e.target.value})}>
                                        <option value="UND">UND</option>
                                        <option value="KG">KG</option>
                                        <option value="LT">LT</option>
                                        <option value="GL">GL</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.categoria} onChange={e => setProductForm({...productForm, categoria: e.target.value})}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Mínimo</label>
                                    <input type="number" step="0.01" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.stock_minimo} onChange={e => setProductForm({...productForm, stock_minimo: e.target.value})}/>
                                </div>
                                <div>
                                    {/* Precio opcional pero útil para referencia */}
                                    <label className="text-xs font-bold text-gray-500 uppercase">Ref. Precio</label>
                                    <input type="number" step="0.01" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={productForm.precio_compra} onChange={e => setProductForm({...productForm, precio_compra: e.target.value})}/>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">GUARDAR</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KARDEX (Existente) */}
            {showKardex && selectedProduct && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
                    <div className="w-[500px] h-full bg-white dark:bg-gray-800 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white">Kardex</h3>
                                <p className="text-sm text-gray-500">{selectedProduct.nombre}</p>
                            </div>
                            <button onClick={() => setShowKardex(false)}><X className="text-gray-400"/></button>
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