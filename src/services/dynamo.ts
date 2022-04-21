import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import { DynamoDBDocument, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import * as R from 'ramda'

import { Article, BaseArticle } from '../types/article'
import { ArticleIdsResponse, ArticleListResponse, DynamoDBOption, GetArticlesByDateAndCatRequest } from '../types/api'
import { isDev } from '../utils/config'
import { replaceCDNDomainForArticle, unGZipArticle } from '../utils/dbHelper'
import { media } from '../constants/media'

const useProfileCredentials = isDev && !process.env.APP_AWS_ACCESS_KEY_ID && !process.env.APP_AWS_SECRET_ACCESS_KEY

const dynamoClient = new DynamoDBClient({
  region: process.env.APP_AWS_REGION,
  credentials: useProfileCredentials
    ? fromIni({ profile: process.env.DEV_AWS_PROFILE })
    : {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.APP_AWS_SESSION_TOKEN,
      },
})
const ddbDocClient = DynamoDBDocument.from(dynamoClient, { marshallOptions: { removeUndefinedValues: true } })

function mediaToTableName(key: media) {
  switch (key) {
    case media.APPLE_DAILY:
      return process.env.APP_APPLE_DAILY_DYNAMODB_TABLE_NAME
    case media.THE_STAND_NEWS:
      return process.env.APP_THE_STAND_NEWS_DYNAMODB_TABLE_NAME
    default:
      return null
  }
}

export async function getArticle({
  articleId,
  media,
}: {
  articleId: string
  media: media
}): Promise<Article | undefined> {
  const tableName = mediaToTableName(media)
  if (!tableName) return undefined

  const resp = await ddbDocClient.get({
    Key: { articleId },
    TableName: tableName,
  })
  return resp.Item ? unGZipArticle(replaceCDNDomainForArticle(resp.Item as Article)) : resp.Item
}

type LastEvaluatedKeyType = {
  [key: string]: NativeAttributeValue
}

/**
 * Transform the LastEvaluatedKey from DynamoDB using JSON.stringify and base64 encode
 * so that it is easier to carry to client side.
 * @param lastEvaluatedKey DynamoDB raw LastEvaluatedKey
 * @returns string representation of LastEvaluatedKeyType
 */
function lastEvaluatedKey2startKey(lastEvaluatedKey: LastEvaluatedKeyType): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64')
}

/**
 * Reverse of lastEvaluatedKey2startKey
 * @param startKey string representation of LastEvaluatedKeyType
 * @returns DynamoDB raw LastEvaluatedKey
 */
function startKey2lastEvaluatedKey(startKey: string): LastEvaluatedKeyType {
  return JSON.parse(Buffer.from(startKey, 'base64').toString())
}

function convertArticleQueryResp(resp: QueryCommandOutput): ArticleListResponse {
  return {
    articles: ((resp.Items as Article[]) || []).map(replaceCDNDomainForArticle),
    hasMore: !!resp.LastEvaluatedKey,
    nextCursor: resp.LastEvaluatedKey ? lastEvaluatedKey2startKey(resp.LastEvaluatedKey) : null,
  }
}

/**
 * This updated version can sort by publishDate desc and filter
 */
export async function getArticlesByDateAndCat(
  request: GetArticlesByDateAndCatRequest,
  option: DynamoDBOption = {}
): Promise<ArticleListResponse> {
  const resp = await _getArticlesByDateAndCat(request, option)
  return convertArticleQueryResp(resp)
}

const PAGE_SIZE = 18 // Have 1,2,3 as common multiple that fit list view columns
const BATCH_LIMIT = 36

