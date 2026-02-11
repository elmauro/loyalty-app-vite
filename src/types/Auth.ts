// src/types/Auth.ts
// Común para login
export interface LoginRequestBody {
  login: string;
  pass: string;
}

// Auth extiende Login con metadata adicional
export interface AuthRequest extends LoginRequestBody {
  loginTypeId: number;
  identificationTypeId: number;
}

/** Tenant en la respuesta de autenticación. */
export interface AuthTenant {
  tenantId: string;
  tenantCode: string;
  name: string;
}

// Respuesta común para login y autenticación
// roles: ['1'] = Administration (iscustomer 0), ['2'] = Customer (iscustomer 1)
export interface AuthResponse {
  firstname: string;
  /** 0 = Administration, 1 = Customer */
  iscustomer: number;
  termsaccepted: number;
  identification: string;
  identificationTypeId: number;
  /** ['1'] = Administration, ['2'] = Customer */
  roles: string[];
  /** Tenants del usuario (también en JWT). */
  tenants?: AuthTenant[];
  token: string;
}

// Alias de AuthResponse (sin duplicar estructura)
export type LoginResponseBody = AuthResponse;

// OTP request
export interface OtpRequest {
  phoneNumber: string;
}

// OTP response con discriminated union
interface OtpSuccess {
  type: 'success';
  otp: string;
}

interface OtpError {
  type: 'error';
  error: string;
}

export type OtpApiResponse = OtpSuccess | OtpError;

  