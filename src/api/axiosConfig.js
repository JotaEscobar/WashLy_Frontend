import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    // La URL base apunta al servidor Django (puerto 8000)
    baseURL: 'http://127.0.0.1:8000', 
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor: Inyectar token JWT
instance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            // JWT requiere el prefijo 'Bearer'
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Si el token expira, limpiamos y redirigimos
            Cookies.remove('token');
            localStorage.removeItem('washly_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;