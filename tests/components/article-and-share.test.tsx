import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '../../src/test/testUtils'
import { Article } from '../../src/containers/Article'
import { useWebShare } from '../../src/hooks/useWebShare'
import { richStory, story, video } from '../fixtures/articles'

vi.mock('next/router', () => ({ useRouter: () => ({ asPath: '/appledaily/articles/rich-story' }) }))
vi.mock('next/dynamic', () => ({ default: () => () => null }))

describe('archived article rendering', () => {
  it('renders the supported rich body blocks and filters internal tags', () => {
    const { container } = renderWithProviders(<Article article={richStory} />)
    expect(screen.getByRole('heading', { name: 'Archive rich story' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Section heading' })).toBeVisible()
    for (const text of [
      'This is the complete fixture article body.',
      'Preserved archive markup',
      'A quoted observation.',
      'First list entry',
      'Column heading',
      'Table cell',
    ]) {
      expect(screen.getByText(text)).toBeVisible()
    }
    expect(container.querySelector('ol')).not.toBeNull()
    expect(container.querySelector('table')).not.toBeNull()
    expect(container.querySelector('video[controls]')).not.toBeNull()
    expect(screen.queryByText('_internal')).not.toBeInTheDocument()
    expect(screen.queryByText('123')).not.toBeInTheDocument()
  })

  it('renders video controls and an unknown timestamp without crashing', () => {
    const { container } = renderWithProviders(<Article article={video({ publishTimestamp: null })} />)
    expect(screen.getByRole('heading', { name: 'Fixture video' })).toBeVisible()
    expect(container.querySelector('video[controls]')).not.toBeNull()
    expect(screen.getByText(/未知/)).toBeVisible()
  })

  it('supports a nested story and an unordered list', () => {
    const article = story({
      introElements: [],
      contentElements: [
        story({ title: 'Nested story', introElements: [] }),
        { type: 'list', listType: 'unordered', items: [{ type: 'text', content: 'Unordered entry' }] },
      ],
    })
    const { container } = renderWithProviders(<Article article={article} />)
    expect(screen.getByRole('heading', { name: 'Nested story' })).toBeVisible()
    expect(screen.getByText('Unordered entry')).toBeVisible()
    expect(container.querySelector('ul')).not.toBeNull()
  })
})

describe('native sharing', () => {
  afterEach(() => {
    delete (navigator as Partial<Navigator>).share
    document.head.querySelector('link[rel="canonical"]')?.remove()
    document.title = ''
  })

  it('is unavailable when the browser does not support sharing', () => {
    const { result } = renderHook(useWebShare)
    expect(result.current.canShare).toBe(false)
    expect(() => result.current.onShare()).not.toThrow()
  })

  it('shares the canonical URL and title when supported', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    document.title = 'Archived article'
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = 'https://collection.news/appledaily/articles/fixture'
    document.head.append(canonical)
    const { result } = renderHook(useWebShare)
    expect(result.current.canShare).toBe(true)
    await act(async () => {
      result.current.onShare()
    })
    expect(share).toHaveBeenCalledWith({ title: 'Archived article', url: canonical.href })
  })

  it('handles cancellation and uses the current location without a canonical URL', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError'))
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { result } = renderHook(useWebShare)
    await act(async () => {
      result.current.onShare()
    })
    expect(share).toHaveBeenCalledWith({ title: '', url: document.location.href })
  })
})
