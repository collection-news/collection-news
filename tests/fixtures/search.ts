import { media } from '../../src/constants/media'
import type { MeiliSearchArticle } from '../../src/types/api'
import { fixtureArticles } from './dynamo'

export type SearchQuery = {
  indexUid: string
  q?: string
  offset?: number
  limit?: number
  filter?: string | (string | string[])[]
  sort?: string[]
  facets?: string[]
}

const documents: MeiliSearchArticle[] = [
  ...fixtureArticles(media.APPLE_DAILY, '20210623'),
  ...fixtureArticles(media.THE_STAND_NEWS, '20211229'),
].map((article, index) => ({
  id: article.articleId,
  title: article.title,
  content: '香港新聞 synthetic archive content',
  publish_date: article.publishDate!,
  publish_ts: String(Date.parse(article.publishTimestamp!)),
  category: index % 2 === 0 ? 'culture' : article.category,
  author: article.author,
  tags: article.tags,
  media: article.media,
  coverUrl: '/test-image.svg',
}))

function matchesClause(document: MeiliSearchArticle, clause: string): boolean {
  if (clause.includes(' AND ')) return clause.split(' AND ').every(part => matchesClause(document, part))
  const facet = /^"?(media|category)"?\s*=\s*"([\w-]+)"$/.exec(clause)
  if (facet) return document[facet[1] as 'media' | 'category'] === facet[2]
  const date = /^publish_date\s*(>=|<=)\s*(\d{8})$/.exec(clause)
  if (date) return date[1] === '>=' ? document.publish_date >= date[2] : document.publish_date <= date[2]
  throw new Error(`Unsupported search fixture filter: ${clause}`)
}

export function searchResponse(queries: SearchQuery[]) {
  return {
    results: queries.map(query => {
      if (query.indexUid !== 'apple-articles') throw new Error(`Unexpected fixture index: ${query.indexUid}`)
      const term = query.q?.toLowerCase() || ''
      const clauses = typeof query.filter === 'string' ? [query.filter] : query.filter || []
      const matches = documents.filter(document => {
        const matchesText = `${document.title} ${document.content}`.toLowerCase().includes(term)
        return (
          matchesText &&
          clauses.every(clause =>
            Array.isArray(clause) ? clause.some(part => matchesClause(document, part)) : matchesClause(document, clause)
          )
        )
      })
      for (const sort of query.sort || []) {
        if (!['publish_ts:asc', 'publish_ts:desc'].includes(sort)) throw new Error(`Unsupported fixture sort: ${sort}`)
        const direction = sort.endsWith(':asc') ? 1 : -1
        matches.sort((left, right) => direction * (Number(left.publish_ts) - Number(right.publish_ts)))
      }
      const offset = query.offset || 0
      const limit = query.limit ?? 20
      const facetDistribution = Object.fromEntries(
        (query.facets || []).map(facet => {
          if (facet !== 'media' && facet !== 'category') throw new Error(`Unsupported fixture facet: ${facet}`)
          const counts: Record<string, number> = {}
          for (const document of matches) {
            const value = document[facet]
            if (value) counts[value] = (counts[value] || 0) + 1
          }
          return [facet, counts]
        })
      )
      return {
        indexUid: query.indexUid,
        query: query.q || '',
        hits: matches.slice(offset, offset + limit).map(document => ({
          ...document,
          _formatted: { title: document.title, content: document.content },
        })),
        processingTimeMs: 0,
        offset,
        limit,
        estimatedTotalHits: matches.length,
        facetDistribution,
      }
    }),
  }
}
