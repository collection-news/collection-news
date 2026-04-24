const { defineConfig } = require('cypress')

const specPattern = process.env.CI
  ? [
      'cypress/e2e/**/*.cy.js',
      // CI does not have a Meilisearch instance, so keep search E2E local/manual only.
      '!cypress/e2e/search.cy.js',
    ]
  : 'cypress/e2e/**/*.cy.js'

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern,
    retries: 1,
    defaultCommandTimeout: 20000,
    viewportHeight: 768,
    viewportWidth: 1366,
  },
})
