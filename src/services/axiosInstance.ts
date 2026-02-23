// src/services/axiosInstance.ts
import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { getAuthToken } from '../utils/token';
import {
  API_BASE_AUTH,
  API_BASE_APP,
  PROGRAM_ID,
  API_KEY,
  RULES_GET_API_PATH,
  RULES_UPDATE_API_PATH,
  TENANTS_GET_PATH,
  TENANTS_POST_PATH,
  TENANTS_PUT_PATH,
  ADMIN_PROGRAM_PATH,
  ADMIN_PROGRAM_PUT_PATH,
  ADMIN_PROGRAM_TRANSACTION_TYPES_PATH,
} from './apiConfig';

const tenantAdminPaths = [
  TENANTS_GET_PATH,
  TENANTS_POST_PATH,
  TENANTS_PUT_PATH,
  ADMIN_PROGRAM_PATH,
  ADMIN_PROGRAM_PUT_PATH,
  ADMIN_PROGRAM_TRANSACTION_TYPES_PATH,
];

function isTenantOrAdminApi(url?: string): boolean {
  if (!url) return false;
  return tenantAdminPaths.some((p) => url.includes(`/${p}/`));
}

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

    const isIncome = config.url?.includes('income53rv1c3/income');
    const isRules =
      config.url?.includes(`${RULES_GET_API_PATH}/engines`) ||
      config.url?.includes(`${RULES_UPDATE_API_PATH}/engines`);
    const isTenantOrAdmin = isTenantOrAdminApi(config.url);
    if (isIncome || isRules || isTenantOrAdmin) {
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
