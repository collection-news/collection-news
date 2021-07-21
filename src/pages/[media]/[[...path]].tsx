import { Heading, Box, Flex, Divider } from '@chakra-ui/react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { nth, path } from 'ramda'
import * as React from 'react'
import { ArticleListView } from '../../components/ArticleList'

import { CategoryList } from '../../components/CategoryList'
import { ContentWrapper } from '../../components/ContentWrapper'
import { DatePicker } from '../../components/DatePicker'
import { HtmlHead } from '../../components/HtmlHead'
import { lastDayOfAppleDaily } from '../../constants'
import { useArticlesQuery } from '../../hooks'
import { getArticlesByDateAndCat } from '../../services/dynamo'
import { ArticleListResponse, GetArticlesByDateAndCatRequest } from '../../types/api'
import { articleListQueryParamsSchema } from '../../types/schema'
import { getDateParamFromDate, getZhFormatFromDateParam } from '../../utils/date'

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps<ArticleListPageIndexProps> = async ({ params }) => {
  const { media, path } = params as {
    media: string
    path?: [publishDate: string | undefined, category: string | undefined]
  }

  const category = nth(1, path || [])
  const publishDate = nth(0, path || [])
  const queryParams = {
    media,
    publishDate: publishDate || lastDayOfAppleDaily,
    getVideo: true,
    ...(category ? { category } : {}),
  }

  const isParamsValid = await articleListQueryParamsSchema.isValid(queryParams)
  if (!isParamsValid) {
    return { notFound: true, revalidate: false }
  }

  const resp = await getArticlesByDateAndCat(queryParams)

  return {
    props: { initData: resp, queryParams },
    revalidate: 3600,
  }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // Pre-render /appledaily at build time
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths: [{ params: { media: 'appledaily', path: [] } }], fallback: 'blocking' }
}

export type ArticleListPageIndexProps = {
  initData: ArticleListResponse
  queryParams: GetArticlesByDateAndCatRequest
}

export default function Home({ initData, queryParams }: ArticleListPageIndexProps) {
  const { publishDate, media, category } = queryParams
  const router = useRouter()
  const { query } = router
  const { data, fetchNextPage, hasNextPage, isFetching } = useArticlesQuery(initData, queryParams)
  const articles = data?.pages.map(({ data }) => data).flat() || []

  const onSelectDate = (day: Date | undefined) => {
    if (day) {
      router.push(
        category ? `/${media}/${getDateParamFromDate(day)}/${category}` : `/${media}/${getDateParamFromDate(day)}`
      )
    }
  }

  const getHref = ({ category, lastDay }: { category?: string; lastDay?: string }) => {
    return category
      ? `/${media}/${lastDay || lastDayOfAppleDaily}/${category}`
      : `/${media}/${lastDay || lastDayOfAppleDaily}`
  }

  const isInCategory = (category?: string) => {
    const currentCategory = path(['path', 1], query)
    return category === currentCategory
  }

  return (
    <>
      <HtmlHead title="果靈聞庫" />
      <CategoryList getHref={getHref} isInCategory={isInCategory} />
      <ContentWrapper>
        <Heading my={4}>昔日蘋果</Heading>
        <Box position="sticky" zIndex="overlay" top="headerAndCad">
          <Box position="absolute" right={0}>
            <Box my={2}>
              <DatePicker onSelect={onSelectDate} defaultMonth={new Date(2021, 5, 23) /* 2021 June 23 */} />
            </Box>
          </Box>
        </Box>
        <Box fontSize="xl" top="headerAndCad" position="sticky" zIndex="sticky" bg="bg.500">
          <Box py={2} data-cy="list-view-date">
            {getZhFormatFromDateParam(publishDate)}
          </Box>
          <Divider />
        </Box>
        <ArticleListView
          articles={articles}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetching={isFetching}
        />
      </ContentWrapper>
    </>
  )
}
