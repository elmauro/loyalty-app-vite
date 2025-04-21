// src/pages/Login/__tests__/Login.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { renderWithProviders } from '../../../test-utils';
import * as authService from '../../../services/authService';
import { getMockResponse } from '../../../mocks/mockService';

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
    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });

  test('successful login', async () => {
    const mockedLogin = jest.spyOn(authService, 'login').mockResolvedValue(
      getMockResponse('auth', 'successUser')
    );

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'hernan' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        login: 'hernan',
        pass: 'password123',
        loginTypeId: 1,
        identificationTypeId: 1
      });
    });
  });

  test('shows validation error (400)', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue({
      response: {
        status: 400,
        data: getMockResponse('common', 'badrequest')
      }
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });

  test('shows forbidden error (403)', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue({
      response: {
        status: 403,
        data: getMockResponse('common', 'forbidden')
      }
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'blockeduser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(await screen.findByText(/Acceso prohibido/i)).toBeInTheDocument();
  });

  test('shows not found error (404)', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue({
      response: {
        status: 404,
        data: getMockResponse('common', 'notfound')
      }
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'unknownuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(await screen.findByText(/Usuario no encontrado/i)).toBeInTheDocument();
  });
});
