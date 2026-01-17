import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import POS from './pages/POS';
import Tickets from './pages/Tickets';
import Payments from './pages/Payments';
import Clients from './pages/Clients'; 
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard'; 
import Config from './pages/Config.jsx';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100">Cargando...</div>;
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
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/pagos" element={<Payments />} />
                        <Route path="/clientes" element={<Clients />} /> 
                        <Route path="/inventario" element={<Inventory />} />
                        <Route path="/config" element={<Config />} />
                        
                        {/* Redirección por defecto al Dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;