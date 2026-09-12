import { expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders, screen } from '../../src/test/testUtils'
import { ArticleCard } from '../../src/components/ArticleCard'
import { ArticleImage } from '../../src/components/Image'
import { Loading } from '../../src/components/Loading'
import { media } from '../../src/constants/media'
import { story, video } from '../fixtures/articles'

it.each([media.APPLE_DAILY, media.THE_STAND_NEWS])('links the %s story card to its own article', publisher => {
  renderWithProviders(<ArticleCard article={story({ media: publisher })} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', `/${publisher}/articles/fixture-story`)
  expect(screen.getByText('Archive fixture story')).toBeVisible()
  expect(screen.getByText('2021/06/23 18:30')).toBeVisible()
})

it('renders a video card without an article navigation link', () => {
  renderWithProviders(<ArticleCard article={video()} />)
  expect(screen.getByText('Fixture video')).toBeVisible()
  expect(screen.getByText('影片')).toBeVisible()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

it('handles an unknown category and missing timestamp', () => {
  renderWithProviders(<ArticleCard article={story({ category: 'missing', publishTimestamp: null })} />)
  expect(screen.getByText('未知')).toBeVisible()
  expect(screen.queryByText('2021/06/23 18:30')).not.toBeInTheDocument()
})

it('renders an image fallback when no source is present', () => {
  const { container } = renderWithProviders(<ArticleImage alt="Missing photograph" />)
  expect(container.querySelector('img[src="undefined"]')).toBeNull()
  expect(container.querySelector('img[src=""]')).toBeNull()
  expect(container.querySelector('img')).not.toBeNull()
})

it('enables manual loading only while idle', () => {
  const load = vi.fn()
  const { rerender } = renderWithProviders(<Loading isLoading={false} onClick={load} />)
  fireEvent.click(screen.getByRole('button', { name: 'F5' }))
  expect(load).toHaveBeenCalledTimes(1)
  rerender(<Loading isLoading onClick={load} />)
  expect(screen.getByRole('button')).toBeDisabled()
})
