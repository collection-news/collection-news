import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'

async function searchFromHome(page: Page, query = 'archive') {
  await page.goto('/')
  await page.getByTestId('index-search-input').fill(query)
  await page.getByTestId('index-search-input').press('Enter')
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
}

test('banner search encodes a trimmed CJK query, renders results and supports Back', async ({
  page,
  searchRequests,
}) => {
  await searchFromHome(page, '  香港  ')
  await expect(page).toHaveURL(/\/search\?apple-articles%5Bquery%5D=%E9%A6%99%E6%B8%AF$/)
  await expect(page.getByTestId('modal-search-input')).toHaveValue('香港')
  expect(searchRequests.some(query => query.q === '香港')).toBe(true)
  await page.goBack()
  await expect(page).toHaveURL('http://127.0.0.1:3100/')
})

test('banner does not navigate for whitespace-only input', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('index-search-input').fill('   ')
  await page.getByTestId('index-search-input').press('Enter')
  await expect(page).toHaveURL('http://127.0.0.1:3100/')
  await expect(page.getByTestId('modal-search-input')).toHaveCount(0)
})

test('modal search resets on reopen and restores keyboard focus after Escape', async ({ page }) => {
  await page.goto('/appledaily')
  const open = page.getByTestId('header-search-btn')
  // Keyboard opening gives Safari a focused trigger to restore; mouse clicks need not focus buttons there.
  await open.press('Enter')
  const input = page.getByTestId('modal-search-input')
  await expect(input).toBeFocused()
  await input.fill('archive')
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
  // Focus and results can arrive before Zag installs the dialog's Escape handler.
  await expect(page.getByRole('dialog', { name: '搜尋文章', exact: true })).toHaveCSS('--layer-index', '0')
  await page.keyboard.press('Escape')
  await expect(input).toHaveCount(0)
  await expect(open).toBeFocused()
  await open.click()
  await expect(input).toHaveValue('')
})

test('selecting a modal result closes search and opens the matching article', async ({ page }) => {
  await page.goto('/appledaily')
  await page.getByTestId('header-search-btn').click()
  await page.getByTestId('modal-search-input').fill('archive')
  const result = page.getByTestId('search-article-card').first()
  await expect(result).toBeVisible()
  const href = await result.getByRole('link').getAttribute('href')
  await result.getByRole('link').click()
  await expect(page).toHaveURL(`http://127.0.0.1:3100${href}`)
  await expect(page.getByTestId('modal-search-input')).toHaveCount(0)
  await expect(page.getByTestId('article-title')).toHaveText('appledaily archive story 1')
})

test('modal scrolling requests the next offset and appends distinct hits', async ({ page, searchRequests }) => {
  await page.goto('/appledaily')
  await page.getByTestId('header-search-btn').click()
  await page.getByTestId('modal-search-input').fill('archive')
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
  await page.locator('#search-results-container').evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  await expect(page.getByTestId('search-article-card')).toHaveCount(40)
  expect(searchRequests.some(query => query.q === 'archive' && query.offset === 20)).toBe(true)
  const links = await page
    .getByTestId('search-article-card')
    .getByRole('link')
    .evaluateAll(elements => elements.map(element => element.getAttribute('href')))
  expect(new Set(links).size).toBe(40)
  // Let IntersectionObserver see the appended page move the sentinel out of view
  // before scrolling it back in. DOM counts can update between rendering frames.
  await page.evaluate(
    () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  )
  await page.locator('#search-results-container').evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  await expect(page.getByTestId('search-article-card')).toHaveCount(48)
  await expect(page.getByText('沒有更多')).toBeVisible()
})

test('no results and clearing a query use the existing empty state', async ({ page }) => {
  await searchFromHome(page)
  await page.getByTestId('modal-search-input').fill('no-fixture-matches-this')
  await expect(page.getByText('找不到相關文章')).toBeVisible()
  await expect(page.getByTestId('search-article-card')).toHaveCount(0)
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page.getByTestId('modal-search-input')).toHaveValue('')
})

