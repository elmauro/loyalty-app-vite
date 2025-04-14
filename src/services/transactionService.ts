// src/services/transactionService.ts
import axios from './axiosInstance';
import {
  AccumulatePointsRequest,
  RedeemPointsRequest,
  Transaction
} from '../types/Transaction';

export async function accumulatePoints(data: AccumulatePointsRequest): Promise<{ status: string }> {
  const response = await axios.post('/income53rv1c3/income', data, {
    headers: {
      'x-tenant-code': 'dlt789',
      'x-transaction-type': 'income',
    },
  });
  return response.data;
}

export async function redeemPoints(data: RedeemPointsRequest): Promise<{ status: string }> {
  const response = await axios.post('/expense53rv1c3/expense', data, {
    headers: {
      'x-tenant-code': 'dlt789',
      'x-transaction-type': 'expense',
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
  const response = await axios.get(`/history53rv1c3/history/${typeId}/${document}`, {
    params: { startDate, endDate },
  });
  return response.data;
}

