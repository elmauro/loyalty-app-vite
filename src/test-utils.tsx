// src/__tests__/test-utils.tsx
import { render } from '@testing-library/react';
import { AuthProvider } from './store/AuthContext';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
}
