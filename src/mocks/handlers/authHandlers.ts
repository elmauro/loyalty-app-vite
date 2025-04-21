// src/mocks/handlers/authHandlers.ts
import { http, HttpResponse } from 'msw';
import { LoginRequestBody } from '../../types/Auth';
import { getMockResponse } from '../../mocks/mockService';

export const authHandlers = [
  http.post('/api/authentications', async ({ request }) => {
    const body = await request.json() as LoginRequestBody;

    if (body.login === '8288221' && body.pass === '8221') {
      return HttpResponse.json(getMockResponse('auth', 'successAdmin'));
    }

    if (body.login === '98632674' && body.pass === '2674') {
      return HttpResponse.json(getMockResponse('auth', 'successUser'));
    }

    return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 401 });
  }),
];
