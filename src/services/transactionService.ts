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
import { formatPhoneWithCountryCode } from '../utils/formatPhone';
import {
  AccumulatePointsRequest,
  RedeemPointsRequest,
  Transaction,
  PointsResponse
} from '../types/Transaction';

export async function accumulatePoints(data: AccumulatePointsRequest): Promise<{ status: string }> {
  const token = getAuthToken();
  const tenantCode = getTenantCodeForRequest();
  const payload = { ...data, phoneNumber: formatPhoneWithCountryCode(data.phoneNumber) };
  const response = await axiosApp.post('/income53rv1c3/income', payload, {
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
      'x-tenant-code': tenantCode,
      'x-transaction-type': TRANSACTION_TYPE_INCOME,
    },
  });
  return response.data;
}

export async function redeemPoints(data: RedeemPointsRequest): Promise<{ status: string }> {
  const token = getAuthToken();
  const tenantCode = getTenantCodeForRequest();
  const payload = { ...data, phoneNumber: formatPhoneWithCountryCode(data.phoneNumber) };
  const response = await axiosApp.post('/expense53rv1c3/expense', payload, {
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
      'x-tenant-code': tenantCode,
      'x-transaction-type': TRANSACTION_TYPE_EXPENSE,
    },
  });
  return response.data;
}

export async function getTransactions(
  typeId: string,
  document: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const token = getAuthToken();
  const response = await axiosApp.get(`/history53rv1c3/history/${typeId}/${document}`, {
    params: { startDate, endDate },
    headers: {
      'x-access-token': token ?? '',
      'x-program-id': PROGRAM_ID,
    },
  });
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

