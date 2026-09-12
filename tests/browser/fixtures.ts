import { test as base, expect } from '@playwright/test'
import { searchResponse, type SearchQuery } from '../fixtures/search'

type Fixtures = {
  searchRequests: SearchQuery[]
  isolation: void
}

export const test = base.extend<Fixtures>({
  searchRequests: async ({ context }, provide) => {
    const requests: SearchQuery[] = []
    await context.route('**/api/multi-search?*', async route => {
      const encoded = new URL(route.request().url()).searchParams.get('q')
      if (!encoded) throw new Error('Missing encoded search query')
      const body = JSON.parse(Buffer.from(encoded, 'base64').toString()) as { queries: SearchQuery[] }
      requests.push(...body.queries)
      await route.fulfill({ json: searchResponse(body.queries) })
    })
    await provide(requests)
  },
  isolation: [
    async ({ context, page, searchRequests: _requests }, runTest) => {
      const errors: string[] = []
      const unexpectedRequests: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error' && /hydration|hydrated|server rendered HTML/i.test(message.text())) {
          errors.push(message.text())
        }
      })
      await context.route('**/*', async route => {
        const url = new URL(route.request().url())
        // WebKit also reports local blob resources through routing; they never leave the browser.
        if (url.protocol === 'blob:' && url.origin === 'http://127.0.0.1:3100') return route.fallback()
        if (['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '3100') return route.fallback()
        if (url.hostname === 'cse.google.com' && url.pathname === '/cse.js') {
          return route.fulfill({
            contentType: 'application/javascript',
            body: '// Third-party widget intentionally excluded from offline tests.',
          })
        }
        if (url.hostname === 'i.creativecommons.org' && route.request().resourceType() === 'image') {
          return route.fulfill({
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
          })
        }
        unexpectedRequests.push(`${route.request().method()} ${url.origin}${url.pathname}`)
        await route.abort('blockedbyclient')
      })
      await runTest()
      expect(unexpectedRequests, 'Unexpected external browser requests').toEqual([])
      expect(errors, 'Unexpected browser exceptions').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
