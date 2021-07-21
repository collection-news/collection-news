import type { NextApiRequest, NextApiResponse } from 'next'
import { createGzip } from 'zlib'
import { SitemapStream } from 'sitemap'

import { getArticleIdsByDate } from '../../../services/dynamo'
import { appleDailyCategoryList } from '../../../constants/appleDailyCategory'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // ensure response is XML & gzip encoded
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Content-Encoding', 'gzip')

  const sitemapStream = new SitemapStream({ hostname: process.env.APP_DOMAIN })
  const pipeline = sitemapStream.pipe(createGzip())

  // makes necessary API calls to get all the dynamic
  // urls from user-gen content

  let hasMore = true
  let nextCursor: string | null = null
  let resp
  const date = req.query.date as string

  // sitemapStream.write({ url: `/appledaily/${date}`, changefreq: 'daily', priority: 0.5 })
  // appleDailyCategoryList.forEach(cat => {
  //   sitemapStream.write({ url: `/appledaily/${date}/${cat.category}`, changefreq: 'daily', priority: 0.5 })
  // })

  while (hasMore) {
    resp = await getArticleIdsByDate({ date }, { nextCursor: nextCursor })
    // write static pages to sitemap
    resp.ids.forEach(id => {
      sitemapStream.write({ url: `/appledaily/articles/${id}`, changefreq: 'daily', priority: 1 })
    })
    hasMore = resp.hasMore
    nextCursor = resp.nextCursor
  }

  sitemapStream.end()

  // stream write the response
  pipeline.pipe(res).on('error', (err: Error) => {
    throw err
  })
}
