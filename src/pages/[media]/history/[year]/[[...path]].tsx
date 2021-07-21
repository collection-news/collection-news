import { Heading, Text, Box } from '@chakra-ui/react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { nth, path } from 'ramda'
import React from 'react'

import { ArticleListView } from '../../../../components/ArticleList'
import { CategoryList } from '../../../../components/CategoryList'
import { ContentWrapper } from '../../../../components/ContentWrapper'
import { HtmlHead } from '../../../../components/HtmlHead'
import { YearSelector } from '../../../../components/YearSelector'
import { appleDailyCategoryList } from '../../../../constants/appleDailyCategory'
import { useArticlesQuery } from '../../../../hooks'
import { getArticlesByDateAndCat } from '../../../../services/dynamo'
import { ArticleListResponse, GetArticlesByDateAndCatRequest } from '../../../../types/api'
import { historyPagePathParamsSchema } from '../../../../types/schema'
import { getTodayOfTheHistory, getZhFormatFromDateParam } from '../../../../utils/date'

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps<ArticleListPageProps> = async ({ params }) => {
  const { media, year, path } = params as { media: string; year: string; path?: [category: string | undefined] }

  const category = nth(0, path || [])
  const query = { media, year, ...(category ? { category } : {}) }

  const isParamsValid = await historyPagePathParamsSchema.isValid(query)
  if (!isParamsValid) {
    return { notFound: true, revalidate: false }
  }

  const historicalDay = getTodayOfTheHistory(query.year)
  const queryParams = { ...query, publishDate: historicalDay }
  const resp = await getArticlesByDateAndCat(queryParams)

  return {
    props: { initData: resp, queryParams },
    revalidate: 3600, // This page will be refresh every hour to adapt day change
  }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // We'll pre-render nothing at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths: [], fallback: 'blocking' }
}

export type ArticleListPageProps = {
  initData: ArticleListResponse
  queryParams: GetArticlesByDateAndCatRequest
}

export default function HistoryPage({ initData, queryParams }: ArticleListPageProps) {
  const { publishDate, category, media } = queryParams
  const { query } = useRouter()
  const { data, fetchNextPage, hasNextPage, isFetching } = useArticlesQuery(initData, queryParams)
  const displayDate = getZhFormatFromDateParam(publishDate)
  const cat = appleDailyCategoryList.find(_ => _.category === category)
  const title = cat ? `當年今日 - ${displayDate} - ${cat.text}` : `當年今日 - ${displayDate}`
  const articles = data?.pages.map(({ data }) => data).flat() || []

  const getHref = ({ category }: { category?: string }) => {
    return category ? `/${media}/history/${query.year}/${category}` : `/${media}/history/${query.year}`
  }

  const isInCategory = (category?: string) => {
    const currentCategory = path(['path', 0], query)
    return category === currentCategory
  }

  return (
    <>
      <HtmlHead title={title} />
      <CategoryList getHref={getHref} isInCategory={isInCategory} />
      <ContentWrapper>
        <Heading my={4}>當年今日</Heading>
        <Box position="sticky" top="headerAndCad" zIndex="sticky" bg="bg.500">
          <YearSelector />
        </Box>
        <Text fontSize="xl" my={2}>
          {displayDate}
        </Text>
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
