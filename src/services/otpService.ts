// src/services/otpService.ts
import { axiosAuth } from './axiosInstance';
import { formatPhoneWithCountryCode } from '../utils/formatPhone';
import { OtpRequest, OtpApiResponse } from '../types/Auth';

export async function sendOtp(data: OtpRequest): Promise<OtpApiResponse> {
  const payload = { phoneNumber: formatPhoneWithCountryCode(data.phoneNumber) };
  const response = await axiosAuth.post<OtpApiResponse>('/otp53rv1c3-1', payload);
  return response.data;
}

