import { test, expect } from '@playwright/test'
import { media } from '../../src/constants/media'
import { installReadOnlyDynamoGuard } from '../support/read-only-dynamo'

// No browser or Next server is started: a GET to a generated page could write an ISR cache.
// Read the real adapter directly, with middleware allowing only Query and GetItem.
installReadOnlyDynamoGuard()

for (const [publisher, date] of [
  [media.APPLE_DAILY, '20210623'],
  [media.THE_STAND_NEWS, '20211228'],
] as const) {
  test(`${publisher}: real archive query and article read`, async () => {
    const { getArticlesByDateAndCat, getArticle } = await import('../../src/services/dynamo')
    const listing = await getArticlesByDateAndCat({ media: publisher, publishDate: date }, { limit: 1 })
    expect(listing.articles.length).toBeGreaterThan(0)
    const first = listing.articles[0]
    expect(first.media).toBe(publisher)
    expect(first.publishDate).toBe(date)
    const article = await getArticle({ media: publisher, articleId: first.articleId })
    expect(article?.articleId).toBe(first.articleId)
    expect(article?.title).toBe(first.title)
    expect(article?.type).toBe('story')
    if (article?.type === 'story') expect(article.contentElements.length).toBeGreaterThan(0)
  })

  test(`${publisher}: real continuation cursor and terminal contract`, async () => {
    const { getArticlesByDateAndCat } = await import('../../src/services/dynamo')
    const listing = await getArticlesByDateAndCat({ media: publisher, publishDate: date }, { limit: 1 })
    expect(listing.hasMore).toBe(listing.nextCursor !== null)
    if (listing.nextCursor) {
      const next = await getArticlesByDateAndCat(
        { media: publisher, publishDate: date },
        { limit: 1, nextCursor: listing.nextCursor }
      )
      const previousIds = new Set(listing.articles.map(article => article.articleId))
      expect(next.articles.every(article => !previousIds.has(article.articleId))).toBe(true)
      expect(next.hasMore).toBe(next.nextCursor !== null)
    }
  })

  test(`${publisher}: real sitemap ID projection`, async () => {
    const { getArticleIds } = await import('../../src/services/dynamo')
    const response = await getArticleIds({ media: publisher, date }, { nextCursor: null })
    expect(response.ids.length).toBeGreaterThan(0)
    expect(response.ids.every(id => typeof id === 'string' && id.length > 0)).toBe(true)
    expect(new Set(response.ids).size).toBe(response.ids.length)
    expect(response.hasMore).toBe(response.nextCursor !== null)
  })
}
