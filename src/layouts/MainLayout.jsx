import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Moon, Sun, Home, Package, Users, Settings, LogOut, X, LayoutDashboard, CreditCard, Box } from 'lucide-react';

const MainLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`flex h-screen bg-gray-100 ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
            
            {/* SIDEBAR */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col relative z-20 shadow-xl`}>
                
                {/* Header con Menú/X */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
                    {isSidebarOpen && (
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter animate-in fade-in">
                            WASHLY
                        </span>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors ${!isSidebarOpen && 'mx-auto'}`}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                    <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" isOpen={isSidebarOpen} active={location.pathname === '/'} onClick={() => navigate('/')}/>
                    <NavItem icon={<Home size={20}/>} label="Punto de Venta" isOpen={isSidebarOpen} active={location.pathname === '/pos'} onClick={() => navigate('/pos')}/>
                    <NavItem icon={<Package size={20}/>} label="Tickets" isOpen={isSidebarOpen} active={location.pathname === '/tickets'} onClick={() => navigate('/tickets')}/>
                    <NavItem icon={<CreditCard size={20}/>} label="Pagos" isOpen={isSidebarOpen} active={location.pathname === '/pagos'} onClick={() => navigate('/pagos')}/>
                    <NavItem icon={<Box size={20}/>} label="Inventario" isOpen={isSidebarOpen} active={location.pathname === '/inventario'} onClick={() => navigate('/inventario')}/>
                    <NavItem icon={<Users size={20}/>} label="Clientes" isOpen={isSidebarOpen} active={location.pathname === '/clientes'} onClick={() => navigate('/clientes')}/>
                    <NavItem icon={<Settings size={20}/>} label="Configuración" isOpen={isSidebarOpen} active={location.pathname === '/config'} onClick={() => navigate('/config')}/>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <button onClick={toggleTheme} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${!isSidebarOpen && 'justify-center'}`}>
                        {isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20}/>}
                        {isSidebarOpen && <span className="font-medium text-sm">Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>}
                    </button>
                    <button className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut size={20}/>
                        {isSidebarOpen && <span className="font-medium text-sm">Salir</span>}
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-hidden relative flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, isOpen, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap overflow-hidden
        ${active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
        ${!isOpen && 'justify-center px-0'}
    `}>
        <div className="min-w-[20px]">{icon}</div>
        <span className={`text-sm font-medium transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {label}
        </span>
    </button>
);

export default MainLayout;