// Bases URL de backend por entorno (path ya incluido en cada servicio)
// En dev sin .env: base vacía → proxy de Vite (evita CORS/cert; history e income van a dev.loyaleasy.com).
// Con .env o en producción: URLs reales.
const getEnv = (key: string, fallback: string): string =>
  (import.meta.env[key] as string | undefined)?.trim() || fallback;

const devFallback = import.meta.env.DEV ? '' : undefined;

export const API_BASE_AUTH = getEnv(
  'VITE_API_BASE_AUTH',
  devFallback ?? 'https://loyaleasy.com'
);

export const API_BASE_APP = getEnv(
  'VITE_API_BASE_APP',
  devFallback ?? 'https://dev.loyaleasy.com'
);

export const PROGRAM_ID = getEnv('VITE_PROGRAM_ID', 'PCM');

/** Header x-api-key. Definir en .env para override (ver .env.example). */
export const API_KEY = getEnv(
  'VITE_API_KEY',
  'XltDmAkEaf73Pa63gQuPD9S8WCr83Ry73LF7g9wz'
);

/** Header x-transaction-type por contexto. Income endpoint usa 'sale'. */
export const TRANSACTION_TYPE_INCOME = getEnv('VITE_TRANSACTION_TYPE_INCOME', 'sale');
/** Expense (canje) endpoint usa 'redemption'. */
export const TRANSACTION_TYPE_EXPENSE = getEnv('VITE_TRANSACTION_TYPE_EXPENSE', 'redemption');

/** Código de país para teléfonos (ej. 57 Colombia). Se concatena al número en acumulación, OTP y redención. */
export const PHONE_COUNTRY_CODE = getEnv('VITE_PHONE_COUNTRY_CODE', '57');
