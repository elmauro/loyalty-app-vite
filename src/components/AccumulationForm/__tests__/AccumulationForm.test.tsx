// src/components/AccumulationForm/__tests__/AccumulationForm.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AccumulationForm from '../AccumulationForm';
import { renderWithProviders } from '../../../test-utils';
import { getMockResponse } from '../../../mocks/mockService';
import * as transactionService from '../../../services/transactionService';

jest.mock('../../../services/axiosInstance', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

jest.mock('../../../services/transactionService');
jest.mock('../../../services/programService', () => ({
  fetchTransactionTypes: jest.fn().mockResolvedValue({ income: ['sale'], expense: ['redemption'] }),
}));
jest.mock('../../../utils/token', () => ({
  ...jest.requireActual('../../../utils/token'),
  getTenantIdForRequest: () => 'tenant-1',
}));
jest.mock('../../../services/officeService', () => ({
  fetchOfficesByTenant: jest.fn().mockResolvedValue([
    {
      officeId: 'office-1',
      name: 'Test Office',
      programId: 'PCM',
      tenantId: 'tenant-1',
      cityId: 11001,
      address: 'Calle 1',
      isDeleted: 0,
      isDefault: 1,
    },
  ]),
  fetchOfficeDefaultByTenant: jest.fn().mockResolvedValue({
    officeId: 'office-1',
    name: 'Test Office',
    programId: 'PCM',
    tenantId: 'tenant-1',
    cityId: 11001,
    address: 'Calle 1',
    isDeleted: 0,
    isDefault: 1,
  }),
}));

describe('AccumulationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = async () => {
    renderWithProviders(<AccumulationForm />, { withOfficeProvider: true });
    await waitFor(() => {
      expect(screen.getByText('Acumular')).not.toBeDisabled();
    });
    fireEvent.change(screen.getByTestId('acc-document'), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByTestId('acc-value'), {
      target: { value: '100' }
    });
    fireEvent.click(screen.getByText('Acumular'));
  };

  test('submits successfully (200)', async () => {
    const accumulateMock = jest
      .spyOn(transactionService, 'accumulatePoints')
      .mockResolvedValue(getMockResponse('accumulations', 'success'));

    await setup();

    await waitFor(() => {
      expect(accumulateMock).toHaveBeenCalledWith(
        {
          documentNumber: '12345678',
          identificationTypeId: 1,
          value: 100
        },
        'sale',
        'office-1'
      );
    });
  });

  test('shows error for 400 BAD REQUEST', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 400, data: getMockResponse('common', 'badrequest') },
    });

    await setup();

    expect(await screen.findByText(/Solicitud inválida/i)).toBeInTheDocument();
  });

  test('shows error for 401 UNAUTHORIZED', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 401 },
    });

    await setup();

    expect(await screen.findByText(/No autorizado/i)).toBeInTheDocument();
  });

  test('shows error for 403 FORBIDDEN', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 403 },
    });

    await setup();

    expect(await screen.findByText(/Acceso denegado/i)).toBeInTheDocument();
  });

  test('shows error for 404 NOT FOUND', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 404 },
    });

    await setup();

    expect(await screen.findByText(/No se pudo completar la operación/i)).toBeInTheDocument();
  });
});
