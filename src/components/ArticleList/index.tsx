import { SimpleGrid } from '@chakra-ui/react'
import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { AppleDailyArticleCard } from '../ArticleCard'
import { Article } from '../../types/appleDailyArticle'
import { End } from './End'
import { Loading } from '../Loading'

type Props = {
  articles: Article[]
  hasNextPage: boolean
  fetchNextPage: () => unknown
  isFetching: boolean
}

export const ArticleListView = ({ articles, hasNextPage, fetchNextPage, isFetching }: Props) => {
  return (
    <InfiniteScroll
      dataLength={articles.length} // This is important field to render the next data
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<Loading isLoading={isFetching} onClick={fetchNextPage} />}
      endMessage={<End />}
    >
      <SimpleGrid minChildWidth="288px" spacing={6} mb={6}>
        {articles.map((article, idx) => (
          <AppleDailyArticleCard key={idx} article={article} />
        ))}
      </SimpleGrid>
    </InfiniteScroll>
  )
}
