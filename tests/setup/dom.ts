import { vi } from 'vitest'
import { createElement, type ImgHTMLAttributes } from 'react'

// Vite imports static images as URLs; Next's loader normally supplies their dimensions.
vi.mock('next/image', () => ({
  default: ({
    src,
    unoptimized: _unoptimized,
    priority: _priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean; priority?: boolean }) =>
    createElement('img', { ...props, src }),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)
window.scrollTo = vi.fn()
