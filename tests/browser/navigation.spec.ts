import { test, expect } from './fixtures'

test('landing tabs change selected content and both publisher links navigate', async ({ page }) => {
  await page.goto('/')
  const apple = page.getByTestId('media-tab-appledaily-btn')
  const stand = page.getByTestId('media-tab-thestandnews-btn')
  await expect(apple).toHaveAttribute('aria-selected', 'true')
  await stand.click()
  await expect(stand).toHaveAttribute('aria-selected', 'true')
  await expect(apple).toHaveAttribute('aria-selected', 'false')
  await expect(page.getByTestId('show-articles-btn-thestandnews')).toBeVisible()
  await expect(page.getByTestId('show-articles-btn-appledaily')).not.toBeVisible()
  await page.getByTestId('show-articles-btn-thestandnews').click()
  await expect(page).toHaveURL(/\/thestandnews$/)
  await expect(page.getByTestId('article-card')).toHaveCount(18)
})

test('header menu supports keyboard navigation and closes after choosing a publisher', async ({ page }) => {
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.press('Enter')
  const publisher = page.getByTestId('header-media-appledaily-btn')
  await expect(publisher).toBeVisible()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await publisher.press('Space')
  await expect(page).toHaveURL(/\/appledaily$/)
  await expect(publisher).not.toBeVisible()
  await expect(page.getByTestId('article-card')).toHaveCount(18)
})

test('sister-site links have accessible names, correct destinations and reduced-motion styling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: '姊妹網站' })
  for (const [name, host] of [
    ['鏡片', 'lens'],
    ['文宣牆', 'wall'],
  ]) {
    const link = navigation.getByRole('link', { name: new RegExp(name, 'i') })
    await expect(link).toHaveAttribute('href', `https://${host}.collection.news/`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await link.focus()
    await expect(link).toBeFocused()
    await expect(link).toHaveCSS('transition-duration', '0s')
  }
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByTestId('header-media-lens-btn')).toHaveAttribute('href', 'https://lens.collection.news/')
  await expect(page.getByTestId('header-media-wall-btn')).toHaveAttribute('href', 'https://wall.collection.news/')
})

test('landing content fits a short viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/')
  await expect(page.getByTestId('index-search-input')).toBeVisible()
  await expect(page.getByRole('navigation', { name: '姊妹網站' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
