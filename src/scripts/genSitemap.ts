import * as dotenv from 'dotenv'
import { createWriteStream } from 'fs'
import { SitemapIndexStream, SitemapStream } from 'sitemap'

import { firstDayOfAppleDaily, lastDayOfAppleDaily } from '../constants'
import { getDate, getStartEndDateFromYear } from '../utils/date'

dotenv.config({ path: '.env.local' })
const APP_DOMAIN = process.env.APP_DOMAIN
console.log(APP_DOMAIN)

function genSitemapIndex(path: string) {
  const startDay = getDate(firstDayOfAppleDaily)
  const endDate = getDate(lastDayOfAppleDaily)

  const smis = new SitemapIndexStream({})
  let date = startDay

  smis.write({ url: `${APP_DOMAIN}/sitemap_others.xml` })
  while (!date.isAfter(endDate)) {
    smis.write({ url: `${APP_DOMAIN}/sitemap_${date.format('YYYYMMDD')}.xml` })
    date = date.add(1, 'day')
  }
  smis.pipe(createWriteStream(path, { flags: 'w' }))
  smis.end()
}

function genOtherSitemap(path: string) {
  const sitemapStream = new SitemapStream({ hostname: APP_DOMAIN })
  sitemapStream.pipe(createWriteStream(path, { flags: 'w' }))
  sitemapStream.write({ url: `/`, changefreq: 'daily', priority: 1 })
  sitemapStream.write({ url: `/appledaily`, changefreq: 'daily', priority: 0.5 })
  sitemapStream.write({ url: `/about-us`, changefreq: 'daily', priority: 0.5 })
  sitemapStream.end()
}

function generateOneYearlySitemapIndex(year: number) {
  const [start, end] = getStartEndDateFromYear(year)
  const smis = new SitemapIndexStream({})
  let date = start
  while (!date.isAfter(end)) {
    smis.write({ url: `${APP_DOMAIN}/sitemap_${date.format('YYYYMMDD')}.xml` })
    date = date.add(1, 'day')
  }
  smis.pipe(createWriteStream(`public/sitemap_${year}.xml`, { flags: 'w' }))
  smis.end()
}

function generateYearlySitemapIndex() {
  for (let year = 2002; year <= 2021; year++) {
    generateOneYearlySitemapIndex(year)
  }
}

genSitemapIndex('public/sitemap.xml')
genOtherSitemap('public/sitemap_others.xml')
generateYearlySitemapIndex()
