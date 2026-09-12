import { isNil, reject } from 'ramda'
import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
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
      if (!resp.ok) throw new Error(`Article request failed (${resp.status})`)
      const data = (await resp.json()) as ArticleListResponse
      if (
        !data ||
        !Array.isArray(data.articles) ||
        data.articles.some(article => !article || typeof article.articleId !== 'string') ||
        (data.nextCursor !== null && typeof data.nextCursor !== 'string')
      ) {
        throw new Error('Invalid article page response')
      }
      return {
        data: data.articles,
        nextCursor: data.nextCursor,
      }
    },
    [queryParams]
  )

  const queryProps = useInfiniteQuery({
    queryKey,
    queryFn: fetchArticleList,
    initialPageParam: null,
    getNextPageParam: lastPage => {
      return lastPage.nextCursor
    },
    initialData: { pages: [{ data: initData.articles, nextCursor: initData.nextCursor }], pageParams: [null] },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
  })

  const flattedData = useMemo(() => (queryProps.data?.pages || []).map(({ data }) => data).flat(), [queryProps.data])

  return { ...queryProps, flattedData }
}
