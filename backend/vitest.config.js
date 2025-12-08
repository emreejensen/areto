import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './__tests__/setup.js',  // ← Change this path
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});