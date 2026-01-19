import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, ROLES } from '../utils/permissions';

// Iconos (Asumiendo Lucide o similar)
import { LayoutDashboard, ShoppingCart, Ticket, Users, Package, CreditCard, Settings, LogOut } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.rol || 'OPERARIO'; // Fallback seguro

  // Definición de ítems del menú
  const MENU_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard />, roles: [ROLES.ADMIN] },
    { label: 'Punto de Venta', path: '/pos', icon: <ShoppingCart />, roles: [ROLES.ADMIN, ROLES.CAJERO] },
    { label: 'Tickets', path: '/tickets', icon: <Ticket />, roles: [ROLES.ADMIN, ROLES.CAJERO, ROLES.OPERARIO] },
    { label: 'Clientes', path: '/clients', icon: <Users />, roles: [ROLES.ADMIN, ROLES.CAJERO] },
    { label: 'Inventario', path: '/inventory', icon: <Package />, roles: [ROLES.ADMIN] },
    { label: 'Pagos y Suscripción', path: '/payments', icon: <CreditCard />, roles: [ROLES.ADMIN, ROLES.CAJERO] },
    { label: 'Configuración', path: '/config', icon: <Settings />, roles: [ROLES.ADMIN] },
  ];

  // Filtrado de menú según Matriz de Permisos y Rol actual
  const allowedMenuItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">WASHLY</h1>
          <p className="text-xs text-gray-500 mt-1">
            {user?.empresa?.nombre} <br/>
            <span className="font-semibold text-gray-700">{userRole}</span>
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {allowedMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;