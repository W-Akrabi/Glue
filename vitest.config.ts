import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(rootDir),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.ts',
      'tests/integration/**/*.{test,spec}.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['**/node_modules/**', '**/.next/**'],
    },
  },
});
