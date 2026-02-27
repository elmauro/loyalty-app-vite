/**
 * Config para Jest: evita import.meta.env (no disponible en Node).
 * Jest usa moduleNameMapper para cargar este archivo en lugar de apiConfig.ts.
 */
const getEnv = (key: string, fallback: string): string =>
  (process.env[key] as string | undefined)?.trim() || fallback;

const devFallback = process.env.NODE_ENV === 'development' ? '' : undefined;
const useMocks = process.env.VITE_USE_MSW === 'true';

export const API_BASE_AUTH = useMocks ? '' : getEnv('VITE_API_BASE_AUTH', devFallback ?? 'https://loyaleasy.com');
export const API_BASE_APP = useMocks ? '' : getEnv('VITE_API_BASE_APP', devFallback ?? 'https://dev.loyaleasy.com');
export const PROGRAM_ID = getEnv('VITE_PROGRAM_ID', 'PCM');
export const API_KEY = getEnv('VITE_API_KEY', 'XltDmAkEaf73Pa63gQuPD9S8WCr83Ry73LF7g9wz');
export const TRANSACTION_TYPE_INCOME = getEnv('VITE_TRANSACTION_TYPE_INCOME', 'sale');
export const RULES_GET_API_PATH = getEnv('VITE_RULES_GET_API_PATH', 'rulesGet53rv1c3');
export const RULES_UPDATE_API_PATH = getEnv('VITE_RULES_UPDATE_API_PATH', 'rulesPut53rv1c3');
export const TENANTS_GET_PATH = getEnv('VITE_TENANTS_GET_PATH', 'tenantsGet53rv1c3');
export const TENANTS_POST_PATH = getEnv('VITE_TENANTS_POST_PATH', 'tenantsPost53rv1c3');
export const TENANTS_PUT_PATH = getEnv('VITE_TENANTS_PUT_PATH', 'tenantsPut53rv1c3');
export const ADMIN_PROGRAM_PATH = getEnv('VITE_ADMIN_PROGRAM_PATH', 'adminProgram53rv1c3');
export const ADMIN_PROGRAM_PUT_PATH = getEnv('VITE_ADMIN_PROGRAM_PUT_PATH', 'adminProgramPut53rv1c3');
export const ADMIN_PROGRAM_TRANSACTION_TYPES_PATH = getEnv(
  'VITE_ADMIN_PROGRAM_TRANSACTION_TYPES_PATH',
  'adminProgTxTypes53rv1c3'
);
export const TRANSACTION_TYPE_EXPENSE = getEnv('VITE_TRANSACTION_TYPE_EXPENSE', 'redemption');
export const PHONE_COUNTRY_CODE = getEnv('VITE_PHONE_COUNTRY_CODE', '57');
export const COGNITO_USER_POOL_ID = getEnv('VITE_COGNITO_USER_POOL_ID', '');
export const COGNITO_CLIENT_ID = getEnv('VITE_COGNITO_CLIENT_ID', '');
export const COGNITO_REGION = getEnv('VITE_COGNITO_REGION', 'us-east-1');

export const isCognitoEnabled = (): boolean =>
  process.env.VITE_USE_MSW === 'true'
    ? false
    : Boolean(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID);