test('media refinement changes both the outbound filter and visible publisher', async ({ page, searchRequests }) => {
  await searchFromHome(page)
  await page.getByRole('button', { name: '媒體: 全部' }).click()
  await page.getByRole('menuitemcheckbox', { name: /立場新聞/ }).click()
  const publisherToggle = page.getByRole('button', { name: /媒體: 立場新聞/ })
  await expect(publisherToggle).toHaveAttribute('aria-expanded', 'true')
  await publisherToggle.click()
  await expect(publisherToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByTestId('search-article-card').first()).toContainText('thestandnews archive story')
  expect(searchRequests.some(query => JSON.stringify(query.filter || []).includes('thestandnews'))).toBe(true)
  await page.getByRole('button', { name: /媒體: 立場新聞/ }).click()
  await page.getByRole('menuitem', { name: '全部', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '媒體: 全部' })).toBeVisible()
  await expect(page.getByTestId('search-article-card').first()).toContainText('appledaily archive story')
})

test('category refinement supports Chinese filtering and clears independently', async ({ page, searchRequests }) => {
  await searchFromHome(page)
  await page.getByRole('button', { name: '分類: 全部' }).click()
  await page.getByPlaceholder('搜尋分類...').fill('文化')
  await page.getByRole('menuitemcheckbox', { name: /文化/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '分類 (1)' })).toBeVisible()
  await expect
    .poll(() => searchRequests.some(query => JSON.stringify(query.filter || []).includes('culture')))
    .toBe(true)
  // Alternating fixture categories make an unchanged response detectable.
  await expect(page.getByTestId('search-article-card').nth(1)).toContainText('archive story 3')
  await page.getByRole('button', { name: '分類 (1)' }).click()
  await page.getByRole('menuitem', { name: '全部', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('search-article-card').nth(1)).toContainText('archive story 2')
})

test('sort selection changes the request and ordering of returned articles', async ({
  page,
  searchRequests,
  isMobile,
}) => {
  await searchFromHome(page)
  const activate = async (locator: ReturnType<Page['getByRole']>) => (isMobile ? locator.tap() : locator.click())
  await activate(page.getByRole('button', { name: '排序: 相關度' }))
  await activate(page.getByRole('menuitemradio', { name: '日期 (新到舊)' }))
  await expect(page.getByTestId('search-article-card').first()).toContainText('thestandnews archive story')
  expect(searchRequests.some(query => query.sort?.includes('publish_ts:desc'))).toBe(true)
  await activate(page.getByRole('button', { name: '排序: 日期 (新到舊)' }))
  await activate(page.getByRole('menuitemradio', { name: '日期 (舊到新)' }))
  await expect(page.getByTestId('search-article-card').first()).toContainText('appledaily archive story')
  expect(searchRequests.some(query => query.sort?.includes('publish_ts:asc'))).toBe(true)
})

test('date range selection sends inclusive bounds and filters the visible dates', async ({ page, searchRequests }) => {
  await searchFromHome(page)
  await page.getByRole('button', { name: '日期: 所有日期' }).click()
  const calendar = page.getByRole('grid')
  await calendar.getByRole('button', { name: /2021年12月28日/ }).click()
  await calendar.getByRole('button', { name: /2021年12月29日/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '日期: 2021-12-28 - 2021-12-29' })).toBeVisible()
  await expect
    .poll(() =>
      searchRequests.some(query =>
        JSON.stringify(query.filter || []).includes('publish_date >= 20211228 AND publish_date <= 20211229')
      )
    )
    .toBe(true)
  await expect(page.getByTestId('search-article-card').first()).toContainText('2021/12/29')
  await expect(page.getByTestId('search-article-card').first()).toContainText('thestandnews archive story')
})

test('search query survives reload and browser history restores the earlier query', async ({ page }) => {
  await searchFromHome(page)
  await page.reload()
  await expect(page.getByTestId('modal-search-input')).toHaveValue('archive')
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
  await page.getByTestId('modal-search-input').fill('香港')
  await expect(page).toHaveURL(/query%5D=%E9%A6%99%E6%B8%AF/)
  await page.goBack()
  await expect(page.getByTestId('modal-search-input')).toHaveValue('archive')
})

