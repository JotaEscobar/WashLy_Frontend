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

// Provider Panel
import ProviderLayout from './layouts/ProviderLayout';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderBusinesses from './pages/ProviderBusinesses';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100">Cargando...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// Componente para proteger rutas exclusivas de Super Administrador
const SuperAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100">Cargando...</div>;
    // Si no es superuser o no hay usuario, mandarlo al dashboard regular o login
    if (!user) return <Navigate to="/login" />;
    if (!user.is_superuser) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Rutas del Panel del Proveedor */}
                    <Route element={<SuperAdminRoute><ProviderLayout /></SuperAdminRoute>}>
                        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                        <Route path="/provider/empresas" element={<ProviderBusinesses />} />
                        <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
                    </Route>

                    {/* Rutas del Panel de Empresa */}
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