// src/pages/Login/Login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';
import { AuthProvider } from '../../../store/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('Login Page', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('shows error when credentials are empty and Sign In is clicked', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Sign In'));

    // Puedes mejorar esto con `mockFetch` más adelante o usar MSW
    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });
});
