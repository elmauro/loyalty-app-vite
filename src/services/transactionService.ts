// src/services/transactionService.ts
// Todas las peticiones usan axiosApp → API_BASE_APP (https://dev.loyaleasy.com).
// Income: POST https://dev.loyaleasy.com/income53rv1c3/income
import axiosApp from './axiosInstance';
import {
  PROGRAM_ID,
  TRANSACTION_TYPE_INCOME,
  TRANSACTION_TYPE_EXPENSE,
} from './apiConfig';
import { getAuthToken, getTenantCodeForRequest } from '../utils/token';
import { BACKEND_CHUNK_SIZE } from '../constants/pagination';
import {
  AccumulatePointsRequest,
  RedeemPointsRequest,
  PointsResponse,
  HistoryResponse,
  ExpiringPointsResponse,
} from '../types/Transaction';

export { BACKEND_CHUNK_SIZE };

export async function accumulatePoints(
  data: AccumulatePointsRequest,
  transactionType?: string,
  officeId?: string
): Promise<{ status: string }> {
  const token = getAuthToken();
  const tenantCode = getTenantCodeForRequest();
  if (!tenantCode?.trim()) {
    throw Object.assign(new Error('Tenant no configurado'), {
      response: { status: 400, data: { error: 'x-tenant-code requerido' } },
    });
  }
  if (!officeId?.trim()) {
    throw Object.assign(new Error('Oficina no configurada'), {
      response: { status: 400, data: { error: 'x-office-id requerido' } },
    });
  }
  const payload = { ...data };
  const response = await axiosApp.post('/income53rv1c3/income', payload, {
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
      'x-tenant-code': tenantCode,
      'x-office-id': officeId,
      'x-transaction-type': transactionType ?? TRANSACTION_TYPE_INCOME,
    },
  });
  return response.data;
}

export async function redeemPoints(
  data: RedeemPointsRequest,
  officeId?: string
): Promise<{ status: string }> {
  const token = getAuthToken();
  const tenantCode = getTenantCodeForRequest();
  if (!tenantCode?.trim()) {
    throw Object.assign(new Error('Tenant no configurado'), {
      response: { status: 400, data: { error: 'x-tenant-code requerido' } },
    });
  }
  if (!officeId?.trim()) {
    throw Object.assign(new Error('Oficina no configurada'), {
      response: { status: 400, data: { error: 'x-office-id requerido' } },
    });
  }
  const payload = { ...data };
  const response = await axiosApp.post('/expense53rv1c3/expense', payload, {
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
      'x-tenant-code': tenantCode,
      'x-office-id': officeId,
      'x-transaction-type': TRANSACTION_TYPE_EXPENSE,
    },
  });
  return response.data;
}

const DEFAULT_PAGE = 1;

/** Filtros opcionales alineados con query History API: transactionType, officeId */
export type GetTransactionsOptions = {
  transactionType?: string;
  officeId?: string;
};

/** Devuelve `undefined` si no hay filtros (evita query params vacíos). */
export function getTransactionsOptionsFromStrings(
  transactionType: string,
  officeId: string
): GetTransactionsOptions | undefined {
  const tt = transactionType.trim();
  const oid = officeId.trim();
  if (!tt && !oid) return undefined;
  const out: GetTransactionsOptions = {};
  if (tt) out.transactionType = tt;
  if (oid) out.officeId = oid;
  return out;
}

export async function getTransactions(
  typeId: string,
  document: string,
  startDate: string,
  endDate: string,
  page: number = DEFAULT_PAGE,
  limit: number = BACKEND_CHUNK_SIZE,
  options?: GetTransactionsOptions
): Promise<HistoryResponse> {
  const token = getAuthToken();
  const params: Record<string, string | number> = {
    startDate,
    endDate,
    page,
    limit,
  };
  const tt = options?.transactionType?.trim();
  const oid = options?.officeId?.trim();
  if (tt) params.transactionType = tt;
  if (oid) params.officeId = oid;

  const response = await axiosApp.get<HistoryResponse>(
    `/history53rv1c3/history/${typeId}/${document}`,
    {
      params,
      headers: {
        'x-access-token': token ?? '',
        'x-program-id': PROGRAM_ID,
      },
    }
  );
  return response.data;
}

export async function getPoints(typeId: string, document: string): Promise<PointsResponse> {
  const token = getAuthToken();
  const response = await axiosApp.get<PointsResponse>(`/points53rv1c3/points/${typeId}/${document}`, {
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
    },
  });
  return response.data;
}

/**
 * Puntos por vencer (próxima fecha de vencimiento).
 * GET /pointsExp53rv1c3/points/{typeId}/{document}
 */
export async function getExpiringPoints(
  typeId: string,
  document: string
): Promise<ExpiringPointsResponse | null> {
  try {
    const token = getAuthToken();
    const response = await axiosApp.get<ExpiringPointsResponse>(
      `/pointsExp53rv1c3/points/${typeId}/${document}`,
      {
        headers: {
          'x-access-token': token ?? '',
          'x-program-id': PROGRAM_ID,
        },
      }
    );
    return response.data;
  } catch {
    return null;
  }
}

