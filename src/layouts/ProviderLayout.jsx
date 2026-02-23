import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, CreditCard, Settings, LogOut,
    X, Menu as MenuIcon, ShieldCheck, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProviderLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            path: '/provider/dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Consola Global',
        },
        {
            path: '/provider/empresas',
            icon: <Building2 size={20} />,
            label: 'Gestión de Empresas',
        },
        {
            path: '/provider/suscripciones',
            icon: <CreditCard size={20} />,
            label: 'Pagos & Planes',
        },
        {
            path: '/provider/config',
            icon: <Settings size={20} />,
            label: 'Configuración SaaS',
        },
    ];

    return (
        <div className={`flex h-screen bg-slate-50 ${isDarkMode ? 'dark bg-slate-950 text-white' : ''}`}>
            {/* SIDEBAR PROVIDER */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col relative z-20 shadow-xl hidden md:flex`}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 w-0 overflow-hidden'}`}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            P
                        </div>
                        <div>
                            <span className="font-bold text-lg leading-none block">WashLy</span>
                            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Provider Admin</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                        {isSidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap overflow-hidden
                                ${location.pathname === item.path
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                ${!isSidebarOpen && 'justify-center'}
                            `}
                        >
                            <div className="min-w-[20px]">{item.icon}</div>
                            {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {isSidebarOpen && <span className="text-sm font-medium">Tema {isDarkMode ? 'Claro' : 'Oscuro'}</span>}
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600">
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-hidden flex flex-col">
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <h1 className="text-xl font-bold dark:text-white">Panel del Proveedor</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold">{user?.username || 'Staff'}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase">Súper Administrador</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold">
                            {(user?.username || 'S').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ProviderLayout;
