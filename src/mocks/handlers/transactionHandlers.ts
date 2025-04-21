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
        return HttpResponse.json<TransactionApiResponse>(
          getMockResponse('common', 'badrequest'),
          { status: 400 }
        );
      }

      return HttpResponse.json<TransactionApiResponse>(
        getMockResponse('redemptions', 'success')
      );
    }
  ),

  http.post<never, AccumulatePointsRequest, TransactionApiResponse>(
    '/income53rv1c3/income',
    async ({ request }) => {
      const body = await request.json();

      if (!body.value || body.value <= 0) {
        return HttpResponse.json<TransactionApiResponse>(
          getMockResponse('common', 'badrequest'),
          { status: 400 }
        );
      }

      return HttpResponse.json<TransactionApiResponse>(
        getMockResponse('accumulations', 'success')
      );
    }
  ),

  http.get<{ typeId: string; document: string }, undefined, Transaction[]>(
    '/history53rv1c3/history/:typeId/:document',
    async ({ params }) => {
      const { typeId } = params;

      const history = getMockResponse<'transactions', Transaction[]>(
        'transactions',
        'success'
      );

      return HttpResponse.json(history);
    }
  )
];
