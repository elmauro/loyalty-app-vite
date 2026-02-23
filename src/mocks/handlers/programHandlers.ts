// src/mocks/handlers/programHandlers.ts
// adminProgram53rv1c3: GET admin/transaction-types (tipos de transacción para tenant admins)
import { http, HttpResponse } from 'msw';

const TRANSACTION_TYPES_PATH = '/adminProgTxTypes53rv1c3/admin/transaction-types';

export const programHandlers = [
  http.get(TRANSACTION_TYPES_PATH, () => {
    return HttpResponse.json({
      income: ['sale'],
      expense: ['redemption'],
    });
  }),
];
