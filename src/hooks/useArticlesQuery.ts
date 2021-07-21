import { isNil, reject } from 'ramda'
import { useCallback } from 'react'
import { useInfiniteQuery } from 'react-query'
import { GetArticlesByDateAndCatRequest, ArticleListResponse } from '../types/api'

export function useArticlesQuery(initData: ArticleListResponse, queryParams: GetArticlesByDateAndCatRequest) {
  const queryKey = ['archive', queryParams]
  const fetchArticleList = useCallback(
    async ({ pageParam }) => {
      const resp = await fetch(
        '/api/article?' +
          new URLSearchParams({ ...reject(isNil, queryParams), ...(pageParam ? { nextCursor: pageParam } : {}) })
      )
      const data = (await resp.json()) as ArticleListResponse
      return {
        data: data.articles,
        nextCursor: data.nextCursor,
      }
    },
    [queryParams]
  )
  return useInfiniteQuery(queryKey, fetchArticleList, {
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextCursor
    },
    initialData: { pages: [{ data: initData.articles, nextCursor: initData.nextCursor }], pageParams: [] },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
  })
}
