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

// Respuesta común para login y autenticación
export interface AuthResponse {
  firstname: string;
  iscustomer: number;
  termsaccepted: number;
  identification: string;
  identificationTypeId: number;
  roles: string[];
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

  