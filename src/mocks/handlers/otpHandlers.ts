// src/mocks/handlers/otpHandlers.ts
// Alineado con otp-api/docs/swagger.yaml: 200 (éxito), 400 (ValidationException), 429 (rate limit).
import { http, HttpResponse } from 'msw';
import { OtpRequest, OtpApiResponse } from '../../types/Auth';
import { getMockResponse } from '../../mocks/mockService';

export const otpHandlers = [
  http.post<never, OtpRequest, OtpApiResponse>(
    '/otp53rv1c3-1',
    async ({ request }) => {
      const body = (await request.json()) as { phoneNumber?: string };

      if (!body?.phoneNumber) {
        return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 400 });
      }

      // Swagger 429: rate limit (ej. mismo número en poco tiempo). Trigger para e2e: número termina en 429.
      if (String(body.phoneNumber).endsWith('429')) {
        return HttpResponse.json(getMockResponse('common', 'tooManyRequests'), { status: 429 });
      }

      // 200: en producción el backend no devuelve el OTP; en mocks sí para e2e (código fijo 123456).
      return HttpResponse.json({ type: 'success', otp: '123456' });
    }
  ),
];
