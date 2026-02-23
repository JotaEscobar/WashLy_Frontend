/**
 * Utilidad para refrescar el token JWT automáticamente
 * Se ejecuta cada 10 minutos (el token dura 15 minutos)
 */
import { refreshTokenRequest } from './auth';
import Cookies from 'js-cookie';

let refreshInterval = null;

export const startTokenRefresh = () => {
    // Limpiar interval anterior si existe
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Refrescar cada 10 minutos (600,000 ms)
    // El token dura 15 minutos, así que tenemos margen
    refreshInterval = setInterval(async () => {
        try {
            const token = Cookies.get('token');

            if (!token) {
                // console.log('No hay token para refrescar');
                stopTokenRefresh();
                return;
            }

            // console.log('Refrescando token JWT...');
            const response = await refreshTokenRequest();

            if (response.data.access) {
                Cookies.set('token', response.data.access, {
                    expires: 1,  // 1 día
                    sameSite: 'Lax'
                });
                // console.log('✅ Token refrescado exitosamente');
            }
        } catch (error) {
            console.error('❌ Error refrescando token:', error);

            // Si falla, detener refresh y limpiar sesión
            if (error.response?.status === 401) {
                // console.log('Token de refresh inválido, cerrando sesión...');
                stopTokenRefresh();
                Cookies.remove('token');
                localStorage.removeItem('washly_user');
                window.location.href = '/login';
            }
        }
    }, 10 * 60 * 1000); // 10 minutos

    // console.log('✅ Auto-refresh de token JWT activado');
};

export const stopTokenRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        // console.log('🛑 Auto-refresh de token JWT detenido');
    }
};
