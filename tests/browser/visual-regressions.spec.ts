import { test, expect } from './fixtures'

test('publisher tabs retain a visible horizontal divider', async ({ page }) => {
  await page.goto('/')
  const divider = page.getByRole('tablist').getByRole('separator')
  await expect(divider).toHaveCSS('border-top-width', '2px')
  await expect(divider).toHaveCSS('border-top-style', 'solid')
  await expect(divider).toHaveCSS('width', '32px')
})

test('archive and search calendars retain readable text and a light shadow', async ({ page }) => {
  await page.goto('/appledaily')
  for (const search of [false, true]) {
    if (search) await page.getByTestId('header-search-btn').click()
    await page.getByRole('button', { name: search ? '日期: 所有日期' : '選擇日期', exact: true }).click()
    const day = page.getByRole('grid').getByRole('button', { name: /15日/ }).first()
    await expect(day).toHaveCSS('font-size', '16px')
    await expect(day).toHaveCSS('line-height', '24px')
    const calendar = page
      .getByRole('dialog')
      .filter({ has: page.getByRole('grid') })
      .last()
    await expect(calendar).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px')
    await page.keyboard.press('Escape')
  }
})

test('article cards retain their outline and contain bottom content spacing', async ({ page }) => {
  await page.goto('/appledaily')
  const card = page.getByTestId('article-card').first()
  await expect(card).toHaveCSS('border-top-width', '1px')
  await expect(card).toHaveCSS('border-top-style', 'solid')
  const bottomSpace = await card.evaluate(element => {
    const content = element.lastElementChild!
    return element.getBoundingClientRect().bottom - content.getBoundingClientRect().bottom
  })
  expect(bottomSpace).toBeCloseTo(9, 2)
})

test('route loading retains the thin dark track and fading brand indicator', async ({ page }) => {
  let releaseNavigation!: () => void
  const pendingNavigation = new Promise<void>(resolve => {
    releaseNavigation = resolve
  })
  await page.route('**/_next/data/**', async route => {
    await pendingNavigation
    await route.continue()
  })
  try {
    await page.goto('/appledaily')
    await page.getByTestId('category-local-btn').click()
    const track = page.getByRole('progressbar')
    await expect(track).toHaveCSS('height', '4px')
    await expect(track).toHaveCSS('background-color', 'rgb(29, 32, 31)')
    await expect(track).toHaveCSS('border-radius', '0px')
    await expect(track).toHaveCSS('box-shadow', 'none')
    const range = track.locator('[data-part="range"]')
    await expect(range).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(range).toHaveCSS('background-image', /linear-gradient.*rgb\(237, 255, 122\)/)
  } finally {
    releaseNavigation()
  }
  await expect(page).toHaveURL(/\/appledaily\/[0-9]{8}\/local$/)
  await expect(page.getByRole('progressbar')).toHaveCount(0)
})
