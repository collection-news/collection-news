import { once } from 'node:events'
import { gunzipSync } from 'node:zlib'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, apiResponse } from '../support/api'

vi.mock('../../src/services/dynamo', () => ({ getArticleIds: vi.fn() }))
import { getArticleIds } from '../../src/services/dynamo'
import sitemap from '../../src/pages/api/sitemap/[media]/[date]'
import robots from '../../src/pages/api/robots'

beforeEach(() => {
  vi.mocked(getArticleIds).mockReset()
})

describe('sitemap HTTP content', () => {
  it('streams every cursor page as gzip XML with escaped article URLs', async () => {
    vi.mocked(getArticleIds)
      .mockResolvedValueOnce({ ids: ['one', 'two&three'], hasMore: true, nextCursor: 'next' })
      .mockResolvedValueOnce({ ids: ['four'], hasMore: false, nextCursor: null })
    const { res, response, headers, body } = apiResponse()
    const finished = once(response, 'finish')
    await sitemap(apiRequest({ query: { media: 'appledaily', date: '20210623' } }), res)
    await finished
    const xml = gunzipSync(body()).toString()
    expect(xml.match(/<url>/g)).toHaveLength(3)
    expect(xml).toContain('http://localhost:3100/appledaily/articles/one')
    expect(xml).toContain('two&amp;three')
    expect(xml).toContain('/articles/four')
    expect(getArticleIds).toHaveBeenNthCalledWith(2, { media: 'appledaily', date: '20210623' }, { nextCursor: 'next' })
    expect(headers.get('content-type')).toBe('application/xml')
    expect(headers.get('content-encoding')).toBe('gzip')
    expect(headers.get('cache-control')).toContain('immutable')
  })

  it('does not silently emit a partial sitemap when a database read fails', async () => {
    vi.mocked(getArticleIds).mockRejectedValue(new Error('read failed'))
    const { res } = apiResponse()
    await expect(sitemap(apiRequest({ query: { media: 'appledaily', date: '20210623' } }), res)).rejects.toThrow(
      'read failed'
    )
  })

  it('publishes robots content pointing at the root sitemap', async () => {
    const { res, response, headers } = apiResponse()
    await robots(apiRequest(), res)
    expect(response.statusCode).toBe(200)
    expect(headers.get('content-type')).toBe('text/plain')
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Sitemap: http://localhost:3100/sitemap.xml'))
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Disallow: /api/*'))
  })
})
