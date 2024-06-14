import { Heading, Box, Divider } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import { useMemo } from 'react'
import { ArticleListView } from '../../components/ArticleList'

import { CategoryList } from '../../components/CategoryList'
import { ContentWrapper } from '../../components/ContentWrapper'
import { DatePicker } from '../../components/DatePicker'
import { NonArticleHead } from '../../components/HtmlHead'
import { media } from '../../constants/media'
import { mediaMap } from '../../constants/mediaMeta'
import { useArticlesQuery } from '../../hooks'
import { getArticlesByDateAndCat } from '../../services/dynamo'
import { ArticleListResponse, GetArticlesByDateAndCatRequest } from '../../types/api'
import { CategoryItem, MediaMetaForProps } from '../../types/mediaMeta'
import { articleListQueryParamsSchema } from '../../types/schema'
import { getCategory, getMedia } from '../../utils/dataHelper'
import { getDateParamFromDate, getZhFormatFromDateParam } from '../../utils/date'
import { getMedataMetaForPros } from '../../utils/metaHelper'

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps<ArticleListPageIndexProps> = async ({ params }) => {
  const { media, path: [publishDate, category] = [] } = params as {
    media: media
    path?: [publishDate: string | undefined, category: string | undefined]
  }

  const currentMedia = getMedia(media)

  if (!currentMedia) {
    return { notFound: true, revalidate: false }
  }

  const {
    range: [, lastDay],
    categoryList,
  } = currentMedia

  const queryParams = {
    media,
    publishDate: publishDate || lastDay,
    getVideo: true,
    ...(category ? { category } : {}),
  }

  const isParamsValid = await articleListQueryParamsSchema.isValid(queryParams)
  if (!isParamsValid) {
    return { notFound: true, revalidate: false }
  }

  const resp = await getArticlesByDateAndCat(queryParams)

  return {
    props: {
      initData: resp,
      queryParams,
      currentCategory: getCategory(categoryList, category) || null,
      currentMedia: getMedataMetaForPros(currentMedia),
    },
    revalidate: false,
  }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // Pre-render the last date at build time
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return {
    paths: Object.entries(mediaMap).map(([media, map]) => ({ params: { media, path: [map.range[1]] } })),
    fallback: 'blocking',
  }
}

export type ArticleListPageIndexProps = {
  initData: ArticleListResponse
  queryParams: GetArticlesByDateAndCatRequest
  currentCategory: CategoryItem | null
  currentMedia: MediaMetaForProps
}

export default function Home({
  initData,
  queryParams,
  currentCategory,
  currentMedia: {
    brandNameShorthand,
    brandName,
    range: [mediaFirstDay, mediaLastDay],
    categoryList,
    count,
  },
}: ArticleListPageIndexProps) {
  const router = useRouter()
  const { asPath } = router
  const { flattedData, fetchNextPage, hasNextPage, isFetching } = useArticlesQuery(initData, queryParams)

  const { publishDate: currentDate, media } = queryParams

  const ogTitle = useMemo(() => {
    if (asPath === '/' || asPath === `/${media}/${mediaLastDay}` || !currentDate) return `${brandName}•聞庫`
    return `${getZhFormatFromDateParam(currentDate)}${
      currentCategory ? ` - ${currentCategory?.chiName || ''}` : ''
    } | ${brandName}•聞庫`
  }, [asPath, currentCategory, currentDate, brandName, media, mediaLastDay])

  const getHref = useCallback(
    ({ category, date }: { category?: string; date?: string }) => {
      return category ? `/${media}/${date || mediaLastDay}/${category}` : `/${media}/${date || mediaLastDay}`
    },
    [media, mediaLastDay]
  )

  const onSelectDate = useCallback(
    (day?: Date) => {
      day && router.push(getHref({ category: currentCategory?.engName, date: getDateParamFromDate(day) }))
    },
    [currentCategory?.engName, router, getHref]
  )

  return (
    <>
      <NonArticleHead title={ogTitle} />
      <CategoryList categoryList={categoryList} currentCategory={currentCategory} getHref={getHref} total={count} />
      <ContentWrapper>
        <Heading my={4}>昔日{brandNameShorthand}</Heading>
        <Box position="sticky" zIndex="overlay" top="headerAndCad">
          <Box position="absolute" right={0}>
            <Box my={2}>
              <DatePicker
                onSelect={onSelectDate}
                range={[dayjs(mediaFirstDay).toDate(), dayjs(mediaLastDay).toDate()]}
              />
            </Box>
          </Box>
        </Box>
        <Box fontSize="xl" top="headerAndCad" position="sticky" zIndex="sticky" bg="bg.500">
          <Box py={2} data-cy="list-view-date">
            {getZhFormatFromDateParam(currentDate)}
          </Box>
          <Divider />
        </Box>
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

export const runtime = 'experimental-edge'
