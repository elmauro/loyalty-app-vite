// Bases URL de backend por entorno (path ya incluido en cada servicio)
// En dev sin .env: base vacía → proxy de Vite (evita CORS/cert; history e income van a dev.loyaleasy.com).
// Con .env o en producción: URLs reales.
const getEnv = (key: string, fallback: string): string =>
  (import.meta.env[key] as string | undefined)?.trim() || fallback;

const devFallback = import.meta.env.DEV ? '' : undefined;
/** En e2e (VITE_USE_MSW) las requests deben ir a same-origin para que MSW las intercepte. */
const useMocks = import.meta.env.VITE_USE_MSW === 'true';

export const API_BASE_AUTH = useMocks ? '' : getEnv('VITE_API_BASE_AUTH', devFallback ?? 'https://loyaleasy.com');

export const API_BASE_APP = useMocks ? '' : getEnv('VITE_API_BASE_APP', devFallback ?? 'https://dev.loyaleasy.com');

export const PROGRAM_ID = getEnv('VITE_PROGRAM_ID', 'PCM');

/** Header x-api-key. Definir en .env para override (ver .env.example). */
export const API_KEY = getEnv(
  'VITE_API_KEY',
  'XltDmAkEaf73Pa63gQuPD9S8WCr83Ry73LF7g9wz'
);

/** Header x-transaction-type por contexto. Income endpoint usa 'sale'. */
export const TRANSACTION_TYPE_INCOME = getEnv('VITE_TRANSACTION_TYPE_INCOME', 'sale');

/** Base path GET reglas (engine-api getRules). */
export const RULES_GET_API_PATH = getEnv('VITE_RULES_GET_API_PATH', 'rulesGet53rv1c3');
/** Base path PUT reglas (engine-api updateRules). */
export const RULES_UPDATE_API_PATH = getEnv('VITE_RULES_UPDATE_API_PATH', 'rulesPut53rv1c3');

/** tenant-api base paths (Opción C) */
export const TENANTS_GET_PATH = getEnv('VITE_TENANTS_GET_PATH', 'tenantsGet53rv1c3');
export const TENANTS_POST_PATH = getEnv('VITE_TENANTS_POST_PATH', 'tenantsPost53rv1c3');
export const TENANTS_PUT_PATH = getEnv('VITE_TENANTS_PUT_PATH', 'tenantsPut53rv1c3');

/** admin-api base paths (Opción C) */
export const ADMIN_PROGRAM_PATH = getEnv('VITE_ADMIN_PROGRAM_PATH', 'adminProgram53rv1c3');
export const ADMIN_PROGRAM_PUT_PATH = getEnv('VITE_ADMIN_PROGRAM_PUT_PATH', 'adminProgramPut53rv1c3');
/** Expense (canje) endpoint usa 'redemption'. */
export const TRANSACTION_TYPE_EXPENSE = getEnv('VITE_TRANSACTION_TYPE_EXPENSE', 'redemption');

/** Código de país para teléfonos (ej. 57 Colombia). Se concatena al número en acumulación, OTP y redención. */
export const PHONE_COUNTRY_CODE = getEnv('VITE_PHONE_COUNTRY_CODE', '57');

/** Cognito (opcional). Si no están definidos, el login usa solo flujo tradicional (login+pass). */
export const COGNITO_USER_POOL_ID = getEnv('VITE_COGNITO_USER_POOL_ID', '');
export const COGNITO_CLIENT_ID = getEnv('VITE_COGNITO_CLIENT_ID', '');
export const COGNITO_REGION = getEnv('VITE_COGNITO_REGION', 'us-east-1');

/** Cuando VITE_USE_MSW=true (Cypress e2e), Cognito se desactiva para usar mocks. */
export const isCognitoEnabled = (): boolean =>
  import.meta.env.VITE_USE_MSW === 'true'
    ? false
    : Boolean(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID);
