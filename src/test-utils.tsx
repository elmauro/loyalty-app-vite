// src/__tests__/test-utils.tsx
import { render } from '@testing-library/react';
import { AuthProvider } from './store/AuthContext';
import { OfficeProvider } from './contexts/OfficeContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

export function renderWithProviders(ui: React.ReactElement, options?: { withOfficeProvider?: boolean }) {
  let content = ui;
  if (options?.withOfficeProvider) {
    content = <OfficeProvider>{ui}</OfficeProvider>;
  }
  return render(
    <BrowserRouter>
      <AuthProvider>
        {content}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
