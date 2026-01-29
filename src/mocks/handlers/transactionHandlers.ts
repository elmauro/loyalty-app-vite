// src/mocks/handlers/transactionHandlers.ts
import { http, HttpResponse } from 'msw';
import { getMockResponse } from '../../mocks/mockService';
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
        return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 400 });
      }

      // Simula errores según valores controlados
      if (body.otpCode === '403403') {
        return HttpResponse.json(
          getMockResponse('common', 'forbidden'),
          { status: 403 }
        );
      }

      if (body.otpCode === '404404') {
        return HttpResponse.json(
          getMockResponse('common', 'notfound'),
          { status: 404 }
        );
      }

        return HttpResponse.json(getMockResponse('redemptions', 'success'));
      }
  ),

  http.post<never, AccumulatePointsRequest, TransactionApiResponse>(
    '/income53rv1c3/income',
    async ({ request }) => {
      const body = await request.json();

      if (!body.value || body.value <= 0) {
        return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 400 });
      }

      if (body.value === 403) {
        return HttpResponse.json(
          getMockResponse('common', 'forbidden'),
          { status: 403 }
        );
      }
  
      if (body.value === 404) {
        return HttpResponse.json(
          getMockResponse('common', 'notfound'),
          { status: 404 }
        );
      }

      return HttpResponse.json(getMockResponse('accumulations', 'success'));
    }
  ),

  http.get<{ typeId: string; document: string }, undefined, Transaction[]>(
    '/history53rv1c3/history/:typeId/:document',
    async ({ params }) => {
      const history = getMockResponse<'transactions', Transaction[]>(
        'transactions',
        'success'
      );

      return HttpResponse.json(history);
    }
  ),

  http.get<{ typeId: string; document: string }>(
    '/points53rv1c3/points/:typeId/:document',
    () => HttpResponse.json({ points: 1500 })
  )
];