// src/main.tsx

import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './store/AuthContext';
import { enableMocking } from './enableMocking';
import './index.css';

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

// Mocks solo cuando VITE_USE_MSW=true (pruebas e2e). En uso normal se usa el backend real.
enableMocking().then(render);
