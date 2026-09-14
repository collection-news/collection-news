import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, apiResponse } from '../support/api'

vi.mock('../../src/services/dynamo', () => ({ getArticlesByDateAndCat: vi.fn() }))
import { getArticlesByDateAndCat } from '../../src/services/dynamo'
import handler from '../../src/pages/api/article'

const listing = vi.mocked(getArticlesByDateAndCat)
const cursorKey = { articleId: 'last', publishDate: '20211229', publishTimestamp: '2021-12-29T10:00:00Z' }
const encodeCursor = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64')
const cursor = encodeCursor(cursorKey)
const empty = { articles: [], hasMore: false, nextCursor: null }

beforeEach(() => {
  listing.mockReset().mockResolvedValue(empty)
})

describe('article API contract', () => {
  it.each(['POST', 'PUT', 'DELETE', 'PATCH'])('rejects %s without touching the data service', async method => {
    const { res, response } = apiResponse()
    await handler(apiRequest({ method }), res)
    expect(response.statusCode).toBe(405)
    expect(listing).not.toHaveBeenCalled()
  })

  it('applies default publisher and video filtering and returns the listing', async () => {
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ query: { publishDate: '20210623' } }), res)
    expect(listing).toHaveBeenCalledWith(
      { media: 'appledaily', publishDate: '20210623', category: undefined, getVideo: false },
      { limit: undefined, nextCursor: undefined, order: undefined }
    )
    expect(response.statusCode).toBe(200)
    expect(response.json).toHaveBeenCalledWith(empty)
    expect(headers.get('cache-control')).toBe('public, max-age=604800, s-maxage=604800, immutable')
  })

  it('coerces and forwards supported query parameters', async () => {
    const { res } = apiResponse()
    await handler(
      apiRequest({
        query: {
          media: 'thestandnews',
          publishDate: '20211229',
          category: 'politics',
          getVideo: 'true',
          limit: '2',
          order: 'asc',
          nextCursor: cursor,
        },
      }),
      res
    )
    expect(listing).toHaveBeenCalledWith(
      { media: 'thestandnews', publishDate: '20211229', category: 'politics', getVideo: true },
      { limit: 2, order: 'asc', nextCursor: cursor }
    )
  })

  it.each([
    {},
    { publishDate: '20210623', order: 'sideways' },
    { publishDate: '20210623', limit: 'many' },
    { publishDate: '20210623', getVideo: 'perhaps' },
    { publishDate: ['20210623', '20210624'] },
  ])('returns 400 for schema-invalid parameters %j', async query => {
    const { res, response } = apiResponse()
    await handler(apiRequest({ query }), res)
    expect(response.statusCode).toBe(400)
    expect(listing).not.toHaveBeenCalled()
  })

  it.each([
    { media: 'invalid' },
    { media: '' },
    { publishDate: 'not-a-date' },
    { publishDate: '20210229' },
    { publishDate: '20211301' },
    { publishDate: 'x20210623' },
    { publishDate: '202106230' },
    { publishDate: '20011231' },
    { publishDate: '20210625' },
    { media: 'thestandnews', publishDate: '20141225' },
    { category: 'politics' },
    { category: '' },
    { limit: '-1' },
    { limit: '0' },
    { limit: '37' },
    { limit: '1.5' },
    { limit: 'Infinity' },
    { limit: '1e1' },
    { limit: '' },
    { unknown: 'value' },
    { year: '2020' },
    { year: ['2021', '2021'] },
    { media: ['appledaily', 'appledaily'] },
    { category: ['local', 'local'] },
    { limit: ['1', '2'] },
    { order: ['asc', 'desc'] },
    { getVideo: ['true', 'false'] },
    { nextCursor: ['one', 'two'] },
    { nextCursor: 'not base64' },
    { nextCursor: '' },
    { nextCursor: 'A'.repeat(4097) },
    { nextCursor: encodeCursor(null) },
    { nextCursor: encodeCursor([]) },
    { nextCursor: encodeCursor({}) },
    { nextCursor: cursor },
    { nextCursor: encodeCursor({ ...cursorKey, publishDate: '20210623', articleId: 123 }) },
    { nextCursor: encodeCursor({ ...cursorKey, publishDate: '20210623', publishTimestamp: null }) },
    { nextCursor: encodeCursor({ ...cursorKey, publishDate: '20210623', articleId: '' }) },
    { nextCursor: encodeCursor({ ...cursorKey, publishDate: '20210623', extra: 'value' }) },
    { nextCursor: encodeCursor({ ...cursorKey, publishDate: '20210623', articleId: '界'.repeat(700) }) },
  ])('rejects invalid input before database work: %j', async overrides => {
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ query: { publishDate: '20210623', ...overrides } }), res)
    expect(response.statusCode).toBe(400)
    expect(response.json).toHaveBeenCalledWith({ error: 'Invalid article query' })
    expect(headers.get('cache-control')).toBe('no-store')
    expect(listing).not.toHaveBeenCalled()
  })

  it.each([
    { publishDate: '20020101' },
    { publishDate: '20210624', category: 'local', getVideo: 'true' },
    { publishDate: '20200229', year: '2020', category: 'local' },
    { media: 'thestandnews', publishDate: '20141226' },
    { media: 'thestandnews', publishDate: '20211229', category: 'politics', nextCursor: cursor },
    { publishDate: '20210623', limit: '36', getVideo: '1' },
    { publishDate: '20210623', limit: '1', getVideo: '0' },
  ])('preserves valid archive and history requests: %j', async query => {
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ query }), res)
    expect(response.statusCode).toBe(200)
    expect(listing).toHaveBeenCalledOnce()
    expect(listing.mock.calls[0][0]).not.toHaveProperty('year')
    expect(headers.get('cache-control')).toContain('max-age=604800')
  })

  it('returns a sanitized 503 for dependency failure', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    listing.mockRejectedValue(new Error('private database details'))
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ query: { publishDate: '20210623' } }), res)
    expect(response.statusCode).toBe(503)
    expect(response.json).toHaveBeenCalledWith({ error: 'Article service unavailable' })
    expect(headers.get('cache-control')).toBe('no-store')
    expect(log).toHaveBeenCalledWith('Article lookup failed', expect.any(Error))
  })
})
