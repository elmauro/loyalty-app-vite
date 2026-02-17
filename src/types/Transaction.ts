// src/types/Transaction.ts

/** sale = acumulación (positivo), redemption = canje (negativo), expiration = puntos vencidos */
export type TransactionType = 'sale' | 'income' | 'redemption' | 'expiration';

export interface Transaction {
  id: string;
  detail: string;
  transactionDate: string; // o Date, si ya lo parseas
  type: TransactionType;
  points: number;
  phoneNumber?: string;
  tenantCode?: string;
}

// Base común para requests de acumulación (documentNumber)
export interface AccumulatePointsRequest {
  identificationTypeId: number;
  documentNumber: string;
  value: number;
}

// Redención: documentNumber, otpCode (email/phone de Cognito)
export interface RedeemPointsRequest {
  identificationTypeId: number;
  documentNumber: string;
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

/** Puntos que vencen pronto (requiere endpoint en backend) */
export interface ExpiringPointsResponse {
  points: number;
  expirationDate: string;
}

/** Respuesta paginada del historial de transacciones */
export interface HistoryResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

  