import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  // ← React plugin for JSX
  test: {
    environment: 'jsdom',  // ← Browser-like environment
    globals: true,
    setupFiles: './__tests__/setup.js',
  },
});