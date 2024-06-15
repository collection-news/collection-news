import { Heading, Text, Box } from '@chakra-ui/react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { nth } from 'ramda'
import React, { useCallback, useMemo } from 'react'

import { ArticleListView } from '../../../../components/ArticleList'
import { CategoryList } from '../../../../components/CategoryList'
import { ContentWrapper } from '../../../../components/ContentWrapper'
import { NonArticleHead } from '../../../../components/HtmlHead'
import { YearSelector } from '../../../../components/YearSelector'
import { media } from '../../../../constants/media'
import { useArticlesQuery } from '../../../../hooks'
import { getArticlesByDateAndCat } from '../../../../services/dynamo'
import { ArticleListResponse, GetArticlesByDateAndCatRequest } from '../../../../types/api'
import { CategoryItem, MediaMetaForProps } from '../../../../types/mediaMeta'
import { historyPagePathParamsSchema } from '../../../../types/schema'
import { getCategory, getMedia } from '../../../../utils/dataHelper'
import { getTodayOfTheHistory, getZhFormatFromDateParam } from '../../../../utils/date'
import { getMedataMetaForPros } from '../../../../utils/metaHelper'

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps<ArticleListPageProps> = async ({ params }) => {
  const { media, year, path } = params as { media: media; year: string; path?: [category?: string] }

  const currentMedia = getMedia(media)

  const category = nth(0, path || [])
  const query = { media, year, ...(category ? { category } : {}) }

  const isParamsValid = await historyPagePathParamsSchema.isValid(query)
  if (!isParamsValid || !currentMedia) {
    return { notFound: true, revalidate: false }
  }

  const historicalDay = getTodayOfTheHistory(query.year)
  const queryParams = { ...query, publishDate: historicalDay }
  const resp = await getArticlesByDateAndCat(queryParams)

  return {
    props: {
      initData: resp,
      queryParams,
      currentCategory: getCategory(currentMedia.categoryList, category) || null,
      currentMedia: getMedataMetaForPros(currentMedia),
    },
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
  currentCategory: CategoryItem | null
  currentMedia: MediaMetaForProps
}

export default function HistoryPage({
  initData,
  queryParams,
  currentCategory,
  currentMedia: { categoryList, brandName, range, count },
}: ArticleListPageProps) {
  const { query } = useRouter()
  const { flattedData, fetchNextPage, hasNextPage, isFetching } = useArticlesQuery(initData, queryParams)

  const { publishDate, media } = queryParams
  const displayDate = getZhFormatFromDateParam(publishDate)

  const ogTitle = useMemo(() => {
    const title = currentCategory
      ? `當年今日 - ${displayDate} - ${currentCategory?.chiName}`
      : `當年今日 - ${displayDate}`
    return `${title} | ${brandName}•聞庫`
  }, [brandName, currentCategory, displayDate])

  const getHref = useCallback(
    ({ category }: { category?: string }) => {
      return category ? `/${media}/history/${query.year}/${category}` : `/${media}/history/${query.year}`
    },
    [query.year, media]
  )

  return (
    <>
      <NonArticleHead title={ogTitle} />
      <CategoryList categoryList={categoryList} getHref={getHref} currentCategory={currentCategory} total={count} />
      <ContentWrapper>
        <Heading my={4}>當年今日</Heading>
        <Box position="sticky" top="headerAndCad" zIndex="sticky" bg="bg.500">
          <YearSelector selectedYear={query.year as string} range={range} />
        </Box>
        <Text fontSize="xl" my={2}>
          {displayDate}
        </Text>
        <ArticleListView
          articles={flattedData}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetching={isFetching}
        />
      </ContentWrapper>
    </>
  )
}
