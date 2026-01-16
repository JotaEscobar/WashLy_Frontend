import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función auxiliar para cargar perfil completo
    const loadUserProfile = async (token) => {
        try {
            // Configuramos el token para estas peticiones
            api.defaults.headers.common['Authorization'] = `Token ${token}`;
            
            // 1. Obtener datos de la empresa (Tenant)
            const empresaRes = await api.get('core/empresa/');
            const empresaData = empresaRes.data.results ? empresaRes.data.results[0] : null;

            // 2. Obtener sedes permitidas
            const sedesRes = await api.get('core/sedes/');
            
            return {
                token,
                role: localStorage.getItem('user_role') || 'admin', // Fallback temporal
                empresa: empresaData,
                sedes: sedesRes.data.results || [],
                // Si el usuario ya seleccionó una sede, la mantenemos, si no, la primera
                sedeActual: sedesRes.data.results?.[0] || null 
            };
        } catch (error) {
            console.error("Error cargando perfil SaaS", error);
            return null;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await loadUserProfile(token);
                if (userData) {
                    setUser(userData);
                } else {
                    // Si falla cargar perfil (ej. token expirado), logout
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('auth/login/', { username, password });
            const { token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user_role', 'admin'); // Simulación temporal de rol
            
            const userData = await loadUserProfile(token);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error("Login error", error);
            return { success: false, error: 'Credenciales inválidas' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const setSedeActual = (sede) => {
        setUser(prev => ({ ...prev, sedeActual: sede }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setSedeActual }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);