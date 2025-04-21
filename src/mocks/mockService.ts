// src/mocks/mockService.ts
import badrequest from './data/common/badrequest.json';
import unauthorized from './data/common/unauthorized.json';
import forbidden from './data/common/forbidden.json';
import notfound from './data/common/notfound.json';

import transactionsSuccess from './data/transactions/success.json';
import accumulationsSuccess from './data/accumulations/success.json';
import redemptionsSuccess from './data/redemptions/success.json';
import authSuccessAdmin from './data/auth/success-admin.json';
import authSuccessUser from './data/auth/success-user.json';

// Mocks
const mocks = {
  common: {
    badrequest,
    unauthorized,
    forbidden,
    notfound,
  },
  transactions: {
    success: transactionsSuccess,
  },
  accumulations: {
    success: accumulationsSuccess,
  },
  redemptions: {
    success: redemptionsSuccess,
  },
  auth: {
    successAdmin: authSuccessAdmin,
    successUser: authSuccessUser,
  },
} as const;

// 📦 Tipos
type Entity = keyof typeof mocks;
type MockType<E extends Entity> = keyof typeof mocks[E];

// 📢 Función final mejorada
export function getMockResponse<E extends Entity, T = unknown>(
  entity: E,
  type: MockType<E>
): T {
  return mocks[entity][type] as unknown as T;
}
