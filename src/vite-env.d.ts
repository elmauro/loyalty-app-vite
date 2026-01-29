/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_AUTH?: string;
  readonly VITE_API_BASE_APP?: string;
  readonly VITE_PROGRAM_ID?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_TENANT_CODE?: string;
  readonly VITE_TRANSACTION_TYPE_INCOME?: string;
  readonly VITE_TRANSACTION_TYPE_EXPENSE?: string;
  /** 'true' solo al ejecutar pruebas e2e (Cypress); activa MSW. No definir en uso normal. */
  readonly VITE_USE_MSW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
