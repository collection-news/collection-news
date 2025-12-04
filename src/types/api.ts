import { media } from '../constants/media'
import { Article } from './article'

export type MeiliSearchArticle = {
  id: string
  title: string
  content: string
  publish_date: string
  publish_ts: string
  category: string | null
  author: string | null
  tags: string[]
  media: media
  coverUrl: string | null
}

export type ArticleListResponse = {
  articles: Article[]
  hasMore: boolean
  nextCursor: string | null
}

export type ArticleIdsResponse = {
  ids: string[]
  hasMore: boolean
  nextCursor: string | null
}

export type GetArticlesByDateAndCatRequest = {
  media: media
  publishDate: string
  category?: string
  getVideo?: boolean
}

export type OrderOption = 'asc' | 'desc'

export type DynamoDBOption = {
  limit?: number
  nextCursor?: string
  order?: OrderOption
}

export type HistoryPagePathParams = {
  media: string
  year: string
  category: string
}
export type HistoryPageIndexPathParams = {
  media: string
  year: string
}
