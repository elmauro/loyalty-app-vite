// src/mocks/handlers/programHandlers.ts
// adminProgram53rv1c3, adminProgramPut53rv1c3, adminProgTxTypes53rv1c3, adminTenantAdmins53rv1c3
// tenantsGet53rv1c3, tenantsPost53rv1c3, tenantsPut53rv1c3
// officeGet53rv1c3, officeAdd53rv1c3, officeUpdate53rv1c3
import { http, HttpResponse } from 'msw';

const ADMIN_PROGRAM_PATH = '/adminProgram53rv1c3/admin/program';
const ADMIN_PROGRAM_PUT_PATH = '/adminProgramPut53rv1c3/admin/program';
const TRANSACTION_TYPES_PATH = '/adminProgTxTypes53rv1c3/admin/transaction-types';
const TENANT_ADMINS_PATH = '/adminTenantAdmins53rv1c3/tenant-admins';
const TENANTS_GET_PATH = '/tenantsGet53rv1c3/tenants';
const TENANTS_POST_PATH = '/tenantsPost53rv1c3/tenants';
const TENANTS_PUT_PATH = '/tenantsPut53rv1c3/tenants';

const mockProgram = {
  programId: 'PCM',
  name: 'Programa Test',
  description: '',
  conversionValue: 1000,
  pointsMoneyRatio: 0.01,
  periodId: 3,
  periodValue: 365,
  ruleEngine: 'jsonrule',
  transactionsType: { income: ['sale'], expense: ['redemption'] },
};

const mockTenants = [
  {
    tenantId: 'tenant-1',
    tenantid: 'tenant-1',
    name: 'Aliado Demo',
    tenantCode: 'DEMO01',
    identification: '123456789',
    identificationTypeId: '3',
    conversionValue: 1000,
    pointsMoneyRatio: 0.01,
    periodId: 3,
    periodValue: 365,
  },
];

const mockTenantAdmins = [
  {
    cognito_sub: 'admin-demo-001',
    email: 'admin@aliado.com',
    given_name: 'Admin',
    family_name: 'Demo',
    tenantId: 'tenant-1',
    tenantName: 'Aliado Demo',
    status: 'active',
  },
];

const mockOffices: Array<{
  programId: string;
  tenantId: string;
  officeId: string;
  cityId: number;
  name: string;
  address: string;
  isDeleted?: number;
}> = [
  {
    programId: 'PCM',
    tenantId: 'tenant-1',
    officeId: 'off-e2e-001',
    cityId: 11001,
    name: 'Oficina Centro E2E',
    address: 'Calle 50 #10-20',
    isDeleted: 0,
  },
  {
    programId: 'PCM',
    tenantId: 'tenant-1',
    officeId: 'off-e2e-002',
    cityId: 5001,
    name: 'Oficina Desactivada E2E',
    address: 'Calle 30 #5-10',
    isDeleted: 1,
  },
];

export const programHandlers = [
  http.get(ADMIN_PROGRAM_PATH, () => HttpResponse.json(mockProgram)),
  http.put(ADMIN_PROGRAM_PUT_PATH, () => HttpResponse.json({ programId: 'PCM' })),
  http.get(TRANSACTION_TYPES_PATH, () =>
    HttpResponse.json({ income: ['sale'], expense: ['redemption'] })
  ),
  http.get(TENANT_ADMINS_PATH, () => HttpResponse.json(mockTenantAdmins)),
  http.post(TENANT_ADMINS_PATH, () => HttpResponse.json({ status: 'created' }, { status: 200 })),
  http.patch(/\/adminTenantAdmins53rv1c3\/tenant-admins\/.+/, async ({ request }) => {
    const body = (await request.json()) as { status?: string };
    return HttpResponse.json({ status: body?.status ?? 'inactive' }, { status: 200 });
  }),
  http.get(TENANTS_GET_PATH, () => HttpResponse.json(mockTenants)),
  http.post(TENANTS_POST_PATH, () => HttpResponse.json({ id: 'tenant-new', rowCount: 1 })),
  http.put(/\/tenantsPut53rv1c3\/tenants\/.+/, () => HttpResponse.json({})),
  http.get(/\/officeGet53rv1c3\/tenants\/.+\/offices/, () => HttpResponse.json(mockOffices)),
  http.post(/\/officeAdd53rv1c3\/tenants\/.+\/offices/, () =>
    HttpResponse.json({ officeId: 'off-e2e-new', rowCount: 1 })
  ),
  http.put(/\/officeUpdate53rv1c3\/tenants\/.+\/offices\/.+/, () =>
    HttpResponse.json({ officeId: 'off-e2e-001', rowCount: 1 })
  ),
  http.post(/\/apiKeyPost53rv1c3\/tenants\/.+\/api-key/, () =>
    HttpResponse.json({
      apiKey: 'lk_test1234567890abcdef1234567890abcdef',
      message: 'Guarda esta clave. No se mostrará de nuevo.',
    })
  ),
];