test('combined publisher and category refinements are preserved when clearing only the publisher', async ({
  page,
  searchRequests,
}) => {
  await searchFromHome(page)
  await page.getByRole('button', { name: '媒體: 全部' }).click()
  await page.getByRole('menuitemcheckbox', { name: /立場新聞/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('search-article-card').first()).toContainText('thestandnews')
  await page.getByRole('button', { name: '分類: 全部' }).click()
  await page.getByRole('menuitemcheckbox', { name: /文化/ }).click()
  const categoryToggle = page.getByRole('button', { name: '分類 (1)' })
  await expect(categoryToggle).toHaveAttribute('aria-expanded', 'true')
  await categoryToggle.click()
  await expect(categoryToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByTestId('search-article-card')).toHaveCount(12)
  expect(
    searchRequests.some(query => {
      const filter = JSON.stringify(query.filter || [])
      return filter.includes('thestandnews') && filter.includes('culture')
    })
  ).toBe(true)
  await page.getByRole('button', { name: /媒體: 立場新聞/ }).click()
  const publisherMenu = page.getByRole('menu').filter({ has: page.getByRole('menuitemcheckbox', { name: /立場新聞/ }) })
  await publisherMenu.getByRole('menuitem', { name: '全部', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '分類 (1)' })).toBeVisible()
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
  await expect(page.getByTestId('search-article-card').nth(1)).toContainText('appledaily archive story 3')
})

for (const view of ['page', 'modal'] as const) {
  test(`${view}: search HTTP failure recovers through retry without reload`, async ({ page }) => {
    let unavailable = true
    await page.route('**/api/multi-search?*', route =>
      unavailable ? route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }) : route.fallback()
    )
    if (view === 'page') {
      await page.goto('/search?apple-articles%5Bquery%5D=archive')
    } else {
      await page.goto('/appledaily')
      await page.getByTestId('header-search-btn').click()
      await page.getByTestId('modal-search-input').fill('archive')
    }
    await expect(page.getByText('無法載入文章，請稍後再試')).toBeVisible()
    unavailable = false
    await page.getByRole('button', { name: '重試', exact: true }).click()
    await expect(page.getByTestId('search-article-card')).toHaveCount(20)
    await expect(page.getByTestId('modal-search-input')).toHaveValue('archive')
    await expect(page.getByText('無法載入文章，請稍後再試')).not.toBeVisible()
  })
}

test('nested filter Escape closes the filter before the modal and returns focus', async ({ page }) => {
  await page.goto('/appledaily')
  const trigger = page.getByTestId('header-search-btn')
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: '搜尋文章', exact: true })
  await page.getByTestId('modal-search-input').fill('archive')
  await expect(page.getByTestId('search-article-card')).toHaveCount(20)
  const filter = page.getByRole('button', { name: '分類: 全部' })
  await filter.press('Enter')
  const input = page.getByPlaceholder('搜尋分類...')
  await input.fill('文化')
  await input.press('ArrowLeft')
  await expect(input).toBeFocused()
  // Zag registers the nested dismissable layer on a rendering frame.
  await expect(page.getByRole('menu')).toHaveCSS('--layer-index', '1')
  await input.press('Escape')
  await expect(input).not.toBeVisible()
  await expect(dialog).toBeVisible()
  await expect(filter).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('publisher checkbox can be cleared without closing its menu', async ({ page, searchRequests }) => {
  await searchFromHome(page)
  await page.getByRole('button', { name: '媒體: 全部' }).click()
  const apple = page.getByRole('menuitemcheckbox', { name: /蘋果日報/ })
  await apple.click()
  await expect(apple).toHaveAttribute('aria-checked', 'true')
  await apple.click()
  await expect(apple).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByRole('button', { name: '媒體: 全部' })).toHaveAttribute('aria-expanded', 'true')
  await expect
    .poll(() =>
      searchRequests.some(query => {
        const filter = JSON.stringify(query.filter || [])
        return filter.includes('appledaily')
      })
    )
    .toBe(true)
})

test('search menus and calendar open and close with touch or mouse activation', async ({ page, isMobile }) => {
  await searchFromHome(page)
  for (const name of ['媒體: 全部', '分類: 全部', '排序: 相關度', '日期: 所有日期']) {
    const trigger = page.getByRole('button', { name, exact: true })
    const activate = () => (isMobile ? trigger.tap() : trigger.click())
    await activate()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const surface = name.startsWith('日期') ? page.getByRole('grid') : page.getByRole('menu', { name, exact: true })
    await expect(surface).toBeVisible()
    await activate()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(surface).not.toBeVisible()
    await expect(page.getByTestId('modal-search-input')).toBeVisible()
  }
})
