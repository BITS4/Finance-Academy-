import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{spec,test}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/domain/**/*.{js,ts}', 'src/services/**/*.{js,ts}', 'server/**/*.ts'],
      exclude: ['**/*.{spec,test}.{js,jsx,ts,tsx}', 'server/index.ts'],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
