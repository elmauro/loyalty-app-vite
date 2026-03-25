// src/services/axiosInstance.ts
import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { getAuthToken } from '../utils/token';
import { API_BASE_AUTH, API_BASE_APP, PROGRAM_ID, ADMIN_TENANT_ADMINS_PATH } from './apiConfig';

const commonHeaders = {
  'x-program-id': PROGRAM_ID,
  'Content-Type': 'application/json',
};

/** Login: mismo contrato que Postman (Content-Type + x-program-id). No enviar JWT en POST /authentications → evita preflight CORS extra. */
function isAuthenticationsRequest(config: { url?: string; baseURL?: string }) {
  const path = `${config.baseURL ?? ''}${config.url ?? ''}`;
  return (config.url ?? '').includes('authentications') || path.includes('authentications');
}

function applyInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    config.headers.set('x-program-id', PROGRAM_ID);
    if (isAuthenticationsRequest(config)) {
      config.headers.delete('x-access-token');
      return config;
    }
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
      const url = error.config?.url ?? '';
      const method = error.config?.method ?? '';
      const isTenantAdminCreate =
        url.includes(ADMIN_TENANT_ADMINS_PATH) && url.includes('/tenant-admins') && method?.toLowerCase() === 'post';

      if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
        toast.error('Sesión expirada...');
        localStorage.removeItem('authData');
        window.location.href = '/login';
      } else if (isTenantAdminCreate && (status === 500 || status === 400)) {
        toast.error('No es posible crear el usuario administrador. Verifica que el email no esté registrado o contacta al administrador.');
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
