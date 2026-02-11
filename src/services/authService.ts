import { axiosAuth } from './axiosInstance';
import { AuthRequest, AuthResponse } from '../types/Auth';

export async function login(data: AuthRequest): Promise<AuthResponse> {
  const response = await axiosAuth.post<AuthResponse>('/api/authentications', data);
  return response.data;
}

/** Login con IdToken de Cognito. El backend valida el token y devuelve la misma respuesta. */
export async function loginWithCognitoToken(idToken: string): Promise<AuthResponse> {
  const response = await axiosAuth.post<AuthResponse>('/api/authentications', {
    idToken,
  });
  return response.data;
}
