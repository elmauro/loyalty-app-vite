// src/components/RedemptionForm/__tests__/RedemptionForm.test.tsx
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import RedemptionForm from '../RedemptionForm';
import { renderWithProviders } from '../../../test-utils';
import { ToastContainer } from 'react-toastify';
import { getMockResponse } from '../../../mocks/mockService';
import * as otpService from '../../../services/otpService';
import * as transactionService from '../../../services/transactionService';

jest.mock('../../../services/otpService');
jest.mock('../../../services/transactionService');
jest.mock('../../../services/axiosInstance', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: { token: 'mock-token' } })),
  },
}));

describe('RedemptionForm', () => {
  const setupRedemption = async () => {
    renderWithProviders(
      <>
        <RedemptionForm />
        <ToastContainer />
      </>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), {
        target: { value: '3001234567' }
      });

      fireEvent.change(screen.getByPlaceholderText(/Puntos/i), {
        target: { value: '200' }
      });

      fireEvent.click(screen.getByText('Redimir'));
    });

    const otpInput = await screen.findByPlaceholderText(/Código OTP/i);

    await act(async () => {
      fireEvent.change(otpInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByText('Confirmar'));
    });
  };

  test('renders fields and submits redemption successfully (200)', async () => {
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
      type: 'success',
      otp: '123456',
    });

    jest.spyOn(transactionService, 'redeemPoints').mockResolvedValue(getMockResponse('redemptions', 'success'));

    await setupRedemption();

    await waitFor(() => {
      expect(transactionService.redeemPoints).toHaveBeenCalledWith({
        phoneNumber: '3001234567',
        identificationTypeId: 1,
        otpCode: '123456',
        points: 200
      });
    });
  });

  test('shows error for 400 BAD REQUEST', async () => {
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
      type: 'success',
      otp: '123456',
    });

    jest.spyOn(transactionService, 'redeemPoints').mockRejectedValue({
      response: { status: 400, data: getMockResponse('common', 'badrequest') },
    });

    await setupRedemption();

    expect(await screen.findByText(/Solicitud inválida/i)).toBeInTheDocument();
  });

  test('shows error for 401 UNAUTHORIZED', async () => {
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
      type: 'success',
      otp: '123456',
    });

    jest.spyOn(transactionService, 'redeemPoints').mockRejectedValue({
      response: { status: 401, data: getMockResponse('common', 'unauthorized') },
    });

    await setupRedemption();

    expect(await screen.findByText(/No autorizado/i)).toBeInTheDocument();
  });

  test('shows error for 403 FORBIDDEN', async () => {
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
      type: 'success',
      otp: '123456',
    });

    jest.spyOn(transactionService, 'redeemPoints').mockRejectedValue({
      response: { status: 403, data: getMockResponse('common', 'forbidden') },
    });

    await setupRedemption();

    expect(await screen.findByText(/Acceso denegado/i)).toBeInTheDocument();
  });

  test('shows error for 404 NOT FOUND', async () => {
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
      type: 'success',
      otp: '123456',
    });

    jest.spyOn(transactionService, 'redeemPoints').mockRejectedValue({
      response: { status: 404 },
    });

    await setupRedemption();

    expect(await screen.findByText(/Recurso no encontrado/i)).toBeInTheDocument();
  });
});
