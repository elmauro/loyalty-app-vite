// src/services/otpService.ts
import { axiosAuth } from './axiosInstance';
import { OtpRequest, OtpApiResponse } from '../types/Auth';

export async function sendOtp(data: OtpRequest): Promise<OtpApiResponse> {
  const payload = { documentNumber: data.documentNumber.trim() };
  const response = await axiosAuth.post<OtpApiResponse>('/otp53rv1c3-1', payload);
  return response.data;
}

