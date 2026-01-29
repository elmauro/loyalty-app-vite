/**
 * Roles y flags de usuario según el JWT del backend.
 * - Rol 1 = Administration | iscustomer 0
 * - Rol 2 = Customer       | iscustomer 1
 */
export const ROLE_ADMIN = '1';
export const ROLE_CUSTOMER = '2';

export const IS_CUSTOMER_ADMIN = 0;
export const IS_CUSTOMER_CUSTOMER = 1;

export const ROLES = {
  ADMIN: ROLE_ADMIN,
  CUSTOMER: ROLE_CUSTOMER,
} as const;

export const IS_CUSTOMER = {
  ADMIN: IS_CUSTOMER_ADMIN,
  CUSTOMER: IS_CUSTOMER_CUSTOMER,
} as const;
