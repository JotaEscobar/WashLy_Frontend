import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión al recargar
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedRole = localStorage.getItem('user_role'); // Guardamos el rol localmente por simplicidad
            
            if (token && savedRole) {
                setUser({ role: savedRole, token });
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            // 1. Obtener Token
            const response = await api.post('auth/login/', { username, password });
            const { token } = response.data;
            
            // 2. Guardar Token
            localStorage.setItem('token', token);
            
            // 3. Simular lógica de rol (En producción, deberíamos hacer un fetch a /users/me/)
            // Por ahora, si es 'admin' asignamos rol admin, si no, cajero.
            const role = username === 'admin' ? 'admin' : 'cajero'; 
            localStorage.setItem('user_role', role);
            
            setUser({ token, role });
            return { success: true, role };
        } catch (error) {
            console.error("Login error", error);
            return { success: false, error: 'Credenciales inválidas' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);