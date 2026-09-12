import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../src/pages/api/multi-search'
import { base64Encode } from '../../src/utils/searchQuery'
import { apiRequest, apiResponse } from '../support/api'

const queries = { queries: [{ indexUid: 'apple-articles', q: '香港', limit: 21 }] }

beforeEach(() => {
  vi.stubEnv('APP_ENABLE_MEILISEARCH', 'true')
  vi.stubEnv('APP_MEILI_HOST', 'https://search.test')
  vi.stubEnv('APP_MEILI_SEARCH_KEY', 'test-search-key')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('search proxy', () => {
  it('returns 404 when disabled without contacting the upstream', async () => {
    vi.stubEnv('APP_ENABLE_MEILISEARCH', 'false')
    const upstream = vi.spyOn(globalThis, 'fetch')
    const { res, response } = apiResponse()
    await handler(apiRequest(), res)
    expect(response.statusCode).toBe(404)
    expect(upstream).not.toHaveBeenCalled()
  })

  it.each(['DELETE', 'PUT', 'PATCH'])('returns 405 and Allow for %s', async method => {
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ method }), res)
    expect(response.statusCode).toBe(405)
    expect(headers.get('allow')).toEqual(['POST', 'GET'])
  })

  it.each(['APP_MEILI_HOST', 'APP_MEILI_SEARCH_KEY'])('fails closed when %s is missing', async key => {
    vi.stubEnv(key, '')
    const upstream = vi.spyOn(globalThis, 'fetch')
    const { res, response } = apiResponse()
    await handler(apiRequest(), res)
    expect(response.statusCode).toBe(500)
    expect(response.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    expect(upstream).not.toHaveBeenCalled()
  })

  it.each(['GET', 'POST'])(
    'forwards %s search as authenticated upstream POST and rewrites cover URLs',
    async method => {
      const upstream = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          results: [
            {
              hits: [
                { id: 'one', media: 'thestandnews', coverUrl: 'https://old.test/image.jpg' },
                { id: 'two', media: 'appledaily', coverUrl: null },
              ],
            },
          ],
        })
      )
      const { res, response, headers } = apiResponse()
      const req =
        method === 'POST'
          ? apiRequest({ method, body: queries })
          : apiRequest({ query: { q: base64Encode(JSON.stringify(queries)) } })
      await handler(req, res)
      expect(upstream).toHaveBeenCalledWith('https://search.test/multi-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-search-key' },
        body: JSON.stringify(queries),
      })
      expect(response.statusCode).toBe(200)
      expect(response.json.mock.calls[0][0]).toEqual({
        results: [
          {
            hits: [
              { id: 'one', media: 'thestandnews', coverUrl: 'https://assets.test/old.test/image.jpg' },
              { id: 'two', media: 'appledaily', coverUrl: null },
            ],
          },
        ],
      })
      expect(headers.get('cache-control')).toBe('public, max-age=3600, s-maxage=604800')
    }
  )

  it.each(['not-json', '%not-encoded'])('rejects malformed encoded query %s before an upstream request', async q => {
    const upstream = vi.spyOn(globalThis, 'fetch')
    const { res, response } = apiResponse()
    await handler(apiRequest({ query: { q } }), res)
    expect(response.statusCode).toBe(400)
    expect(response.json).toHaveBeenCalledWith({ error: 'Invalid query parameter' })
    expect(upstream).not.toHaveBeenCalled()
  })

  it.each([400, 401, 429, 503])('preserves upstream status %s without success cache headers', async status => {
    const body = { message: 'Upstream failure', code: 'fixture_error' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(body, { status }))
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ method: 'POST', body: queries }), res)
    expect(response.statusCode).toBe(status)
    expect(response.json).toHaveBeenCalledWith(body)
    expect(headers.has('cache-control')).toBe(false)
  })

  it('returns a generic 500 for connection refusal', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed: ECONNREFUSED'))
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ method: 'POST', body: queries }), res)
    expect(response.statusCode).toBe(500)
    expect(response.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    expect(headers.has('cache-control')).toBe(false)
  })

  it.each([() => new Response('<html>gateway error</html>'), () => Response.json({ unexpected: 'shape' })])(
    'handles a malformed upstream success response as 500',
    async makeResponse => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse())
      const { res, response } = apiResponse()
      await handler(apiRequest({ method: 'POST', body: queries }), res)
      expect(response.statusCode).toBe(500)
      expect(response.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    }
  )
})
