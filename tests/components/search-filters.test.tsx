import { beforeEach, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, renderWithProviders, screen, waitFor } from '../../src/test/testUtils'
import { MediaFilter } from '../../src/components/Search/MediaFilter'

const hooks = vi.hoisted(() => ({ refine: vi.fn(), clear: vi.fn() }))
vi.mock('react-instantsearch', () => ({
  useRefinementList: () => ({
    items: [
      { value: 'appledaily', label: '蘋果日報', count: 24, isRefined: true },
      { value: 'thestandnews', label: '立場新聞', count: 24, isRefined: true },
    ],
    refine: hooks.refine,
  }),
  useClearRefinements: () => ({ refine: hooks.clear }),
}))

beforeEach(() => vi.clearAllMocks())

it('represents multiple publisher selections as checkboxes and refines once per activation', async () => {
  const user = userEvent.setup()
  renderWithProviders(<MediaFilter />)
  await user.click(screen.getByRole('button', { name: /媒體:/ }))
  // jsdom has no layout: hideWhenDetached hides the menu despite it being open.
  // Browser tests cover positioning; here we verify the selection contract.
  const apple = await screen.findByText('蘋果日報 (24)')
  const stand = screen.getByText('立場新聞 (24)')
  expect(apple).toHaveAttribute('role', 'menuitemcheckbox')
  expect(stand).toHaveAttribute('role', 'menuitemcheckbox')
  expect(apple).toHaveAttribute('aria-checked', 'true')
  expect(stand).toHaveAttribute('aria-checked', 'true')
  fireEvent.click(apple)
  await waitFor(() => expect(hooks.refine).toHaveBeenCalledExactlyOnceWith('appledaily'))
  expect(hooks.clear).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: /媒體:/ })).toHaveAttribute('aria-expanded', 'true')
})
