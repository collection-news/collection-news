import { Box, Stack, Text, Spinner, Center, VStack } from '@chakra-ui/react'
import * as React from 'react'
import { MeiliSearchArticle } from '../../types/api'
import { SearchArticleCard, Props as SearchArticleCardProps } from './SearchArticleCard'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Loading } from '../Loading'
import { End } from '../ArticleList/End'
import { RetryButton } from './RetryButton'

// Memoize the SearchArticleCard to prevent re-rendering of existing items in the list.
const MemoizedSearchArticleCard = React.memo<SearchArticleCardProps>(SearchArticleCard)

export const SearchResults = () => {
  const { items, isLastPage, showMore } = useInfiniteHits<MeiliSearchArticle>()
  const { status, error, refresh } = useInstantSearch()

  if (error) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Text color="danger.500" fontWeight={700}>
            無法載入文章，請稍後再試
          </Text>
          <RetryButton onRetry={refresh} />
        </VStack>
      </Center>
    )
  }

  if (status === 'loading' && items.length === 0) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="theme.500" />
      </Center>
    )
  }

  if (items.length === 0 && status !== 'loading') {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          找不到相關文章
        </Text>
      </Box>
    )
  }

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={showMore}
      hasMore={!isLastPage}
      loader={<Loading isLoading onClick={showMore} />}
      endMessage={<End />}
      scrollableTarget="search-results-container"
    >
      <Stack spacing={4} pb={4}>
        {items.map(article => (
          <MemoizedSearchArticleCard key={article.id} article={article} />
        ))}
      </Stack>
    </InfiniteScroll>
  )
}
