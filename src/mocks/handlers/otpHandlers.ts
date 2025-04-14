// src/mocks/handlers/otpHandlers.ts
import { http, HttpResponse } from 'msw';
import { OtpRequest, OtpApiResponse } from '../../types/Auth';

export const otpHandlers = [
  http.post<never, OtpRequest, OtpApiResponse>(
    '/otp53rv1c3-1',
    async ({ request }) => {
      const body = await request.json();

      if (!body.phoneNumber) {
        return HttpResponse.json(
          { type: 'error', error: 'Phone number required' },
          { status: 400 }
        );
      }

      return HttpResponse.json({ type: 'success', otp: '778745' });
    }
  ),
];
