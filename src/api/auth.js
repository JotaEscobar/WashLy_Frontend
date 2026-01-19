import axios from './axiosConfig';

export const loginRequest = async (user) => {
  // Envía POST a http://127.0.0.1:8000/api/token/
  return await axios.post('/api/token/', user);
};

export const verifyTokenRequest = async (token) => {
  // Verifica si el token es válido
  return await axios.post('/api/token/verify/', { token });
};

export const refreshTokenRequest = async (refresh) => {
    // Para renovar el token si caduca
    return await axios.post('/api/token/refresh/', { refresh });
};