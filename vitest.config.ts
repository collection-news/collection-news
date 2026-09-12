import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          setupFiles: ['tests/setup/node.ts'],
          include: ['src/**/*.test.ts', 'tests/{unit,server,harness}/**/*.test.{ts,mjs}'],
        },
      },
      {
        test: {
          name: 'components',
          environment: 'jsdom',
          setupFiles: ['tests/setup/node.ts', 'src/test/setupTests.ts', 'tests/setup/dom.ts'],
          include: ['tests/components/**/*.test.tsx'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'cache-handler.mjs'],
      exclude: ['src/**/*.d.ts', 'src/**/__tests__/**', 'src/test/**', 'src/types/{article,api,mediaMeta}.ts'],
      thresholds: {
        statements: 66,
        branches: 61,
        functions: 56,
        lines: 67,
        'src/services/dynamo.ts': { statements: 95, branches: 85, functions: 100, lines: 100 },
        'src/utils/*.ts': { statements: 100, branches: 90, functions: 100, lines: 100 },
        'src/pages/api/**/*.ts': { statements: 95, branches: 85, functions: 85, lines: 95 },
        'cache-handler.mjs': { statements: 100, branches: 100, functions: 100, lines: 100 },
      },
    },
  },
})