async function _getArticlesByDateAndCat(
  request: GetArticlesByDateAndCatRequest,
  option: DynamoDBOption = {},
  totalCount = 0
): Promise<QueryCommandOutput> {
  const { limit = PAGE_SIZE, order = 'desc', nextCursor } = option
  const { media, publishDate, category, getVideo = false } = request
  console.log('getArticlesByDateAndCat', { ...request, ...option })

  const tableName = mediaToTableName(media)

  if (!tableName) return { Items: [], LastEvaluatedKey: {}, $metadata: {} }

  const input = {
    TableName: tableName,
    IndexName: 'DateTimeIndex',
    ...(getVideo ? {} : { ExpressionAttributeNames: { '#T': 'type' } }),
    ExpressionAttributeValues: {
      ':publishDate': publishDate,
      ...(getVideo ? {} : { ':articleType': 'story' }),
      ...(category ? { ':category': category } : {}),
    },
    Limit: BATCH_LIMIT,
    // Specifies the values that define the range of the retrieved items.
    KeyConditionExpression: 'publishDate = :publishDate',
    ...(nextCursor ? { ExclusiveStartKey: startKey2lastEvaluatedKey(nextCursor) } : {}),
    ScanIndexForward: order === 'asc',
    ...(getVideo
      ? {
          ...(category ? { FilterExpression: 'category = :category' } : {}),
        }
      : { FilterExpression: '#T = :articleType' + (category ? ' and category = :category' : '') }),
  }
  const resp = await ddbDocClient.query(input)
  if (!resp.LastEvaluatedKey || !resp.Items) {
    // No more
    return resp
  }
  const newTotal = totalCount + resp.Items.length
  if (newTotal >= limit) {
    // Enough
    return resp
  }
  const { Items: nextItems, ...rest } = await _getArticlesByDateAndCat(
    request,
    { ...option, nextCursor: lastEvaluatedKey2startKey(resp.LastEvaluatedKey) },
    newTotal
  )
  // merge results
  return {
    Items: [...resp.Items, ...(nextItems ?? [])],
    ...rest,
  }
}

/**
 * Below is the old way to query, keep it here first so someone in the future know that we have this index
 */
// export async function getArticlesByDateAndCat(
//   request: GetArticlesByDateAndCatRequest,
//   option: DynamoDBOption = {}
// ): Promise<ArticleListResponse> {
//   const { limit = PAGE_SIZE, order = 'asc', nextCursor } = option
//   const { media, publishDate, category } = request
//   console.log('getArticlesByDateAndCat', { ...request, ...option })
//   const input = {
//     TableName: mediaToTableName(media),
//     IndexName: 'DateCategoryIndex',
//     ExpressionAttributeValues: {
//       ':publishDate': publishDate,
//       ...(category ? { ':category': category } : {}),
//     },
//     Limit: limit,
//     // Specifies the values that define the range of the retrieved items.
//     KeyConditionExpression: 'publishDate = :publishDate' + (category ? ' and category = :category' : ''),
//     ...(nextCursor ? { ExclusiveStartKey: startKey2lastEvaluatedKey(nextCursor) } : {}),
//     ScanIndexForward: order === 'asc',
//     // FilterExpression: 'contains (Subtitle, :topic)',
//   }
//   const resp = await ddbDocClient.query(input)
//   return convertArticleQueryResp(resp)
// }

function convertArticleIdsQueryResp(resp: QueryCommandOutput): ArticleIdsResponse {
  const rawResp = (resp.Items || []) as Pick<BaseArticle, 'articleId'>[]
  return {
    ids: rawResp.map(_ => _.articleId),
    hasMore: !!resp.LastEvaluatedKey,
    nextCursor: resp.LastEvaluatedKey ? lastEvaluatedKey2startKey(resp.LastEvaluatedKey) : null,
  }
}

export async function getArticleIds(
  request: { date: string; media: media },
  option: { nextCursor: string | null }
): Promise<ArticleIdsResponse> {
  const { date, media } = request
  const tableName = mediaToTableName(media)
  if (!tableName) return { ids: [], hasMore: false, nextCursor: null }
  const { nextCursor } = option
  console.log('getArticleIds', { ...request, ...option })
  const input = {
    TableName: tableName,
    IndexName: 'DateTimeIndex',
    ExpressionAttributeValues: {
      ':publishDate': date,
    },
    // Specifies the values that define the range of the retrieved items.
    KeyConditionExpression: 'publishDate = :publishDate',
    ProjectionExpression: 'articleId',
    ReturnConsumedCapacity: 'TOTAL',
    ...(nextCursor ? { ExclusiveStartKey: startKey2lastEvaluatedKey(nextCursor) } : {}),
    // Filter that returns only episodes that meet previous criteria and have the subtitle 'The Return'
    // FilterExpression: 'contains (Subtitle, :topic)',
  }
  const resp = await ddbDocClient.query(input)
  return convertArticleIdsQueryResp(resp)
}

export async function getLatestGoogleIndexCount(): Promise<number> {
  const input = {
    TableName: process.env.APP_IDX_PROGRESS_TABLE_NAME,
    Limit: 1,
    ExpressionAttributeValues: {
      ':kind': 'customsearch#search',
    },
    // Specifies the values that define the range of the retrieved items.
    KeyConditionExpression: 'kind = :kind',
    ProjectionExpression: 'searchInformation',
    ScanIndexForward: false,
  }
  const resp = await ddbDocClient.query(input)
  const indexedCount = R.pathOr(0, ['Items', 0, 'searchInformation', 'totalResults'])(resp)
  return indexedCount
}
