import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Home, Package, Users, Settings, LogOut, X, LayoutDashboard, CreditCard, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Roles
const ROLES = { ADMIN: 'ADMIN', CAJERO: 'CAJERO', OPERARIO: 'OPERARIO' };

const MainLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    // Inicializar estado leyendo localStorage (Tu lógica original)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const userRole = user?.rol || 'OPERARIO';

    // Efecto para aplicar el tema
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Matriz de Menú (Usando TUS iconos exactos)
    const menuItems = [
        { 
            path: '/dashboard', 
            icon: <LayoutDashboard size={20} />, 
            label: 'Dashboard', 
            roles: [ROLES.ADMIN] 
        },
        { 
            path: '/pos', 
            icon: <Home size={20} />, // Tu icono original era Home
            label: 'Punto de Venta', 
            roles: [ROLES.ADMIN, ROLES.CAJERO] 
        },
        { 
            path: '/tickets', 
            icon: <Box size={20} />, // Tu icono original era Box
            label: 'Tickets', 
            roles: [ROLES.ADMIN, ROLES.CAJERO, ROLES.OPERARIO] 
        },
        { 
            path: '/clientes', 
            icon: <Users size={20} />, 
            label: 'Clientes', 
            roles: [ROLES.ADMIN, ROLES.CAJERO] 
        },
        { 
            path: '/inventario', 
            icon: <Package size={20} />, 
            label: 'Inventario', 
            roles: [ROLES.ADMIN] 
        },
        { 
            path: '/pagos', 
            icon: <CreditCard size={20} />, 
            label: 'Pagos', 
            roles: [ROLES.ADMIN, ROLES.CAJERO] 
        },
        { 
            path: '/config', 
            icon: <Settings size={20} />, 
            label: 'Configuración', 
            roles: [ROLES.ADMIN] 
        },
    ];

    // Filtramos el menú según el rol
    const allowedMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <div className={`flex h-screen bg-gray-100 ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
            
            {/* SIDEBAR */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col relative z-20 shadow-xl`}>
                
                {/* Header Sidebar */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 w-0 overflow-hidden'}`}>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">WashLy</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {allowedMenuItems.map((item) => (
                        <NavItem 
                            key={item.path}
                            icon={item.icon} 
                            label={item.label} 
                            isOpen={isSidebarOpen}
                            active={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <button 
                        onClick={toggleTheme}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {isSidebarOpen && <span className="font-medium text-sm">Tema {isDarkMode ? 'Claro' : 'Oscuro'}</span>}
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20}/>
                        {isSidebarOpen && <span className="font-medium text-sm">Salir</span>}
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-hidden relative flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex-1 overflow-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// Componente NavItem (Tu código original exacto)
const NavItem = ({ icon, label, isOpen, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap overflow-hidden
        ${active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
        ${!isOpen && 'justify-center px-0'}
    `}>
        <div className="min-w-[20px]">{icon}</div>
        <span className={`text-sm font-medium transition-opacity duration-200 ${!isOpen && 'opacity-0 hidden'}`}>
            {label}
        </span>
    </button>
);

export default MainLayout;