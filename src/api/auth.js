import axios from './axiosConfig';

export const loginRequest = async (user) => {
  // Envía POST a /api/token/ (Endpoint estándar de JWT en Django)
  return await axios.post('/api/token/', user);
};

export const verifyTokenRequest = async (token) => {
  // Verifica si el token es válido enviando POST a /api/token/verify/
  return await axios.post('/api/token/verify/', { token });
};

export const refreshTokenRequest = async (refresh) => {
    // Para renovar el token si caduca (Opcional por ahora)
    return await axios.post('/api/token/refresh/', { refresh });
};