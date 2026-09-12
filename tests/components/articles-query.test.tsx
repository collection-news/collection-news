import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { media } from '../../src/constants/media'
import { useArticlesQuery } from '../../src/hooks/useArticlesQuery'
import { story } from '../fixtures/articles'

const initial = { articles: [story({ articleId: 'first' })], hasMore: true, nextCursor: 'page-two' }
const query = { media: media.APPLE_DAILY, publishDate: '20210623', category: 'local' }

function queryWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('article pagination hook', () => {
  it('uses server data without refetching on mount', () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useArticlesQuery(initial, query), { wrapper: queryWrapper() })
    expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first'])
    expect(result.current.hasNextPage).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('passes the cursor and filters, appends results, then stops at the terminal page', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        Response.json({ articles: [story({ articleId: 'second' })], hasMore: false, nextCursor: null })
      )
    const { result } = renderHook(() => useArticlesQuery(initial, query), { wrapper: queryWrapper() })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.flattedData).toHaveLength(2))
    expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first', 'second'])
    const url = new URL(String(fetch.mock.calls[0][0]), 'http://localhost')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      media: 'appledaily',
      publishDate: '20210623',
      category: 'local',
      nextCursor: 'page-two',
    })
    expect(result.current.hasNextPage).toBe(false)
    await act(async () => {
      await result.current.fetchNextPage()
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('preserves the previous page on network failure and allows an explicit retry', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'))
    const { result } = renderHook(() => useArticlesQuery(initial, query), { wrapper: queryWrapper() })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true))
    expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first'])
    fetch.mockResolvedValueOnce(Response.json({ articles: [story({ articleId: 'recovered' })], nextCursor: null }))
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() =>
      expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first', 'recovered'])
    )
    expect(result.current.isFetchNextPageError).toBe(false)
  })

  it('does not mix pages after publisher/date/category changes', () => {
    const { result, rerender } = renderHook(({ data, params }) => useArticlesQuery(data, params), {
      wrapper: queryWrapper(),
      initialProps: { data: initial, params: query },
    })
    const other = { articles: [story({ articleId: 'other' })], hasMore: false, nextCursor: 'other-cursor' }
    rerender({ data: other, params: { media: media.THE_STAND_NEWS, publishDate: '20211229', category: 'politics' } })
    expect(result.current.flattedData.map(article => article.articleId)).toEqual(['other'])
  })

  it.each([
    Response.json({ error: 'unavailable' }, { status: 500 }),
    Response.json({ articles: [null], nextCursor: null }),
    Response.json({ error: 'invalid successful response' }),
  ])('rejects invalid pages and retries the same cursor without losing articles', async response => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response)
    const { result } = renderHook(() => useArticlesQuery(initial, query), { wrapper: queryWrapper() })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true))
    expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first'])
    expect(result.current.hasNextPage).toBe(true)
    fetch.mockResolvedValueOnce(
      Response.json({ articles: [story({ articleId: 'second' })], hasMore: false, nextCursor: null })
    )
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() =>
      expect(result.current.flattedData.map(article => article.articleId)).toEqual(['first', 'second'])
    )
    expect(fetch.mock.calls[1][0]).toBe(fetch.mock.calls[0][0])
    expect(result.current.hasNextPage).toBe(false)
  })
})
