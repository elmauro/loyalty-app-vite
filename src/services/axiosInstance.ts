// src/services/axiosInstance.ts
import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { getAuthToken } from '../utils/token';
import { API_BASE_AUTH, API_BASE_APP, PROGRAM_ID, API_KEY } from './apiConfig';

const commonHeaders = {
  'x-program-id': PROGRAM_ID,
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

function applyInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    // /api/authentications siempre debe llevar x-api-key; si no, API Gateway 403 sin CORS → "Provisional headers".
    const isAuth = config.url?.includes('/api/authentications');
    if (isAuth) {
      config.headers.set('x-api-key', API_KEY);
      config.headers.set('x-program-id', PROGRAM_ID);
      return config;
    }

    const isOtp = config.url?.includes('otp53rv1c3-1');
    if (isOtp) {
      delete config.headers['x-api-key'];
      delete config.headers['x-program-id'];
      delete config.headers['x-access-token'];
      return config;
    }
    const isIncome = config.url?.includes('income53rv1c3/income');
    if (isIncome) {
      delete config.headers['x-api-key'];
    } else {
      config.headers.set('x-api-key', API_KEY);
    }
    config.headers.set('x-program-id', PROGRAM_ID);
    const authData = localStorage.getItem('authData');
    if (authData) {
      const token = getAuthToken();
      if (token) {
        config.headers.set('x-access-token', token);
      }
    }
    return config;
  });

  instance.interceptors.response.use(
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
}

// Auth y OTP → loyaleasy.com
export const axiosAuth = axios.create({
  baseURL: API_BASE_AUTH,
  headers: commonHeaders,
});
applyInterceptors(axiosAuth);

// Transacciones e historial → dev.loyaleasy.com
export const axiosApp = axios.create({
  baseURL: API_BASE_APP,
  headers: commonHeaders,
});
applyInterceptors(axiosApp);

// Por compatibilidad: export por defecto = instancia de app (transacciones)
export default axiosApp;
