// src/mocks/handlers/transactionHandlers.ts
import { http, HttpResponse } from 'msw';
import {
  Transaction,
  AccumulatePointsRequest,
  RedeemPointsRequest,
  TransactionApiResponse
} from '../../types/Transaction';

export const transactionHandlers = [
  http.post<never, RedeemPointsRequest, TransactionApiResponse>(
    '/expense53rv1c3/expense',
    async ({ request }) => {
      const body = await request.json();

      if (!body.otpCode || body.points <= 0) {
        return HttpResponse.json(
          { type: 'error', error: 'Invalid redemption request' },
          { status: 400 }
        );
      }

      return HttpResponse.json({ type: 'success', status: 'processed' });
    }
  ),

  http.post<never, AccumulatePointsRequest, TransactionApiResponse>(
    '/income53rv1c3/income',
    async ({ request }) => {
      const body = await request.json();

      if (!body.value || body.value <= 0) {
        return HttpResponse.json(
          { type: 'error', error: 'Invalid accumulation request' },
          { status: 400 }
        );
      }

      return HttpResponse.json({ type: 'success', status: 'processed' });
    }
  ),

  http.get<{ typeId: string; document: string }, undefined, Transaction[]>(
    '/history53rv1c3/history/:typeId/:document',
    async ({ params }) => {
      const { typeId } = params;

      const history: Transaction[] = [
        {
          id: '0c1c87f0-3f38-4dd1-ac11-4fe0acadc6bc',
          detail: 'Deelite',
          transactionDate: '2023-10-04',
          type: typeId === '1' ? 'sale' : 'income',
          points: 50,
          phoneNumber: '573116344194',
          tenantCode: 'dlt789'
        }
      ];

      return HttpResponse.json(history);
    }
  )
];
