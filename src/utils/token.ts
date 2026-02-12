// utils/token.ts
import { ROLE_ADMIN } from '../constants/auth';
import type { AuthUser, AuthTenant } from '../types/Auth';

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
export function getTenantsFromPayload(payload: Record<string, unknown> | null): JwtTenant[] | undefined {
  if (!payload) return undefined;
  const atRoot = payload.tenants as JwtTenant[] | undefined;
  if (Array.isArray(atRoot)) return atRoot;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  const fromSub = id?.tenants as JwtTenant[] | undefined;
  return Array.isArray(fromSub) ? fromSub : undefined;
}

/** Roles desde custom:roles (string "1,2"), payload.roles o sub.id.roles (array). */
export function getRolesFromPayload(payload: Record<string, unknown> | null): string[] {
  if (!payload) return [];
  const customRoles = payload['custom:roles'] as string | undefined;
  if (typeof customRoles === 'string') {
    return customRoles.split(',').filter(Boolean);
  }
  const atRoot = payload.roles as string[] | undefined;
  if (Array.isArray(atRoot)) return atRoot;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  const arr = id?.roles as string[] | undefined;
  return Array.isArray(arr) ? arr : [];
}

/** Identificación desde custom:docNumber o sub.id.identification. */
export function getIdentificationFromPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return '';
  const doc = payload['custom:docNumber'] as string | undefined;
  if (typeof doc === 'string') return doc;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  return (id?.identification as string) ?? '';
}

/** identificationTypeId desde custom:identTypeId o sub.id.identificationTypeId. */
export function getIdentificationTypeIdFromPayload(payload: Record<string, unknown> | null): number {
  if (!payload) return 1;
  const v = payload['custom:identTypeId'];
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseInt(v, 10) || 1;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  return (id?.identificationTypeId as number) ?? 1;
}

/** iscustomer desde custom:isCustomer. */
export function getIscustomerFromPayload(payload: Record<string, unknown> | null): number {
  if (!payload) return 0;
  const v = payload['custom:isCustomer'];
  if (v === '1') return 1;
  if (typeof v === 'number') return v;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  return (id?.iscustomer as number) ?? 0;
}

/** termsaccepted desde custom:termsaccepted. */
export function getTermsacceptedFromPayload(payload: Record<string, unknown> | null): number {
  if (!payload) return 0;
  const v = payload['custom:termsaccepted'];
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseInt(v, 10) || 0;
  const sub = payload.sub as Record<string, unknown> | undefined;
  const id = sub?.id as Record<string, unknown> | undefined;
  return (id?.termsaccepted as number) ?? 0;
}

/** Oauthid/sub desde payload (string o sub del formato nuevo). */
export function getOauthidFromPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return '';
  const sub = payload.sub;
  if (typeof sub === 'string') return sub;
  return '';
}

/** Construye AuthUser completo desde token + respuesta mínima. */
export function buildUserFromToken(
  token: string,
  firstname: string,
  oauthid: string
): AuthUser {
  const payload = decodeJwtPayload(token);
  const tenants = getTenantsFromPayload(payload) as AuthTenant[] | undefined;
  return {
    firstname,
    oauthid,
    token,
    iscustomer: getIscustomerFromPayload(payload),
    termsaccepted: getTermsacceptedFromPayload(payload),
    identification: getIdentificationFromPayload(payload),
    identificationTypeId: getIdentificationTypeIdFromPayload(payload),
    roles: getRolesFromPayload(payload),
    tenants,
  };
}

/**
 * Devuelve el primer tenant del JWT para usuarios admin.
 * Soporta JWT nuevo (payload.tenants) y antiguo (payload.sub.id.tenants).
 * - Admin: objeto tenant completo (tenantCode, etc.).
 * - No admin: undefined (permite consultar transacciones de todos los tenants).
 */
export function getTenantForRequest(): JwtTenant | undefined {
  const token = getAuthToken();
  if (!token) return undefined;

  const payload = decodeJwtPayload(token);
  const tenants = getTenantsFromPayload(payload);
  const tenant = tenants?.[0];
  const roles = getRolesFromPayload(payload);

  const isAdmin = roles.includes(ROLE_ADMIN);
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
  