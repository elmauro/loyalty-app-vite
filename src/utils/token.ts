// utils/token.ts
import { ROLE_ADMIN } from '../constants/auth';

export function getAuthToken(): string | null {
  const authData = localStorage.getItem('authData');
  return authData ? JSON.parse(authData)?.token : null;
}

/** Objeto tenant del JWT (payload.sub.id.tenants[n]). */
export interface JwtTenant {
  tenantCode?: string;
  name?: string;
  [key: string]: unknown;
}

/** Decodifica el payload del JWT (sin verificar firma). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Devuelve el primer tenant del JWT para usuarios admin.
 * Estructura en JWT: payload.sub.id.tenants[0]
 * - Admin: objeto tenant completo (tenantCode, etc.).
 * - No admin: undefined (permite consultar transacciones de todos los tenants).
 */
export function getTenantForRequest(): JwtTenant | undefined {
  const authData = localStorage.getItem('authData');
  if (!authData) return undefined;
  const data = JSON.parse(authData) as Record<string, unknown>;
  const roles = data?.roles as string[] | undefined;
  const token = data?.token as string | undefined;
  if (!token) return undefined;

  const payload = decodeJwtPayload(token);
  const sub = payload?.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  const tenants = id?.tenants as JwtTenant[] | undefined;
  const tenant = tenants?.[0];

  const isAdmin = roles?.includes(ROLE_ADMIN);
  if (isAdmin && tenant && typeof tenant === 'object') {
    return tenant;
  }
  return undefined;
}

/** Devuelve el tenantCode para el header x-tenant-code. */
export function getTenantCodeForRequest(): string {
  return getTenantForRequest()?.tenantCode ?? '';
}
  