// src/services/otpService.ts
import axios from './axiosInstance';
import { OtpRequest, OtpApiResponse } from '../types/Auth';

export async function sendOtp(data: OtpRequest): Promise<OtpApiResponse> {
  const response = await axios.post<OtpApiResponse>('/otp53rv1c3-1', data);
  return response.data;
}

