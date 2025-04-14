// src/enableMocking.ts
export async function enableMocking(): Promise<void> {
  if (import.meta.env.DEV) {
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
  } else {
    console.log('[MSW] Skipped (not in development mode)');
  }
}

navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
