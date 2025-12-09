import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import { base64Encode } from './searchQuery'

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
      try {
        let proxyPath = '/api/multi-search'

        if (opts?.body) {
          // Encode the body to Base64 and append it as a query parameter for caching purposes
          // Use URI-safe encoding so `+`/`/`/`=` don't get mangled by query parsing.
          const encodedBody = base64Encode(opts.body as string)
          proxyPath += `?q=${encodedBody}`
        }

        const response = await fetch(proxyPath, {
          method: 'GET',
        })
        return await response.json()
      } catch (e) {
        console.error(e)
        throw e
      }
    },
  }
)
