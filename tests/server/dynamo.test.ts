import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gzipSync } from 'node:zlib'
import { media } from '../../src/constants/media'
import { story, video } from '../fixtures/articles'

const sdk = vi.hoisted(() => ({ get: vi.fn(), query: vi.fn() }))
vi.mock('@aws-sdk/lib-dynamodb', () => ({ DynamoDBDocument: { from: () => sdk } }))

import {
  getArticle,
  getArticleIds,
  getArticlesByDateAndCat,
  getLatestGoogleIndexCount,
} from '../../src/services/dynamo'

const request = { media: media.APPLE_DAILY, publishDate: '20210623' }
const lastKey = { articleId: 'last', publishDate: '20210623', publishTimestamp: '2021-06-23T10:00:00Z' }
const cursor = Buffer.from(JSON.stringify(lastKey)).toString('base64')

beforeEach(() => {
  sdk.get.mockReset()
  sdk.query.mockReset()
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('DynamoDB article reads', () => {
  it.each([
    [media.APPLE_DAILY, 'test-apple'],
    [media.THE_STAND_NEWS, 'test-stand'],
  ])('reads %s using the correct table and article key', async (publisher, table) => {
    sdk.get.mockResolvedValue({ Item: story({ media: publisher }) })
    const article = await getArticle({ media: publisher, articleId: 'fixture-story' })
    expect(sdk.get).toHaveBeenCalledWith({ TableName: table, Key: { articleId: 'fixture-story' } })
    expect(article?.title).toBe('Archive fixture story')
  })

  it('returns undefined for an absent article', async () => {
    sdk.get.mockResolvedValue({})
    expect(await getArticle({ media: media.APPLE_DAILY, articleId: 'missing' })).toBeUndefined()
  })

  it('does not query for an unsupported publisher', async () => {
    expect(await getArticle({ media: 'invalid' as media, articleId: 'missing' })).toBeUndefined()
    expect(sdk.get).not.toHaveBeenCalled()
  })

  it('decompresses a stored article body', async () => {
    const contentElements = [{ type: 'text', content: 'Compressed body' }]
    sdk.get.mockResolvedValue({ Item: story({ contentElementsGziped: gzipSync(JSON.stringify(contentElements)) }) })
    const article = await getArticle({ media: media.APPLE_DAILY, articleId: 'fixture-story' })
    expect(article).toMatchObject({ contentElements })
    expect(article).not.toHaveProperty('contentElementsGziped')
  })

  it('preserves video articles', async () => {
    sdk.get.mockResolvedValue({ Item: video() })
    expect(await getArticle({ media: media.APPLE_DAILY, articleId: 'fixture-video' })).toEqual(video())
  })

  it('rejects a corrupt stored body without preventing subsequent article reads', async () => {
    sdk.get
      .mockResolvedValueOnce({ Item: story({ contentElementsGziped: Buffer.from('corrupt') }) })
      .mockResolvedValueOnce({ Item: story() })
    const key = { media: media.APPLE_DAILY, articleId: 'fixture-story' }
    await expect(getArticle(key)).rejects.toThrow()
    await expect(getArticle(key)).resolves.toMatchObject({ articleId: key.articleId })
  })

  it('propagates a database rejection', async () => {
    sdk.get.mockRejectedValue(new Error('read unavailable'))
    await expect(getArticle({ media: media.APPLE_DAILY, articleId: 'fixture-story' })).rejects.toThrow(
      'read unavailable'
    )
  })
})

describe('DynamoDB listing and continuation', () => {
  it('queries the date index in descending order and excludes videos by default', async () => {
    sdk.query.mockResolvedValue({ Items: [story()] })
    const result = await getArticlesByDateAndCat(request)
    expect(sdk.query).toHaveBeenCalledWith({
      TableName: 'test-apple',
      IndexName: 'DateTimeIndex',
      Limit: 36,
      KeyConditionExpression: 'publishDate = :publishDate',
      ScanIndexForward: false,
      ExpressionAttributeNames: { '#T': 'type' },
      ExpressionAttributeValues: { ':publishDate': '20210623', ':articleType': 'story' },
      FilterExpression: '#T = :articleType',
    })
    expect(result).toMatchObject({ hasMore: false, nextCursor: null, articles: [{ articleId: 'fixture-story' }] })
  })

  it.each([
    [false, undefined, '#T = :articleType'],
    [false, 'local', '#T = :articleType and category = :category'],
    [true, undefined, undefined],
    [true, 'local', 'category = :category'],
  ])('applies getVideo=%s and category=%s', async (getVideo, category, filter) => {
    sdk.query.mockResolvedValue({ Items: [] })
    await getArticlesByDateAndCat({ ...request, getVideo, category })
    const query = sdk.query.mock.calls[0][0]
    expect(query.FilterExpression).toBe(filter)
    expect(query.ExpressionAttributeValues[':category']).toBe(category)
    expect(query.ExpressionAttributeValues[':articleType']).toBe(getVideo ? undefined : 'story')
  })

  it('uses the Stand News table and requested ascending order', async () => {
    sdk.query.mockResolvedValue({ Items: [] })
    await getArticlesByDateAndCat({ ...request, media: media.THE_STAND_NEWS }, { order: 'asc' })
    expect(sdk.query).toHaveBeenCalledWith(expect.objectContaining({ TableName: 'test-stand', ScanIndexForward: true }))
  })

  it('round-trips the continuation key into the next read', async () => {
    sdk.query.mockResolvedValue({ Items: [story()], LastEvaluatedKey: lastKey })
    const first = await getArticlesByDateAndCat(request, { limit: 1 })
    expect(first).toMatchObject({ hasMore: true, nextCursor: cursor })
    sdk.query.mockResolvedValue({ Items: [] })
    await getArticlesByDateAndCat(request, { nextCursor: first.nextCursor! })
    expect(sdk.query).toHaveBeenLastCalledWith(expect.objectContaining({ ExclusiveStartKey: lastKey }))
  })

  it('continues after an empty filtered batch and combines subsequent batches in order', async () => {
    sdk.query
      .mockResolvedValueOnce({ Items: [], LastEvaluatedKey: lastKey })
      .mockResolvedValueOnce({ Items: [story({ articleId: 'one' })], LastEvaluatedKey: { articleId: 'one' } })
      .mockResolvedValueOnce({ Items: [story({ articleId: 'two' })] })
    const result = await getArticlesByDateAndCat(request)
    expect(sdk.query).toHaveBeenCalledTimes(3)
    expect(result.articles.map(article => article.articleId)).toEqual(['one', 'two'])
    expect(result).toMatchObject({ hasMore: false, nextCursor: null })
  })

  it('stops once the requested minimum is collected, preserving the final cursor', async () => {
    sdk.query
      .mockResolvedValueOnce({ Items: [story({ articleId: 'one' })], LastEvaluatedKey: lastKey })
      .mockResolvedValueOnce({ Items: [story({ articleId: 'two' })], LastEvaluatedKey: { articleId: 'two' } })
    const result = await getArticlesByDateAndCat(request, { limit: 2 })
    expect(sdk.query).toHaveBeenCalledTimes(2)
    expect(result.articles).toHaveLength(2)
    expect(JSON.parse(Buffer.from(result.nextCursor!, 'base64').toString())).toEqual({ articleId: 'two' })
  })

  it('characterizes limit as a minimum batch target rather than an exact page size', async () => {
    sdk.query.mockResolvedValue({ Items: [story(), story({ articleId: 'second' })], LastEvaluatedKey: lastKey })
    expect((await getArticlesByDateAndCat(request, { limit: 1 })).articles).toHaveLength(2)
    expect(sdk.query).toHaveBeenCalledTimes(1)
  })

  it('normalizes missing Items to an empty result', async () => {
    sdk.query.mockResolvedValue({})
    expect(await getArticlesByDateAndCat(request)).toEqual({ articles: [], hasMore: false, nextCursor: null })
  })

  it('rejects a malformed cursor before issuing a read', async () => {
    await expect(getArticlesByDateAndCat(request, { nextCursor: 'not-json' })).rejects.toThrow()
    expect(sdk.query).not.toHaveBeenCalled()
  })

  it('propagates a failure during continuation instead of silently truncating the list', async () => {
    sdk.query
      .mockResolvedValueOnce({ Items: [], LastEvaluatedKey: lastKey })
      .mockRejectedValueOnce(new Error('offline'))
    await expect(getArticlesByDateAndCat(request)).rejects.toThrow('offline')
  })

  it('characterizes the existing phantom continuation for an unsupported publisher (LEGACY-01)', async () => {
    const result = await getArticlesByDateAndCat({ ...request, media: 'invalid' as media })
    expect(result).toEqual({ articles: [], hasMore: true, nextCursor: Buffer.from('{}').toString('base64') })
    expect(sdk.query).not.toHaveBeenCalled()
  })
})

describe('sitemap and Google index reads', () => {
  it('projects article IDs and passes the continuation cursor', async () => {
    sdk.query.mockResolvedValue({ Items: [{ articleId: 'one' }], LastEvaluatedKey: lastKey })
    const result = await getArticleIds({ date: '20210623', media: media.APPLE_DAILY }, { nextCursor: cursor })
    expect(sdk.query).toHaveBeenCalledWith(
      expect.objectContaining({ ProjectionExpression: 'articleId', ExclusiveStartKey: lastKey })
    )
    expect(result).toEqual({ ids: ['one'], hasMore: true, nextCursor: cursor })
  })

  it('returns a terminal empty ID result for an invalid publisher without a read', async () => {
    expect(await getArticleIds({ date: '20210623', media: 'invalid' as media }, { nextCursor: null })).toEqual({
      ids: [],
      hasMore: false,
      nextCursor: null,
    })
    expect(sdk.query).not.toHaveBeenCalled()
  })

  it('handles an empty final ID page', async () => {
    sdk.query.mockResolvedValue({})
    expect(await getArticleIds({ date: '20210623', media: media.THE_STAND_NEWS }, { nextCursor: null })).toEqual({
      ids: [],
      hasMore: false,
      nextCursor: null,
    })
  })

  it('reads the most recent index count', async () => {
    sdk.query.mockResolvedValue({ Items: [{ searchInformation: { totalResults: 1234 } }] })
    expect(await getLatestGoogleIndexCount()).toBe(1234)
    expect(sdk.query).toHaveBeenCalledWith(
      expect.objectContaining({ TableName: 'test-index', Limit: 1, ScanIndexForward: false })
    )
  })

  it('defaults an absent index count to zero', async () => {
    sdk.query.mockResolvedValue({})
    expect(await getLatestGoogleIndexCount()).toBe(0)
  })
})
