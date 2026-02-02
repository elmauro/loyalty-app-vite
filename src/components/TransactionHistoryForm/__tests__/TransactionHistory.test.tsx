// src/components/TransactionHistoryForm/__tests__/TransactionHistory.test.tsx
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import TransactionHistory from '../TransactionHistoryForm';
import { renderWithProviders } from '../../../test-utils';
import { getMockResponse } from '../../../mocks/mockService';
import * as transactionService from '../../../services/transactionService';
import { Transaction } from '../../../types/Transaction';
import { BACKEND_CHUNK_SIZE } from '../../../constants/pagination';

jest.mock('../../../services/axiosInstance', () => ({
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

jest.mock('../../../services/transactionService');

describe('TransactionHistory', () => {
  const setupTransactionHistory = async () => {
    renderWithProviders(<TransactionHistory />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Document Number/i), {
        target: { value: '3001234567' },
      });
      fireEvent.change(screen.getByTestId('th-startDate'), {
        target: { value: '2023-10-01' },
      });
      fireEvent.change(screen.getByTestId('th-endDate'), {
        target: { value: '2023-10-10' },
      });
      fireEvent.click(screen.getByText(/Buscar/i));
    });
  };

  test('renders and fetches transactions successfully (200)', async () => {
    const transactions = getMockResponse('transactions', 'success') as Transaction[];
    const mockGetTransactions = jest
      .spyOn(transactionService, 'getTransactions')
      .mockResolvedValue({
        data: transactions,
        total: transactions.length,
        page: 1,
        limit: BACKEND_CHUNK_SIZE,
      });

    await setupTransactionHistory();

    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith(
        '1',
        '3001234567',
        '2023-10-01',
        '2023-10-10',
        1,
        BACKEND_CHUNK_SIZE
      );
      expect(screen.getByText(/Deelite/i)).toBeInTheDocument();
    });
  });

  test('shows error for 401 Unauthorized', async () => {
    jest.spyOn(transactionService, 'getTransactions').mockRejectedValue({
      response: { status: 401, data: getMockResponse('common', 'unauthorized') },
    });

    await setupTransactionHistory();

    expect(await screen.findByText(/Error al consultar transacciones/i)).toBeInTheDocument();
  });

  test('shows error for 403 Forbidden', async () => {
    jest.spyOn(transactionService, 'getTransactions').mockRejectedValue({
      response: { status: 403, data: getMockResponse('common', 'forbidden') },
    });

    await setupTransactionHistory();

    expect(await screen.findByText(/Error al consultar transacciones/i)).toBeInTheDocument();
  });
});
