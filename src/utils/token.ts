// utils/token.ts
import { ROLE_ADMIN } from '../constants/auth';

export function getAuthToken(): string | null {
  const authData = localStorage.getItem('authData');
  return authData ? JSON.parse(authData)?.token : null;
}

/** Objeto tenant del JWT (payload.tenants[n] o payload.sub.id.tenants[n]). */
export interface JwtTenant {
  tenantCode?: string;
  tenantId?: string;
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
 * Obtiene el array de tenants del payload JWT.
 * Soporta formato nuevo (Cognito-like) y antiguo:
 * - Nuevo: payload.tenants[]
 * - Antiguo: payload.sub.id.tenants[]
 */
function getTenantsFromPayload(payload: Record<string, unknown> | null): JwtTenant[] | undefined {
  if (!payload) return undefined;
  const atRoot = payload.tenants as JwtTenant[] | undefined;
  if (Array.isArray(atRoot) && atRoot.length > 0) return atRoot;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  const fromSub = id?.tenants as JwtTenant[] | undefined;
  return Array.isArray(fromSub) ? fromSub : undefined;
}

/**
 * Devuelve el primer tenant del JWT para usuarios admin.
 * Soporta JWT nuevo (payload.tenants) y antiguo (payload.sub.id.tenants).
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
  const tenants = getTenantsFromPayload(payload);
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

/** Obtiene el email del usuario desde authData/JWT (para Cognito changePassword). */
export function getEmailFromAuth(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const email = payload.email as string | undefined;
  if (email) return email;
  const sub = payload.sub;
  if (typeof sub === 'string' && sub.includes('@')) return sub;
  const subObj = sub as Record<string, unknown> | undefined;
  const id = subObj?.id as Record<string, unknown> | undefined;
  return (id?.email as string) ?? null;
}
  