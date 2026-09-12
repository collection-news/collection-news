import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

// Explicitly invoked live lane only. Reuses existing credentials without setup or writes.
dotenv.config({ path: '.env.local', quiet: true })

export default defineConfig({
  testDir: './tests/live',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  outputDir: 'test-results/live',
})
