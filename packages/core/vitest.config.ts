import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import env from 'vite-plugin-env-compatible';
import checker from 'vite-plugin-checker';
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './tests/coverage',
      
    },
    testTimeout: 50000, 
    hookTimeout: 50000,
    include: ['tests/**/*.test.ts'],
  },
  plugins: [env()],
  resolve: {
    alias: {
      '@repo/core': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
});
