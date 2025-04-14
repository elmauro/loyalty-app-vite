// src/mocks/handlers/authHandlers.ts
import { http, HttpResponse } from 'msw';
import { LoginRequestBody } from '../../types/Auth';

export const authHandlers = [
  http.post('/api/authentications', async ({ request }) => {
    const body = await request.json() as LoginRequestBody;

    if (body.login === '8288221' && body.pass === '8221') {
      return HttpResponse.json({
        firstname: 'AdminUser',
        iscustomer: 0,
        termsaccepted: 0,
        identification: '8288221',
        identificationTypeId: 1,
        roles: ['1'],
        token: 'admin-token',
      });
    }

    if (body.login === '98632674' && body.pass === '2674') {
      return HttpResponse.json({
        firstname: 'User986',
        iscustomer: 1,
        termsaccepted: 0,
        identification: '98632674',
        identificationTypeId: 1,
        roles: ['2'],
        token: 'user-token',
      });
    }

    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
];
