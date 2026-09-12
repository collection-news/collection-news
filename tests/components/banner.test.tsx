import { fireEvent } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '../../src/test/testUtils'
import Banner from '../../src/components/Banner'

const state = vi.hoisted(() => ({ push: vi.fn(), flags: { enableSearchFeature: false } }))
vi.mock('next/router', () => ({ useRouter: () => ({ push: state.push }) }))
vi.mock('../../src/utils/config', () => ({ featureFlags: state.flags }))

beforeEach(() => {
  state.push.mockReset()
  state.flags.enableSearchFeature = false
})

it('hides search when its feature flag is disabled while preserving sister-site navigation', () => {
  renderWithProviders(<Banner />)
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: '姊妹網站' })).toBeVisible()
  expect(screen.getByRole('link', { name: '鏡片（在新分頁開啟）' })).toHaveAttribute(
    'href',
    'https://lens.collection.news/'
  )
})

it('navigates only for nonempty input and encodes the trimmed CJK query', () => {
  state.flags.enableSearchFeature = true
  renderWithProviders(<Banner />)
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: '  ' } })
  fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
  expect(state.push).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: '  香港  ' } })
  fireEvent.keyDown(input, { key: 'a' })
  expect(state.push).not.toHaveBeenCalled()
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(state.push).toHaveBeenCalledWith('/search?apple-articles%5Bquery%5D=%E9%A6%99%E6%B8%AF')
})
