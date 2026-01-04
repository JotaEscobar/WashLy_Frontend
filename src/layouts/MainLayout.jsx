import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, LogOut, Package, Users, Settings } from 'lucide-react';

const MainLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin'] },
        { icon: ShoppingCart, label: 'Punto de Venta', path: '/pos', roles: ['admin', 'cajero'] },
        { icon: Package, label: 'Tickets', path: '/tickets', roles: ['admin', 'cajero'] },
        { icon: Users, label: 'Clientes', path: '/clientes', roles: ['admin', 'cajero'] },
        { icon: Settings, label: 'Configuración', path: '/settings', roles: ['admin'] },
    ];

    return (
        <div className="flex h-screen bg-surface-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed h-full z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">WashLy</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                         (item.roles.includes(user?.role)) && (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    location.pathname === item.path
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <Users size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate uppercase">{user?.role}</p>
                            <p className="text-xs text-gray-500 truncate">En línea</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;