// src/components/AccumulationForm/__tests__/AccumulationForm.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AccumulationForm from '../AccumulationForm';
import { renderWithProviders } from '../../../test-utils';
import { ToastContainer } from 'react-toastify';
import { getMockResponse } from '../../../mocks/mockService';
import * as transactionService from '../../../services/transactionService';

jest.mock('../../../services/axiosInstance', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

jest.mock('../../../services/transactionService');

describe('AccumulationForm', () => {
  const setup = () => {
    renderWithProviders(
      <>
        <AccumulationForm />
        <ToastContainer />
      </>
    );
    fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), {
      target: { value: '3001234567' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Valor \$/i), {
      target: { value: '100' }
    });
    fireEvent.click(screen.getByText('Acumular'));
  };

  test('submits successfully (200)', async () => {
    const accumulateMock = jest
      .spyOn(transactionService, 'accumulatePoints')
      .mockResolvedValue(getMockResponse('accumulations', 'success'));

    setup();

    await waitFor(() => {
      expect(accumulateMock).toHaveBeenCalledWith({
        phoneNumber: '3001234567',
        identificationTypeId: 1,
        value: 100
      });
    });
  });

  test('shows error for 400 BAD REQUEST', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 400, data: getMockResponse('common', 'badrequest') },
    });

    setup();

    expect(await screen.findByText(/Solicitud inválida/i)).toBeInTheDocument();
  });

  test('shows error for 401 UNAUTHORIZED', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 401 },
    });

    setup();

    expect(await screen.findByText(/No autorizado/i)).toBeInTheDocument();
  });

  test('shows error for 403 FORBIDDEN', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 403 },
    });

    setup();

    expect(await screen.findByText(/Acceso denegado/i)).toBeInTheDocument();
  });

  test('shows error for 404 NOT FOUND', async () => {
    jest.spyOn(transactionService, 'accumulatePoints').mockRejectedValue({
      response: { status: 404 },
    });

    setup();

    expect(await screen.findByText(/Recurso no encontrado/i)).toBeInTheDocument();
  });
});
