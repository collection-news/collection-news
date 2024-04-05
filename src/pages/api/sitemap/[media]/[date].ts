import type { NextApiRequest, NextApiResponse } from 'next'
import { createGzip } from 'zlib'
import { SitemapStream } from 'sitemap'
import { getArticleIds } from '../../../../services/dynamo'
import { media } from '../../../../constants/media'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const media = req.query.media as string
  const date = req.query.date as string

  while (hasMore) {
    resp = await getArticleIds({ date, media: media as media }, { nextCursor: nextCursor })
    // write static pages to sitemap
    resp.ids.forEach(id => {
      sitemapStream.write({ url: `/${media}/articles/${id}`, changefreq: 'never', priority: 1 })
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
