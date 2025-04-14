// src/components/TransactionHistory/__tests__/TransactionHistory.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionHistory from '../TransactionHistoryForm';
import { renderWithProviders } from '../../../test-utils';
import * as transactionService from '../../../services/transactionService';
import type { Transaction } from '../../../types/Transaction';

jest.mock('../../../services/axiosInstance', () => ({
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

jest.mock('../../../services/transactionService');

describe('TransactionHistory', () => {
  test('renders and fetches transactions', async () => {
    const mockTransaction: Transaction = {
      id: 'abc123',
      detail: 'Compra App',
      transactionDate: '2023-10-04',
      type: 'sale',
      points: 100,
      phoneNumber: '3001234567',
      tenantCode: 'dlt789',
    };

    const mockGetTransactions = jest
      .spyOn(transactionService, 'getTransactions')
      .mockResolvedValue([mockTransaction]);

    renderWithProviders(<TransactionHistory />);

    // Simular inputs
    fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), {
      target: { value: '3001234567' },
    });

    fireEvent.change(screen.getByTestId('startDate'), {
      target: { value: '2023-10-01' },
    });

    fireEvent.change(screen.getByTestId('endDate'), {
      target: { value: '2023-10-10' },
    });

    fireEvent.click(screen.getByText(/Buscar/i));

    // Esperar a que se llame el servicio y aparezca la tabla con datos
    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith(
        '1',
        '3001234567',
        '2023-10-01',
        '2023-10-10'
      );
      expect(screen.getByText(/Compra App/i)).toBeInTheDocument();
    });
  });
});
