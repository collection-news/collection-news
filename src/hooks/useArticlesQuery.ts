import { isNil, reject } from 'ramda'
import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from 'react-query'
import { GetArticlesByDateAndCatRequest, ArticleListResponse } from '../types/api'

type QueryFunctionInput = {
  pageParam?: string | null
}

export function useArticlesQuery(initData: ArticleListResponse, queryParams: GetArticlesByDateAndCatRequest) {
  const queryKey = ['archive', queryParams]
  const fetchArticleList = useCallback(
    async ({ pageParam }: QueryFunctionInput) => {
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

  const queryProps = useInfiniteQuery(queryKey, fetchArticleList, {
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

  const flattedData = useMemo(() => (queryProps.data?.pages || []).map(({ data }) => data).flat(), [queryProps.data])

  return { ...queryProps, flattedData }
}
