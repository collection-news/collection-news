import { beforeEach, expect, it, vi } from 'vitest'

async function search(query: string) {
  const { searchClient } = await import('../../src/utils/searchClient')
  // The SDK exposes a union of incompatible Algolia 4/5 signatures; this app uses the array form.
  const classicSearch = searchClient.search as (
    requests: { indexName: string; params: { query: string } }[]
  ) => Promise<{ results: { hits: unknown[]; nbHits: number }[] }>
  return classicSearch([{ indexName: 'apple-articles', params: { query } }])
}

beforeEach(() => {
  vi.resetModules()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

it('encodes CJK queries through the same-origin GET proxy and adapts results', async () => {
  const upstream = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json({
      results: [
        {
          indexUid: 'apple-articles',
          hits: [],
          query: '香港',
          processingTimeMs: 0,
          limit: 21,
          offset: 0,
          estimatedTotalHits: 0,
          facetDistribution: {},
        },
      ],
    })
  )
  const result = await search('香港')
  expect(result.results[0]).toMatchObject({ hits: [], nbHits: 0 })
  const [url, options] = upstream.mock.calls[0]
  expect(options).toEqual({ method: 'GET' })
  const parsed = new URL(String(url), 'http://localhost')
  expect(parsed.pathname).toBe('/api/multi-search')
  const decoded = JSON.parse(Buffer.from(parsed.searchParams.get('q')!, 'base64').toString())
  const requests = upstream.mock.calls.map(([url]) =>
    JSON.parse(Buffer.from(new URL(String(url), 'http://localhost').searchParams.get('q')!, 'base64').toString())
  )
  expect(decoded.queries[0].indexUid).toBe('apple-articles')
  expect(requests.some(body => body.queries.some((query: { q?: string }) => query.q === '香港'))).toBe(true)
})

it('propagates a network rejection to the caller', async () => {
  const failure = new Error('offline')
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(failure)
  await expect(search('offline')).rejects.toThrow('Request to https://example.com/multi-search has failed')
  expect(console.error).toHaveBeenCalledWith(failure)
})

it('rejects HTTP errors before processing search results', async () => {
  const response = Response.json({ error: 'Internal Server Error' }, { status: 500 })
  const parse = vi.spyOn(response, 'json')
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
  await expect(search('unavailable')).rejects.toThrow('Request to https://example.com/multi-search has failed')
  expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'Search request failed (500)' }))
  expect(parse).not.toHaveBeenCalled()
})
