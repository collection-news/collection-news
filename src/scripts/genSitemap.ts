import * as dotenv from 'dotenv'
import { createWriteStream } from 'fs'
import { SitemapIndexStream, SitemapStream } from 'sitemap'

import { getDate } from '../utils/date'
import { mediaMap } from '../constants/mediaMeta'

dotenv.config({ path: '.env.local' })
const APP_DOMAIN = process.env.APP_DOMAIN
console.log(`Generating sitemap for domain:${APP_DOMAIN}`)

function genSitemapIndex(path: string) {
  const smis = new SitemapIndexStream({})
  smis.write({ url: `${APP_DOMAIN}/sitemap_others.xml` })

  mediaMap.forEach(({ key, range }) => {
    const [start, end] = range
    const startDay = getDate(start)
    const endDate = getDate(end)
    let date = startDay
    while (!date.isAfter(endDate)) {
      smis.write({ url: `${APP_DOMAIN}/sitemap/${key}/${date.format('YYYYMMDD')}.xml` })
      date = date.add(1, 'day')
    }
  })
  smis.pipe(createWriteStream(path, { flags: 'w' }))
  smis.end()
}

function genOtherSitemap(path: string) {
  const sitemapStream = new SitemapStream({ hostname: APP_DOMAIN })
  sitemapStream.pipe(createWriteStream(path, { flags: 'w' }))
  sitemapStream.write({ url: `/`, changefreq: 'daily', priority: 1 })
  sitemapStream.write({ url: `/appledaily`, changefreq: 'daily', priority: 0.5 })
  sitemapStream.write({ url: `/thestandnews`, changefreq: 'daily', priority: 0.5 })
  sitemapStream.end()
}

genSitemapIndex('public/sitemap.xml')
genOtherSitemap('public/sitemap_others.xml')
