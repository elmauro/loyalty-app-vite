// src/pages/Login/__tests__/Login.test.tsx
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../Login';
import ForgotPassword from '../../ForgotPassword/ForgotPassword';
import { renderWithProviders } from '../../../test-utils';
import { AuthProvider } from '../../../store/AuthContext';
import { paths } from '../../../routes/paths';
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Número de documento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu contraseña')).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText('Número de documento'), { target: { value: 'hernan' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'password123' } });
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
    fireEvent.change(screen.getByPlaceholderText('Número de documento'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'wrongpass' } });
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
    fireEvent.change(screen.getByPlaceholderText('Número de documento'), { target: { value: 'blockeduser' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'password' } });
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
    fireEvent.change(screen.getByPlaceholderText('Número de documento'), { target: { value: 'unknownuser' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(await screen.findByText(/Usuario no encontrado/i)).toBeInTheDocument();
  });

  test('clears credential error when returning to login from forgot-password', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue({
      response: {
        status: 400,
        data: getMockResponse('common', 'badrequest'),
      },
    });

    render(
      <MemoryRouter initialEntries={[paths.login]}>
        <AuthProvider>
          <Routes>
            <Route path={paths.login} element={<Login />} />
            <Route path={paths.forgotPassword} element={<ForgotPassword />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Número de documento'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Sign In'));
    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Forgot password/i }));
    expect(await screen.findByRole('heading', { name: /Forgot Password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /^Sign in$/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Credenciales inválidas/i)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /^Login$/i })).toBeInTheDocument();
  });
});
