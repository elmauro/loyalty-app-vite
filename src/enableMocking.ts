// src/enableMocking.ts
// MSW solo se activa cuando VITE_USE_MSW=true (p. ej. al ejecutar Cypress e2e).
// En desarrollo normal (npm run dev) y en producción no se usan mocks.
export async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_USE_MSW !== 'true') {
    return;
  }
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: { scope: '/' },
      },
    });
  } catch (error) {
    console.error('[MSW] Failed to start:', error);
  }
}
