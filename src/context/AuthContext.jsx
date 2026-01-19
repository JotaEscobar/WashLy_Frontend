import { createContext, useState, useContext, useEffect } from 'react';
import { loginRequest, verifyTokenRequest } from '../api/auth';
import Cookies from 'js-cookie';

const AuthContext = createContext();

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

  // Validar suscripción
  const checkExpiration = (userData) => {
    if (!userData?.empresa?.fecha_vencimiento) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiration = new Date(userData.empresa.fecha_vencimiento);
    expiration.setHours(24,0,0,0); 
    return today > expiration;
  };

  const login = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      const userData = res.data;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Guardar token en Cookies para axios
      Cookies.set("token", userData.access, { expires: 1 });
      localStorage.setItem('washly_user', JSON.stringify(userData));
      
      return { success: true, role: userData.rol };

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Error de credenciales";
      setErrors([msg]);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("washly_user");
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);
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
      user, 
      isAuthenticated, 
      loading,
      errors 
    }}>
      {children}
    </AuthContext.Provider>
  );
};