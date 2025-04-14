// src/services/axiosInstance.ts
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthToken } from '../utils/token';

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? '' : 'https://loyaleasy.com',
  headers: {
    'x-program-id': 'test',
    'x-api-key': 'test',
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor de REQUEST: Agrega el token
axiosInstance.interceptors.request.use((config) => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    const token = getAuthToken();
    if (token) {
      config.headers['x-access-token'] = token;
    }
  }
  return config;
});

// ✅ Interceptor de RESPONSE: Manejo de errores globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
      toast.error('Sesión expirada...');
      localStorage.removeItem('authData');
      window.location.href = '/login';
    } else if (status === 500) {
      toast.error('Error interno del servidor');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Ha ocurrido un error en la solicitud');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
