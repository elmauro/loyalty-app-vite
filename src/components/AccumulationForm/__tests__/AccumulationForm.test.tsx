// src/components/AccumulationForm/__tests__/AccumulationForm.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AccumulationForm from '../AccumulationForm';
import { renderWithProviders } from '../../../test-utils';
import type { TransactionApiResponse } from '../../../types/Transaction';
import * as transactionService from '../../../services/transactionService';

const mockTransactionResponse: TransactionApiResponse = {
    type: 'success',
    status: 'processed',
  };

jest.mock('../../../services/axiosInstance', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

jest.mock('../../../services/transactionService');

describe('AccumulationForm', () => {
  test('renders form and submits data', async () => {
    const accumulateMock = jest
        .spyOn(transactionService, 'accumulatePoints')
        .mockResolvedValue(mockTransactionResponse);

    renderWithProviders(<AccumulationForm />);

    fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), {
      target: { value: '3001234567' }
    });

    fireEvent.change(screen.getByPlaceholderText(/Valor \$/i), {
      target: { value: '100' }
    });

    fireEvent.click(screen.getByText('Acumular'));

    await waitFor(() => {
      expect(accumulateMock).toHaveBeenCalledWith({
        phoneNumber: '3001234567',
        identificationTypeId: 1,
        value: 100
      });
    });
  });
});
