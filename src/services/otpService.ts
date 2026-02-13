// src/services/otpService.ts
import { axiosAuth } from './axiosInstance';
import { OtpRequest, OtpApiResponse } from '../types/Auth';

export async function sendOtp(data: OtpRequest): Promise<OtpApiResponse> {
  const trimmed = (data.documentNumber ?? '').trim();
  if (!trimmed) {
    throw new Error('documentNumber is required');
  }
  const payload = {
    documentNumber: trimmed,
    identificationTypeId: data.identificationTypeId ?? 1,
  };
  const response = await axiosAuth.post<OtpApiResponse>('/otp53rv1c3-1', payload);
  return response.data;
}

