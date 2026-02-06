// src/mocks/handlers/transactionHandlers.ts
import { http, HttpResponse } from 'msw';
// Alineado con transaction-api Swagger: income, expense, history, points.
import { getMockResponse } from '../../mocks/mockService';
import {
  Transaction,
  AccumulatePointsRequest,
  RedeemPointsRequest,
  TransactionApiResponse,
  HistoryResponse,
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
      if (body.otpCode === '409409') {
        return HttpResponse.json(getMockResponse('common', 'conflict'), { status: 409 });
      }
      if (body.otpCode === '429429') {
        return HttpResponse.json(getMockResponse('common', 'tooManyRequests'), { status: 429 });
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
      if (body.value === 429) {
        return HttpResponse.json(getMockResponse('common', 'tooManyRequests'), { status: 429 });
      }

      return HttpResponse.json(getMockResponse('accumulations', 'success'));
    }
  ),

  http.get<{ typeId: string; document: string }>(
    '/history53rv1c3/history/:typeId/:document',
    async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
      const rawLimit = parseInt(url.searchParams.get('limit') ?? '100', 10);
      const allowedLimits = [10, 20, 50, 100];
      const limit = allowedLimits.includes(rawLimit) ? rawLimit : 100;
      const base = getMockResponse<'transactions', Transaction[]>(
        'transactions',
        'success'
      );
      // Para e2e: expandir a 25 ítems para probar paginación (varias páginas)
      const all: Transaction[] =
        base.length < 25
          ? Array.from({ length: 25 }, (_, i) => ({
              ...base[0],
              id: `mock-tx-${i + 1}`,
              detail: i === 0 ? base[0].detail : `Transacción ${i + 1}`,
              points: base[0].points + i,
            }))
          : base;
      const total = all.length;
      const start = (page - 1) * limit;
      const data = all.slice(start, start + limit);
      const body: HistoryResponse = { data, total, page, limit };
      return HttpResponse.json(body);
    }
  ),

  http.get<{ typeId: string; document: string }>(
    '/points53rv1c3/points/:typeId/:document',
    () => HttpResponse.json({ points: 1500 })
  )
];