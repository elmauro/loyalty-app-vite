// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Variables de entorno (prefijo VITE_): VITE_API_BASE_AUTH, VITE_API_BASE_APP,
// VITE_PROGRAM_ID, VITE_API_KEY, VITE_TENANT_CODE, VITE_TRANSACTION_TYPE_*,
// VITE_USE_MSW (solo e2e). Ver .env.example
export default defineConfig({
  envPrefix: 'VITE_',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 51730,
    proxy: {
      // Proxy en dev: peticiones a localhost → Vite reenvía al backend.
      // secure: false evita ERR_CERT_DATE_INVALID.
      // configure: reescribe Origin/Referer para evitar 403 por origen localhost.
      '/api': {
        target: 'https://loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://loyaleasy.com/');
          });
        },
      },
      '/otp53rv1c3-1': {
        target: 'https://loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://loyaleasy.com/');
          });
        },
      },
      // POST /income53rv1c3/income → dev.loyaleasy.com (regla explícita para el path completo)
      '/income53rv1c3/income': {
        target: 'https://dev.loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://dev.loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://dev.loyaleasy.com/');
          });
        },
      },
      '/income53rv1c3': {
        target: 'https://dev.loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://dev.loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://dev.loyaleasy.com/');
          });
        },
      },
      '/expense53rv1c3': {
        target: 'https://dev.loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://dev.loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://dev.loyaleasy.com/');
          });
        },
      },
      '/history53rv1c3': {
        target: 'https://dev.loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://dev.loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://dev.loyaleasy.com/');
          });
        },
      },
      '/points53rv1c3': {
        target: 'https://dev.loyaleasy.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://dev.loyaleasy.com');
            proxyReq.setHeader('Referer', 'https://dev.loyaleasy.com/');
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@styles/variables.scss" as *;`
      }
    }
  }
});
