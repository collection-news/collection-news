import { defineConfig } from '@playwright/test'
import config from './playwright.config'

export default defineConfig({
  ...config,
  workers: 1,
  grep: /navigation hydration|landing|OS dark|modal search resets|nested filter Escape|touch or mouse/,
  projects: config.projects?.filter(project => project.name === 'chromium'),
  webServer: {
    command: 'node tests/support/serve-dev-app.mjs',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
