import { createContext, useState, useContext, useEffect } from 'react';
import { loginRequest, verifyTokenRequest } from '../api/auth'; // Asume existencia
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
  const [isExpired, setIsExpired] = useState(false); // Nuevo estado
  const [loading, setLoading] = useState(true);

  // Función auxiliar para chequear vencimiento
  const checkExpiration = (userData) => {
    if (!userData?.empresa?.fecha_vencimiento) return false;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Parseo simple asumiendo formato YYYY-MM-DD del backend
    const expiration = new Date(userData.empresa.fecha_vencimiento);
    // Ajuste de zona horaria simple si es necesario, o usar librería como dayjs/date-fns
    // Para este ejemplo, comparación directa UTC/Local
    expiration.setHours(24,0,0,0); // Fin del día de vencimiento

    return today > expiration;
  };

  const signin = async (userCredentials) => {
    try {
      const res = await loginRequest(userCredentials);
      setUser(res.data);
      setIsAuthenticated(true);
      setIsExpired(checkExpiration(res.data)); // Calcular al login
    } catch (error) {
      console.error(error);
      // Manejo de errores
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setIsAuthenticated(false);
    setIsExpired(false);
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
        const res = await verifyTokenRequest(token);
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        setUser(res.data);
        setIsAuthenticated(true);
        setIsExpired(checkExpiration(res.data)); // Calcular al verificar token
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      signin, 
      logout, 
      user, 
      isAuthenticated, 
      isExpired, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};