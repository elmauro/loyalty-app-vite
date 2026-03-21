import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

(globalThis as any).TextEncoder = TextEncoder;

// ResizeObserver no existe en jsdom (Radix UI lo usa)
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock apiConfig para evitar import.meta en Jest (no soportado en ts-jest sin config ESM)
jest.mock('./services/apiConfig', () => ({
  API_BASE_AUTH: '',
  API_BASE_APP: '',
  PROGRAM_ID: 'PCM',
  TRANSACTION_TYPE_INCOME: 'sale',
  RULES_GET_API_PATH: 'rulesGet',
  RULES_UPDATE_API_PATH: 'rulesPut',
  TENANTS_GET_PATH: 'tenantsGet',
  TENANTS_POST_PATH: 'tenantsPost',
  TENANTS_PUT_PATH: 'tenantsPut',
  ADMIN_PROGRAM_PATH: 'adminProgram',
  ADMIN_PROGRAM_PUT_PATH: 'adminProgramPut',
  ADMIN_PROGRAM_TRANSACTION_TYPES_PATH: 'adminProgTxTypes',
  ADMIN_TENANT_ADMINS_PATH: 'adminTenantAdmins',
  TRANSACTION_TYPE_EXPENSE: 'redemption',
  PHONE_COUNTRY_CODE: '57',
  COGNITO_USER_POOL_ID: '',
  COGNITO_CLIENT_ID: '',
  COGNITO_REGION: 'us-east-1',
  isCognitoEnabled: () => false,
}));