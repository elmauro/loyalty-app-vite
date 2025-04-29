import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:51730',
    setupNodeEvents(on, config) {
      // Vite support
      on('file:preprocessor', vitePreprocessor());
    },
  },
});
