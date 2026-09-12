import { test, expect } from './fixtures'

test('rich article renders real blocks, decoded images and search metadata', async ({ page }) => {
  await page.goto('/appledaily/articles/rich-story')
  await expect(page.getByRole('heading', { name: 'Section heading' })).toBeVisible()
  await expect(page.getByText('Preserved archive markup')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Table cell' })).toBeVisible()
  await expect(page.locator('video')).toHaveAttribute('controls', '')
  const image = page.getByAltText('Archive fixture photograph').first()
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await expect(page).toHaveTitle('Archive rich story | 蘋果日報•聞庫')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Archive rich story | 蘋果日報•聞庫'
  )
  const metadata = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) || '{}')
  expect(metadata).toMatchObject({
    '@type': 'Article',
    headline: 'Archive rich story | 蘋果日報•聞庫',
    author: { name: '蘋果日報' },
    datePublished: '2021-06-23',
  })
})

test('a failed image uses the existing fallback without a browser exception', async ({ page }) => {
  await page.route('**/test-image.svg', route => route.abort())
  await page.goto('/appledaily/20210623')
  await expect(page.getByTestId('article-card').first().getByAltText('empty')).toBeVisible()
  await expect(page.getByTestId('article-card')).toHaveCount(18)
})

test('article HTTP API returns cursor pages and enforces method and required query', async ({ request }) => {
  const first = await request.get('/api/article?media=appledaily&publishDate=20210623&getVideo=true')
  expect(first.status()).toBe(200)
  expect(first.headers()['cache-control']).toContain('immutable')
  const body = await first.json()
  expect(body.articles).toHaveLength(18)
  const next = await request.get('/api/article', {
    params: { media: 'appledaily', publishDate: '20210623', nextCursor: body.nextCursor },
  })
  expect(await next.json()).toMatchObject({ hasMore: false, nextCursor: null })
  expect((await request.get('/api/article')).status()).toBe(400)
  // This is the isolated fixture app. No live API is ever sent a mutation method.
  expect((await request.post('/api/article')).status()).toBe(405)
})

test('sitemap and robots rewrites return their full content and cache headers', async ({ request }) => {
  const sitemap = await request.get('/sitemap/appledaily/20210623.xml')
  expect(sitemap.status()).toBe(200)
  expect(sitemap.headers()['content-type']).toContain('application/xml')
  expect(sitemap.headers()['content-encoding']).toBe('gzip')
  const xml = await sitemap.text()
  expect(xml.match(/<url>/g)).toHaveLength(24)
  expect(xml).toContain('/appledaily/articles/appledaily-20210623-24')
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain('Sitemap: http://localhost:3100/sitemap.xml')
  expect(await robots.text()).toContain('Disallow: /api/*')
})

test('build-time sitemap includes both archive boundaries and the static pages', async ({ request }) => {
  const index = await request.get('/sitemap.xml')
  expect(index.status()).toBe(200)
  const xml = await index.text()
  for (const path of [
    '/sitemap/appledaily/20020101.xml',
    '/sitemap/appledaily/20210623.xml',
    '/sitemap/thestandnews/20141226.xml',
    '/sitemap/thestandnews/20211229.xml',
    '/sitemap_others.xml',
  ]) {
    expect(xml).toContain(`http://localhost:3100${path}`)
  }
  const other = await request.get('/sitemap_others.xml')
  expect(other.status()).toBe(200)
  expect((await other.text()).match(/<url>/g)).toHaveLength(3)
})

test('Google page renders its index count and integration container without loading Google', async ({ page }) => {
  await page.goto('/google')
  await expect(page.getByText('Google現己索引 1,234 篇文章')).toBeVisible()
  await expect(page.locator('.gcse-search')).toHaveCount(1)
  await expect(page.locator('script[src^="https://cse.google.com/cse.js"]')).toHaveCount(1)
})
