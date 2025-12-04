import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

// We use the existing /api/search proxy by using custom httpClient
// so the actual config does not matter
export const { searchClient } = instantMeiliSearch(
  'https://example.com', // just a placeholder
  'placeholder', // just a placeholder
  {
    placeholderSearch: false,
    primaryKey: 'id',
    meiliSearchParams: {
      attributesToHighlight: ['title', 'content'],
    },
    httpClient: async (url, opts) => {
      let proxyPath = (url as URL).pathname === '/multi-search' ? '/api/multi-search' : '/api/search'

      if (opts?.body) {
        // Encode the body to Base64 and append it as a query parameter for caching purposes
        const encodedBody = btoa(opts.body as string)
        proxyPath += `?q=${encodedBody}`
      }

      const response = await fetch(proxyPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: opts?.body,
      })
      return await response.json()
    },
  }
)
