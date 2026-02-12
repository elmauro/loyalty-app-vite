/**
 * Roles y flags de usuario según el JWT del backend.
 * Un usuario tiene un solo rol que determina su página de destino.
 * - Rol 1 = Tenant Admin (Administration)
 * - Rol 2 = Customer
 * - Rol 3 = Program Admin (futuro)
 */
export const ROLE_ADMIN = '1';
export const ROLE_CUSTOMER = '2';
export const ROLE_PROGRAM_ADMIN = '3';

export const IS_CUSTOMER_ADMIN = 0;
export const IS_CUSTOMER_CUSTOMER = 1;

export const ROLES = {
  ADMIN: ROLE_ADMIN,
  CUSTOMER: ROLE_CUSTOMER,
  PROGRAM_ADMIN: ROLE_PROGRAM_ADMIN,
} as const;

export const IS_CUSTOMER = {
  ADMIN: IS_CUSTOMER_ADMIN,
  CUSTOMER: IS_CUSTOMER_CUSTOMER,
} as const;

/** Config central: rol → ruta por defecto (sin afectar funcionalidad actual). */
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  [ROLE_ADMIN]: '/administration',
  [ROLE_CUSTOMER]: '/user',
  [ROLE_PROGRAM_ADMIN]: '/program-administration',
};

/** Obtiene la ruta por defecto según el rol único del usuario. */
export function getDefaultPathForRole(roleId: string): string {
  return ROLE_DEFAULT_PATHS[roleId] ?? '/';
}
