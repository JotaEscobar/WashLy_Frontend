import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import POS from './pages/POS';
import Tickets from './pages/Tickets';
import Payments from './pages/Payments';
import Clients from './pages/Clients'; // <--- 1. IMPORTANTE: Importar el nuevo archivo
import Inventory from './pages/Inventory';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/pos" element={<POS />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/pagos" element={<Payments />} />
                        <Route path="/clientes" element={<Clients />} /> 
                        <Route path="/dashboard" element={<div className="text-2xl font-bold p-6">Bienvenido al Dashboard</div>} />
                        <Route path="/inventario" element={<Inventory />} />
                        <Route path="/config" element={<div className="p-6 font-bold">Configuración (Próximamente)</div>} />
                        
                        <Route path="/" element={<Navigate to="/pos" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;