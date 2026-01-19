import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS, getLandingPage, COMMON_ROUTES } from '../../utils/permissions';

const RequireAuth = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading, isExpired } = useAuth();
  const location = useLocation();

  if (loading) return <h1>Cargando...</h1>;

  // 1. Check Auth Básica
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Vencimiento (Kill-Switch Frontend)
  // Si está expirado y NO está yendo a la página de expirado o pagos, bloquear.
  if (isExpired && location.pathname !== '/expired' && !location.pathname.includes('/payments')) {
    return <Navigate to="/expired" replace />;
  }

  // 3. Check Permisos de Rol
  // Si allowedRoles es vacío, asumimos ruta protegida genérica (solo auth)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.rol; // Ajustar según estructura de tu objeto user (ej: user.perfil.rol)
    
    if (!allowedRoles.includes(userRole)) {
      // Usuario intenta entrar donde no debe -> Mandar a su Landing Page
      const correctLanding = getLandingPage(userRole);
      return <Navigate to={correctLanding} replace />;
    }
  }

  return <Outlet />;
};

export default RequireAuth;