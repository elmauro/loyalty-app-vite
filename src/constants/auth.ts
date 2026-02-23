/**
 * Roles (GUIDs alineados con role.json y authController).
 * - Administrator de Tenant: a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
 * - Usuario Normal: b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e
 * - Administrador de Programa: c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f
 */
export const ROLE_ADMIN = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
export const ROLE_CUSTOMER = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
export const ROLE_PROGRAM_ADMIN = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f';

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

export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  [ROLE_ADMIN]: '/administration',
  [ROLE_CUSTOMER]: '/user',
  [ROLE_PROGRAM_ADMIN]: '/program-administration',
};

export function getDefaultPathForRole(roleId: string): string {
  return ROLE_DEFAULT_PATHS[roleId] ?? '/';
}
