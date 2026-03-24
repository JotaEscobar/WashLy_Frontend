import { createContext, useState, useContext, useEffect } from 'react';
import { loginRequest, verifyTokenRequest } from '../api/auth';
import Cookies from 'js-cookie';
import { startTokenRefresh, stopTokenRefresh } from '../api/tokenRefresh';

const AuthContext = createContext();

// Opciones seguras para cookies
const isProduction = window.location.protocol === 'https:';
const COOKIE_OPTIONS = {
  expires: 1,         // 1 día (el refresh se encarga de renovar el access)
  sameSite: 'Lax',    // Protección CSRF
  secure: isProduction // Solo HTTPS en producción
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);



  const login = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      const userData = res.data;

      setUser(userData);
      setIsAuthenticated(true);

      // Guardar token en Cookie con opciones seguras
      Cookies.set("token", userData.access, COOKIE_OPTIONS);
      localStorage.setItem('washly_user', JSON.stringify(userData));

      // ✅ Iniciar auto-refresh de tokens
      startTokenRefresh();

      return { success: true, role: userData.rol };

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Error de credenciales";
      setErrors([msg]);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    // ✅ Detener auto-refresh
    stopTokenRefresh();

    Cookies.remove("token");
    localStorage.removeItem("washly_user");
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('washly_user', JSON.stringify(newUserData));
  };

  useEffect(() => {
    async function checkLogin() {
      const token = Cookies.get("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        await verifyTokenRequest(token);
        const storedUser = localStorage.getItem('washly_user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        Cookies.remove("token");
        localStorage.removeItem("washly_user");
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{
      login,
      logout,
      updateUser,
      user,
      isAuthenticated,
      loading,
      errors
    }}>
      {children}
    </AuthContext.Provider>
  );
};