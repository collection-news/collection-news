import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProviders, screen } from '../../src/test/testUtils'
import { ArticleImage } from '../../src/components/Image'

describe('article image lifecycle', () => {
  it('shows a fallback until loading completes and preserves the load callback', () => {
    const onLoad = vi.fn()
    renderWithProviders(<ArticleImage src="/first.jpg" alt="photograph" onLoad={onLoad} />)
    expect(screen.getByAltText('empty')).toBeVisible()
    const image = screen.getByAltText('photograph')
    fireEvent.load(image)
    expect(image).toBeVisible()
    expect(screen.queryByAltText('empty')).not.toBeInTheDocument()
    expect(onLoad).toHaveBeenCalledOnce()
  })

  it('recovers after a failed source changes and preserves the error callback', () => {
    const onError = vi.fn()
    const { rerender } = renderWithProviders(<ArticleImage src="/broken.jpg" alt="photograph" onError={onError} />)
    fireEvent.error(screen.getByAltText('photograph'))
    expect(screen.getByAltText('empty')).toBeVisible()
    expect(onError).toHaveBeenCalledOnce()
    rerender(<ArticleImage src="/second.jpg" alt="photograph" onError={onError} />)
    const image = screen.getByAltText('photograph')
    expect(image).toHaveAttribute('src', '/second.jpg')
    fireEvent.load(image)
    expect(image).toBeVisible()
    expect(screen.queryByAltText('empty')).not.toBeInTheDocument()
    rerender(<ArticleImage src="/broken.jpg" alt="photograph" onError={onError} />)
    const retry = screen.getByAltText('photograph')
    expect(retry).toHaveAttribute('src', '/broken.jpg')
    fireEvent.load(retry)
    expect(retry).toBeVisible()
    expect(screen.queryByAltText('empty')).not.toBeInTheDocument()
  })
})

it('reveals an image that finished loading before React attached its load handler', () => {
  const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  const width = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(320)
  try {
    renderWithProviders(<ArticleImage src="/cached.jpg" alt="cached photograph" />)
    expect(screen.getByAltText('cached photograph')).toBeVisible()
    expect(screen.queryByAltText('empty')).not.toBeInTheDocument()
  } finally {
    complete.mockRestore()
    width.mockRestore()
  }
})
