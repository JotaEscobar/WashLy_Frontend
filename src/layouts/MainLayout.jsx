import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Moon, Sun, Home, Package, Users, Settings, LogOut, X } from 'lucide-react';

const MainLayout = () => {
    // Estado para la barra lateral (Abierta/Cerrada)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Estado para Modo Oscuro
    const [darkMode, setDarkMode] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleTheme = () => {
        setDarkMode(!darkMode);
        // Tailwind usa la clase 'dark' en el elemento html o body
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`flex h-screen bg-gray-100 ${darkMode ? 'dark' : ''}`}>
            
            {/* --- SIDEBAR --- */}
            <aside 
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20`}
            >
                {/* Logo & Toggle */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    {sidebarOpen && <span className="text-xl font-black text-blue-600 tracking-tighter">WASHLY</span>}
                    <button onClick={toggleSidebar} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                        {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
                </div>

                {/* Menú de Navegación (Ejemplo) */}
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<Home size={20}/>} label="POS / Venta" isOpen={sidebarOpen} active />
                    <NavItem icon={<Package size={20}/>} label="Tickets" isOpen={sidebarOpen} />
                    <NavItem icon={<Users size={20}/>} label="Clientes" isOpen={sidebarOpen} />
                    <NavItem icon={<Settings size={20}/>} label="Configuración" isOpen={sidebarOpen} />
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    {/* Botón Dark Mode */}
                    <button 
                        onClick={toggleTheme}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${sidebarOpen ? 'justify-start' : 'justify-center'} hover:bg-gray-50 text-gray-600`}
                    >
                        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                        {sidebarOpen && <span className="font-medium text-sm">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
                    </button>

                    <button className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
                        <LogOut size={20}/>
                        {sidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 overflow-hidden relative">
                {/* Aquí se renderiza el POS u otras páginas */}
                <Outlet />
            </main>
        </div>
    );
};

// Componente auxiliar para items del menú
const NavItem = ({ icon, label, isOpen, active }) => (
    <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'} ${isOpen ? 'justify-start' : 'justify-center'}`}>
        {icon}
        {isOpen && <span className="font-medium text-sm">{label}</span>}
    </button>
);

export default MainLayout;