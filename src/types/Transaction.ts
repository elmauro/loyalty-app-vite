// src/types/Transaction.ts

/** sale = acumulación (positivo), redemption/income = canje (negativo) */
export type TransactionType = 'sale' | 'income' | 'redemption';

export interface Transaction {
  id: string;
  detail: string;
  transactionDate: string; // o Date, si ya lo parseas
  type: TransactionType;
  points: number;
  phoneNumber?: string;
  tenantCode?: string;
}

// Base común para requests que usan phone + idType
interface BasePointsRequest {
  identificationTypeId: number;
  phoneNumber: string;
}

export interface AccumulatePointsRequest extends BasePointsRequest {
  value: number;
}

export interface RedeemPointsRequest extends BasePointsRequest {
  points: number;
  otpCode: string;
}

// Respuesta con union tipo éxito/error
interface TransactionSuccess {
  type: 'success';
  status: 'processed';
}

interface TransactionError {
  type: 'error';
  error: string;
}

export type TransactionApiResponse = TransactionSuccess | TransactionError;

export interface PointsResponse {
  points?: number;
  balance?: number;
}

  