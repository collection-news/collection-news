import { media } from '../../src/constants/media'
import type {
  ArticleIdsResponse,
  ArticleListResponse,
  DynamoDBOption,
  GetArticlesByDateAndCatRequest,
} from '../../src/types/api'
import type { Article } from '../../src/types/article'
import { richStory, story } from './articles'

const publishers = Object.values(media)
const emptyList: ArticleListResponse = { articles: [], hasMore: false, nextCursor: null }

export function fixtureArticles(publisher: media, date: string, category?: string): Article[] {
  if (!publishers.includes(publisher) || category === 'unknown') return []
  const count = category === 'culture' ? 3 : 24
  return Array.from({ length: count }, (_, index) =>
    story({
      media: publisher,
      articleId: `${publisher}-${date}-${index + 1}`,
      title: `${publisher} archive story ${index + 1}`,
      category: category || (publisher === media.APPLE_DAILY ? 'local' : 'politics'),
      publishDate: date,
      publishTimestamp: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}T10:30:00Z`,
    })
  )
}

function cursorOffset(cursor?: string | null) {
  if (!cursor) return 0
  if (!/^fixture:\d+$/.test(cursor)) throw new Error('Unexpected fixture cursor')
  return Number(cursor.split(':')[1])
}

export async function getArticlesByDateAndCat(
  request: GetArticlesByDateAndCatRequest,
  options: DynamoDBOption = {}
): Promise<ArticleListResponse> {
  if (!publishers.includes(request.media)) return structuredClone(emptyList)
  if (!/^20\d{6}$/.test(request.publishDate)) throw new Error('Unexpected fixture date')
  const articles = fixtureArticles(request.media, request.publishDate, request.category)
  const offset = cursorOffset(options.nextCursor)
  const pageSize = request.category === 'culture' ? 2 : 18
  const page = articles.slice(offset, offset + pageSize)
  const next = offset + page.length
  return {
    articles: page,
    hasMore: next < articles.length,
    nextCursor: next < articles.length ? `fixture:${next}` : null,
  }
}

export async function getArticle(request: { articleId: string; media: media }): Promise<Article | undefined> {
  if (!publishers.includes(request.media) || request.articleId === 'missing') return undefined
  if (request.articleId === 'rich-story') return { ...structuredClone(richStory), media: request.media }
  const match = /^(appledaily|thestandnews)-(20\d{6})-(\d+)$/.exec(request.articleId)
  if (!match || match[1] !== request.media) throw new Error(`Unknown fixture article: ${request.articleId}`)
  return fixtureArticles(request.media, match[2])[Number(match[3]) - 1]
}

export async function getArticleIds(
  request: { date: string; media: media },
  options: { nextCursor: string | null }
): Promise<ArticleIdsResponse> {
  const articles = fixtureArticles(request.media, request.date)
  const offset = cursorOffset(options.nextCursor)
  const ids = articles.slice(offset, offset + 10).map(article => article.articleId)
  const next = offset + ids.length
  return { ids, hasMore: next < articles.length, nextCursor: next < articles.length ? `fixture:${next}` : null }
}

export async function getLatestGoogleIndexCount() {
  return 1234
}
