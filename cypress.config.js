const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    retries: 1,
    defaultCommandTimeout: 20000,
    viewportHeight: 768,
    viewportWidth: 1366,
  },
})
