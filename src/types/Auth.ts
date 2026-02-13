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

/** Respuesta mínima de /api/authentications (el resto se obtiene del JWT). */
export interface AuthResponse {
  firstname: string;
  oauthid: string;
  token: string;
}

/** Usuario completo construido desde el token (para uso en la app). */
export interface AuthUser extends AuthResponse {
  iscustomer: number;
  termsaccepted: number;
  identification: string;
  identificationTypeId: number;
  roles: string[];
  tenants?: AuthTenant[];
}

// Alias de AuthResponse (sin duplicar estructura)
export type LoginResponseBody = AuthResponse;

// OTP request (email/phone se obtienen de Cognito por documentNumber)
export interface OtpRequest {
  documentNumber: string;
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

  