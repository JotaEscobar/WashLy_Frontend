import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Rutas perezosas (Lazy load)
const Login = lazy(() => import('./pages/Login'));
const POS = lazy(() => import('./pages/POS'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Payments = lazy(() => import('./pages/Payments'));
const Clients = lazy(() => import('./pages/Clients'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Config = lazy(() => import('./pages/Config'));



const Loader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg" />
            <p className="mt-4 text-sm font-medium text-gray-500">Cargando aplicación...</p>
        </div>
    </div>
);

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loader />;
    if (!user) return <Navigate to="/login" />;
    return children;
};



function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />



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
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;