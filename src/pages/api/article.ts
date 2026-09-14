// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getArticlesByDateAndCat } from '../../services/dynamo'
import { parseArticleQuery } from '../../server/article-query'
import type { ArticleListResponse } from '../../types/api'
import { isDev } from '../../utils/config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArticleListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const params = parseArticleQuery(req.query)
  if (!params) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(400).json({ error: 'Invalid article query' })
  }
  try {
    const { media, publishDate, category, nextCursor, limit, order, getVideo } = params
    const resp = await getArticlesByDateAndCat({ media, publishDate, category, getVideo }, { limit, nextCursor, order })
    if (!isDev) {
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable')
    }
    return res.status(200).json(resp)
  } catch (error) {
    console.error('Article lookup failed', error)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'Article service unavailable' })
  }
}
