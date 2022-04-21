import { media } from '../constants/media'
import { Article } from './article'

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
