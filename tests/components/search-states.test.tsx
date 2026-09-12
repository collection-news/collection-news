import { act, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '../../src/test/testUtils'
import { SearchResults } from '../../src/components/Search/SearchResults'
import { SearchBox } from '../../src/components/Search/SearchBox'
import { RetryButton } from '../../src/components/Search/RetryButton'

const hooks = vi.hoisted(() => ({ infinite: vi.fn(), instant: vi.fn(), box: vi.fn() }))
vi.mock('react-instantsearch', () => ({
  useInfiniteHits: hooks.infinite,
  useInstantSearch: hooks.instant,
  useSearchBox: hooks.box,
}))
vi.mock('../../src/components/Search/SearchArticleCard', () => ({
  SearchArticleCard: ({ article }: { article: { title: string } }) => <div>{article.title}</div>,
}))

beforeEach(() => {
  hooks.infinite.mockReturnValue({ items: [], isLastPage: true, showMore: vi.fn() })
  hooks.instant.mockReturnValue({ status: 'idle', error: undefined, refresh: vi.fn() })
  hooks.box.mockReturnValue({ query: '', refine: vi.fn(), clear: vi.fn() })
})

describe('search rendering states', () => {
  it('shows a loading indicator before any results arrive', () => {
    hooks.instant.mockReturnValue({ status: 'loading' })
    renderWithProviders(<SearchResults />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('找不到相關文章')).not.toBeInTheDocument()
  })

  it('shows an explicit empty state', () => {
    renderWithProviders(<SearchResults />)
    expect(screen.getByText('找不到相關文章')).toBeVisible()
  })

  it('preserves existing hits during loading and shows the terminal marker', () => {
    hooks.infinite.mockReturnValue({
      items: [{ id: 'one', title: 'First result' }],
      isLastPage: true,
      showMore: vi.fn(),
    })
    hooks.instant.mockReturnValue({ status: 'loading' })
    renderWithProviders(<SearchResults />)
    expect(screen.getByText('First result')).toBeVisible()
    expect(screen.getByText('沒有更多')).toBeVisible()
  })

  it('renders the existing error UI when InstantSearch supplies an error and invokes refresh', async () => {
    vi.useFakeTimers()
    const refresh = vi.fn()
    hooks.instant.mockReturnValue({ status: 'error', error: new Error('unavailable'), refresh })
    renderWithProviders(<SearchResults />)
    expect(screen.getByText('無法載入文章，請稍後再試')).toBeVisible()
    expect(screen.getByRole('button')).toBeDisabled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    fireEvent.click(screen.getByRole('button', { name: '重試' }))
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

it('debounces retry availability for five seconds after every attempt', async () => {
  vi.useFakeTimers()
  const retry = vi.fn()
  renderWithProviders(<RetryButton onRetry={retry} />)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(4000)
  })
  expect(screen.getByRole('button')).toBeDisabled()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000)
  })
  expect(screen.getByRole('button')).toBeEnabled()
  fireEvent.click(screen.getByRole('button'))
  expect(retry).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button')).toBeDisabled()
})

it('refines typed queries, clears input, and follows an external query update', () => {
  const refine = vi.fn()
  const clear = vi.fn()
  hooks.box.mockReturnValue({ query: 'initial', refine, clear })
  const { rerender } = renderWithProviders(<SearchBox />)
  expect(screen.getByRole('textbox')).toHaveValue('initial')
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '香港' } })
  expect(refine).toHaveBeenCalledWith('香港')
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(clear).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('textbox')).toHaveValue('')
  hooks.box.mockReturnValue({ query: 'back navigation', refine, clear })
  rerender(<SearchBox />)
  expect(screen.getByRole('textbox')).toHaveValue('back navigation')
})
