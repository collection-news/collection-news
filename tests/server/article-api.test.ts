import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, apiResponse } from '../support/api'

vi.mock('../../src/services/dynamo', () => ({ getArticlesByDateAndCat: vi.fn() }))
import { getArticlesByDateAndCat } from '../../src/services/dynamo'
import handler from '../../src/pages/api/article'

const listing = vi.mocked(getArticlesByDateAndCat)
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
          nextCursor: 'cursor',
        },
      }),
      res
    )
    expect(listing).toHaveBeenCalledWith(
      { media: 'thestandnews', publishDate: '20211229', category: 'politics', getVideo: true },
      { limit: 2, order: 'asc', nextCursor: 'cursor' }
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

  it('characterizes weak media/date/limit validation without changing it (LEGACY-02)', async () => {
    const { res, response } = apiResponse()
    await handler(apiRequest({ query: { media: 'invalid', publishDate: 'not-a-date', limit: '-1' } }), res)
    expect(response.statusCode).toBe(200)
    expect(listing).toHaveBeenCalledWith(
      expect.objectContaining({ media: 'invalid', publishDate: 'not-a-date' }),
      expect.objectContaining({ limit: -1 })
    )
  })

  it('characterizes dependency failures as 400 and does not cache them (LEGACY-03)', async () => {
    const error = new Error('database unavailable')
    listing.mockRejectedValue(error)
    const { res, response, headers } = apiResponse()
    await handler(apiRequest({ query: { publishDate: '20210623', nextCursor: 'invalid' } }), res)
    expect(response.statusCode).toBe(400)
    expect(response.json).toHaveBeenCalledWith(error)
    expect(headers.has('cache-control')).toBe(false)
  })
})
