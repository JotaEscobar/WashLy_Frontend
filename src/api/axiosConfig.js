import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    // ✅ Usar variable de entorno en lugar de URL hardcodeada
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 30000,  // ✅ Aumentado a 30s para reportes grandes
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor: Inyectar token JWT
instance.interceptors.request.use(
    (config) => {
        // TOKEN JWT
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // CONTEXTO SEDE (Leemos directo de localStorage para evitar dep circular)
        try {
            const sedeStorage = localStorage.getItem('sede-storage');
            if (sedeStorage) {
                const { state } = JSON.parse(sedeStorage);
                // Excluir rutas de auth para evitar conflictos
                const isAuthRequest = config.url?.includes('/api/token');

                if (state?.currentSede?.id && !isAuthRequest) {
                    config.headers['X-Current-Sede-ID'] = state.currentSede.id;
                    // console.log(`🔍 [AXIOS] X-Current-Sede-ID: ${state.currentSede.id}`);
                }
            }
        } catch (e) {
            console.error('Error reading sede context:', e);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                // Token inválido/expirado
                Cookies.remove('token');
                localStorage.removeItem('washly_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else if (status === 403) {
                // ✅ Verificar si es error de suscripción vencida
                const message = data.detail || data.message || '';
                if (message.toLowerCase().includes('suscripción') || message.toLowerCase().includes('vencid')) {
                    alert('⚠️ Tu suscripción ha vencido. Por favor, renueva tu servicio para continuar.');
                    // Opcional: Redirigir a página de renovación
                    // window.location.href = '/suscripcion-vencida';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;