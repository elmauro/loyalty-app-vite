// src/pages/Login/Login.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { renderWithProviders } from '../../../test-utils';
import * as authService from '../../../services/authService';

jest.mock('../../../services/axiosInstance', () => {
  return {
    default: {
      post: jest.fn(() => Promise.resolve({ data: { token: 'mock-token' } })),
    },
  };
});

jest.mock('../../../services/authService');

describe('Login Page', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('shows error when credentials are empty and Sign In is clicked', async () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByText('Sign In'));

    // Puedes mejorar esto con `mockFetch` más adelante o usar MSW
    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });

  test('calls login service with credentials', async () => {
    const mockedLogin = jest.spyOn(authService, 'login').mockResolvedValue({
      token: 'mock-token',
      firstname: 'Test',
      identification: '123',
      identificationTypeId: 1,
      roles: ['user'],
      iscustomer: 1,
      termsaccepted: 1
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Login'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '1234' }
    });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith({
        login: 'testuser',
        pass: '1234',
        loginTypeId: 1,
        identificationTypeId: 1
      })
    );
  });
});
