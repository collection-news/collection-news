import type { NextApiRequest } from 'next'
import * as yup from 'yup'
import { media } from '../constants/media'
import { mediaMap } from '../constants/mediaMeta'
import type { DynamoDBOption, GetArticlesByDateAndCatRequest } from '../types/api'

const MAX_PAGE_SIZE = 36
const MAX_CURSOR_LENGTH = 4096

type ArticleQuery = GetArticlesByDateAndCatRequest & DynamoDBOption

const articleQuerySchema = yup
  .object({
    media: yup.string<media>().oneOf(Object.values(media)),
    publishDate: yup.string().required().test('calendar-date', 'Invalid calendar date', isCalendarDate),
    category: yup.string(),
    getVideo: yup.string().oneOf(['true', 'false', '1', '0']),
    limit: yup
      .string()
      .matches(/^[0-9]{1,2}$/)
      .test(
        'page-size',
        'Invalid page size',
        value => value === undefined || (Number(value) >= 1 && Number(value) <= MAX_PAGE_SIZE)
      ),
    order: yup.string<'asc' | 'desc'>().oneOf(['asc', 'desc']),
    nextCursor: yup.string().min(1).max(MAX_CURSOR_LENGTH),
    year: yup.string(),
  })
  .strict()
  .noUnknown()
  // Reject duplicate query parameters (arrays) and explicitly supplied undefined values.
  .test('scalar-parameters', 'Expected string parameters', params =>
    Object.values(params).every(value => typeof value === 'string')
  )
  .test('archive-query', 'Invalid archive query', params => {
    // Object tests can run before field validation, so guard cross-field operations.
    if (typeof params.publishDate !== 'string') return false
    const publisher = mediaMap.find(item => item.key === (params.media ?? media.APPLE_DAILY))
    if (!publisher) return false

    // Category metadata includes real dates beyond the top-level archive range.
    const dates = [publisher.range, ...publisher.categoryList.map(category => category.range)].flat().sort()
    if (params.publishDate < dates[0] || params.publishDate > dates[dates.length - 1]) return false
    if (params.category !== undefined && !publisher.categoryList.some(item => item.engName === params.category))
      return false
    // Existing history pages send this redundant field, including from cached builds.
    if (params.year !== undefined && params.year !== params.publishDate.slice(0, 4)) return false
    return (
      params.nextCursor === undefined ||
      (typeof params.nextCursor === 'string' && isArticleCursor(params.nextCursor, params.publishDate))
    )
  })

export function parseArticleQuery(query: NextApiRequest['query']): ArticleQuery | null {
  try {
    const params = articleQuerySchema.validateSync(query)
    return {
      media: params.media ?? media.APPLE_DAILY,
      publishDate: params.publishDate,
      category: params.category,
      getVideo: params.getVideo === 'true' || params.getVideo === '1',
      order: params.order,
      limit: params.limit === undefined ? undefined : Number(params.limit),
      nextCursor: params.nextCursor,
    }
  } catch (error) {
    if (error instanceof yup.ValidationError) return null
    throw error
  }
}

function isCalendarDate(value: string): boolean {
  if (!/^[0-9]{8}$/.test(value)) return false
  const isoDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === isoDate
}

function isArticleCursor(encoded: string, publishDate: string): boolean {
  if (!encoded || encoded.length > MAX_CURSOR_LENGTH) return false
  const bytes = Buffer.from(encoded, 'base64')
  // Node's decoder tolerates malformed input; accept the format our API emits.
  if (bytes.toString('base64') !== encoded) return false
  try {
    const key: unknown = JSON.parse(bytes.toString('utf8'))
    if (!key || typeof key !== 'object' || Array.isArray(key)) return false
    const fields = Object.keys(key)
    if (
      fields.length !== 3 ||
      !fields.every(field => ['articleId', 'publishDate', 'publishTimestamp'].includes(field))
    ) {
      return false
    }
    const cursor = key as Record<string, unknown>
    // These are DynamoDB key strings, not an article-ID or timestamp formatting contract.
    return (
      cursor.publishDate === publishDate &&
      isKeyString(cursor.articleId, 2048) &&
      isKeyString(cursor.publishTimestamp, 1024)
    )
  } catch {
    return false
  }
}

function isKeyString(value: unknown, maxBytes: number): boolean {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value, 'utf8') <= maxBytes
}
