import { test, expect } from './fixtures'

for (const [publisher, date, category] of [
  ['appledaily', '20210623', 'local'],
  ['thestandnews', '20211229', 'politics'],
]) {
  test(`${publisher}: direct archive load, article content and browser history`, async ({ page }) => {
    await page.goto(`/${publisher}/${date}`)
    await expect(page.getByTestId('article-card')).toHaveCount(18)
    await page.getByTestId('article-card').first().click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/articles/${publisher}-${date}-1$`))
    await expect(page.getByTestId('article-title')).toHaveText(`${publisher} archive story 1`)
    await expect(page.getByText('This is the complete fixture article body.')).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/${date}$`))
    await expect(page.getByTestId('article-card')).toHaveCount(18)
    await page.goForward()
    await expect(page.getByTestId('article-title')).toHaveText(`${publisher} archive story 1`)
    await page.reload()
    await expect(page.getByTestId('article-title')).toHaveText(`${publisher} archive story 1`)
  })

  test(`${publisher}: category navigation, clear category and media home`, async ({ page }) => {
    await page.goto(`/${publisher}`)
    await page.getByTestId(`category-${category}-btn`).click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/[0-9]{8}/${category}$`))
    await expect(page.getByTestId('article-card')).toHaveCount(18)
    await page.getByTestId('show-all-category-btn').click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/[0-9]{8}$`))
    await page.getByTestId('header-media-home-btn').click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}$`))
  })

  test(`${publisher}: history year and category changes retain the selected year`, async ({ page }) => {
    await page.goto(`/${publisher}/history/2019`)
    await expect(page.getByTestId('article-card')).toHaveCount(18)
    await page.getByTestId(`category-${category}-btn`).click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/history/2019/${category}$`))
    const yearLink = page.getByRole('link', { name: '2018', exact: true })
    await expect(yearLink).toHaveAttribute('href', `/${publisher}/history/2018/${category}`)
    await yearLink.click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/history/2018/${category}$`))
    // Next's URL can update before the new route's links have rendered.
    const allCategoriesLink = page.getByTestId('show-all-category-btn')
    await expect(allCategoriesLink).toHaveAttribute('href', `/${publisher}/history/2018`)
    await allCategoriesLink.click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/history/2018$`))
    await expect(yearLink).toHaveAttribute('href', `/${publisher}/history/2018`)
    const articleLink = page.getByRole('link', { name: new RegExp(`${publisher} archive story 1 `) }).first()
    await expect(articleLink).toHaveAttribute('href', new RegExp(`/${publisher}/articles/${publisher}-2018[0-9]{4}-1$`))
    await articleLink.click()
    await expect(page).toHaveURL(new RegExp(`/${publisher}/articles/${publisher}-2018[0-9]{4}-1$`))
  })
}

test('archive scrolling appends one page and stops without duplicates', async ({ page }) => {
  const requests: URL[] = []
  page.on('request', request => {
    if (request.url().includes('/api/article?')) requests.push(new URL(request.url()))
  })
  await page.goto('/appledaily/20210623')
  await expect(page.getByTestId('article-card')).toHaveCount(18)
  await page.getByTestId('article-card').last().scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByTestId('article-card')).toHaveCount(24)
  await expect(page.getByTestId('article-list-view-ending-block')).toBeVisible()
  const links = await page
    .getByTestId('article-card')
    .evaluateAll(cards => cards.map(card => card.closest('a')?.getAttribute('href')))
  expect(new Set(links).size).toBe(24)
  expect(requests).toHaveLength(1)
  expect(requests[0].searchParams.get('nextCursor')).toBe('fixture:18')
  await expect(page).toHaveURL(/\/appledaily\/20210623$/)
})

test('short lists fill the viewport automatically and empty categories terminate', async ({ page }) => {
  const requests: URL[] = []
  page.on('request', request => {
    if (request.url().includes('/api/article?')) requests.push(new URL(request.url()))
  })
  await page.setViewportSize({ width: 1366, height: 1366 })
  await page.goto('/appledaily/20210623/culture')
  // The observer sees the end of a short list without needing a scroll or manual click.
  await expect(page.getByTestId('article-card')).toHaveCount(3)
  await expect(page.getByTestId('article-list-view-loading-block')).toHaveCount(0)
  await expect(page.getByTestId('article-list-view-ending-block')).toBeVisible()
  expect(requests).toHaveLength(1)
  expect(requests[0].searchParams.get('nextCursor')).toBe('fixture:2')
  await page.goto('/appledaily/20210623/unknown')
  await expect(page.getByTestId('article-card')).toHaveCount(0)
  await expect(page.getByTestId('article-list-view-ending-block')).toBeVisible()
})

test('an archive date can be selected through the calendar', async ({ page }) => {
  await page.goto('/appledaily')
  await page.getByRole('button', { name: '選擇日期' }).click()
  const calendar = page.getByRole('grid')
  await expect(calendar).toBeVisible()
  await calendar.getByRole('button', { name: /2021年6月22日/ }).click()
  await expect(page).toHaveURL(/\/appledaily\/20210622$/)
  await expect(page.getByTestId('list-view-date')).toHaveText('2021年6月22日')
})

test('missing articles and unsupported publishers return real 404 responses', async ({ page }) => {
  for (const path of ['/appledaily/articles/missing', '/invalid/20210623']) {
    const response = await page.goto(path)
    await page.waitForLoadState('networkidle')
    expect(response?.status()).toBe(404)
    await expect(page.getByTestId('article-title')).toHaveCount(0)
  }
})

test('the Apple Daily landing action and history shortcut lead to populated pages', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('show-articles-btn-appledaily').click()
  await expect(page).toHaveURL(/\/appledaily$/)
  await expect(page.getByTestId('article-card')).toHaveCount(18)
  // The history shortcut performs a document navigation; finish loading this page's chunks first.
  await page.waitForLoadState('networkidle')
  await page.getByTestId('history-btn').click()
  await expect(page).toHaveURL(/\/appledaily\/history\/202[01]$/)
  await expect(page.getByTestId('article-card')).toHaveCount(18)
})

test('a transient pagination network failure retains visible articles and retries successfully', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/article?*', route => {
    attempts += 1
    return attempts === 1 ? route.abort('failed') : route.fallback()
  })
  await page.goto('/thestandnews/20211229/politics')
  await expect(page.getByTestId('article-card')).toHaveCount(18)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => attempts).toBeGreaterThan(0)
  await expect(page.getByTestId('article-card').first()).toContainText('thestandnews archive story 1')
  await expect(page.getByTestId('article-card')).toHaveCount(24)
  expect(attempts).toBe(2)
  await expect(page.getByTestId('article-list-view-ending-block')).toBeVisible()
})

test('pagination HTTP failure preserves the archive and retries successfully', async ({ page }) => {
  let attempts = 0
  let unavailable = true
  await page.route('**/api/article?*', route => {
    attempts += 1
    return unavailable ? route.fulfill({ status: 500, json: { error: 'unavailable' } }) : route.fallback()
  })
  await page.goto('/thestandnews/20211229/politics')
  await expect(page.getByTestId('article-card')).toHaveCount(18)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => attempts, { timeout: 15_000 }).toBe(4)
  await expect(page.getByTestId('article-card')).toHaveCount(18)
  unavailable = false
  await page.getByTestId('article-list-view-loading-block').getByRole('button').click()
  await expect(page.getByTestId('article-card').first()).toContainText('thestandnews archive story 1')
  await expect(page.getByTestId('article-card')).toHaveCount(24)
  expect(attempts).toBe(5)
  await expect(page.getByTestId('article-list-view-ending-block')).toBeVisible()
})
