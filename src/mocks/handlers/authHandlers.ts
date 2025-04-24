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

    // Simulación según credenciales
    if (body.login === 'bad' || body.pass === 'bad') {
      return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 400 });
    }

    if (body.login === 'forbidden') {
      return HttpResponse.json(getMockResponse('common', 'forbidden'), { status: 403 });
    }

    if (body.login === 'notfound') {
      return HttpResponse.json(getMockResponse('common', 'notfound'), { status: 404 });
    }

    return HttpResponse.json(getMockResponse('common', 'unauthorized'), { status: 401 });
  }),
];
