// src/components/RedemptionForm/__tests__/RedemptionForm.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import RedemptionForm from '../RedemptionForm';
import { renderWithProviders } from '../../../test-utils';
import type { TransactionApiResponse } from '../../../types/Transaction';
import * as otpService from '../../../services/otpService';
import * as transactionService from '../../../services/transactionService';

const mockTransactionResponse: TransactionApiResponse = {
  type: 'success',
  status: 'processed',
};

jest.mock('../../../services/otpService');
jest.mock('../../../services/transactionService');

jest.mock('../../../services/axiosInstance', () => {
    return {
      default: {
        post: jest.fn(() => Promise.resolve({ data: { token: 'mock-token' } })),
      },
    };
});

describe('RedemptionForm', () => {
    test('renders fields and submits redemption', async () => {
        const sendOtpMock = jest.spyOn(otpService, 'sendOtp').mockResolvedValue({
        type: 'success',
        otp: '123456',
        });

        const redeemMock = jest
    .spyOn(transactionService, 'redeemPoints')
    .mockResolvedValue(mockTransactionResponse);

    renderWithProviders(<RedemptionForm />);

    // Simula ingreso de número y puntos
    fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), {
      target: { value: '3001234567' }
    });

    fireEvent.change(screen.getByPlaceholderText(/Puntos/i), {
      target: { value: '200' }
    });

    // Click en el primer botón “Redimir” para solicitar OTP
    fireEvent.click(screen.getByText('Redimir'));

    // Espera a que aparezca el campo de OTP
    const otpInput = await screen.findByPlaceholderText(/Código OTP/i);

    // Simula ingreso de OTP
    fireEvent.change(otpInput, {
      target: { value: '123456' }
    });

    // Confirmar redención
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(sendOtpMock).toHaveBeenCalledWith({ phoneNumber: '3001234567' });

      expect(redeemMock).toHaveBeenCalledWith({
        phoneNumber: '3001234567',
        identificationTypeId: 1,
        otpCode: '123456',
        points: 200
      });
    });
  });
});
