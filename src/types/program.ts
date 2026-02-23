export interface Program {
  programId: string;
  name: string;
  description: string;
  conversionValue: number;
  pointsMoneyRatio: number;
  periodId: number;
  periodValue: number;
  ruleEngine: string;
  transactionsType: {
    income: string[];
    expense: string[];
  };
}

export interface Tenant {
  tenantId: string;
  name: string;
  tenantCode: string;
  identification: string;
  identificationTypeId: string;
  conversionValue: number;
  pointsMoneyRatio: number;
  periodId: number;
  periodValue: number;
  isdeleted: number;
}

export interface TenantAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantName: string;
  isActive: boolean;
}

export const IDENTIFICATION_TYPES: Record<string, string> = {
  '1': 'CC',
  '2': 'NIT',
  '3': 'Otro',
};

export const MOCK_PROGRAM: Program = {
  programId: 'PCM',
  name: 'PCM',
  description: 'PCM Program',
  conversionValue: 700,
  pointsMoneyRatio: 7,
  periodId: 3,
  periodValue: 6,
  ruleEngine: 'nools',
  transactionsType: {
    income: ['sale'],
    expense: ['redemption'],
  },
};

export const MOCK_TENANT_ADMINS: TenantAdmin[] = [
  {
    id: 'u1',
    email: 'admin@aliado.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    tenantId: '1',
    tenantName: 'Deelite',
    isActive: true,
  },
];
