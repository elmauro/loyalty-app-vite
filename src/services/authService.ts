import axios from './axiosInstance';
import { AuthRequest, AuthResponse } from '../types/Auth';

export async function login(data: AuthRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>('/api/authentications', data);
  return response.data;
}
