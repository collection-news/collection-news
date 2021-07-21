import { AspectRatio, Box, Flex, Tag, Text, Tooltip } from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'

import { Article, Story, Video } from '../types/appleDailyArticle'
import { getCoverImageUrlFromStory } from '../utils/dataHelper'
import { getFullFormatFromTs } from '../utils/date'
import { appleDailyCategoryList } from '../constants/appleDailyCategory'
import { Empty } from './Empty'
import { Image } from './Image'

type Props = { article: Article }

export const AppleDailyArticleCard: React.FC<Props> = ({ article }) => {
  switch (article.type) {
    case 'video':
      return <AppleDailyVideoCard story={article as Video} />
    case 'story':
      return <AppleDailyStoryCard story={article as Story} />
  }
}

const AppleDailyVideoCard: React.FC<{ story: Video }> = ({ story }) => {
  return (
    <Tooltip label="尚未支援影片文章" aria-label="Not supported article type">
      <Flex
        justifyContent="flex-end"
        flexDirection="column"
        border="1px"
        borderColor="theme.100"
        boxShadow="base"
        minWidth={72}
        data-cy="article-card"
        borderRadius="sm"
      >
        <AspectRatio ratio={16 / 9}>
          <Empty />
        </AspectRatio>
        <Box m={2}>
          <Text
            fontSize="md"
            fontWeight="bold"
            noOfLines={2}
            mb={2}
            dangerouslySetInnerHTML={{ __html: story.title }}
            minH={12}
          />
          <Flex align="center">
            <Tag mr={2} size="sm" bgColor="gray.400" borderRadius="sm">
              影片
            </Tag>
            <CategoryTag category={story.category} />
            {story.publishTimestamp && <Text fontSize="sm">{getFullFormatFromTs(story.publishTimestamp)}</Text>}
          </Flex>
        </Box>
      </Flex>
    </Tooltip>
  )
}

const AppleDailyStoryCard: React.FC<{ story: Story }> = ({ story }) => {
  const coverImg = getCoverImageUrlFromStory(story)
  return (
    <Link href={`/${story.media}/articles/${story.articleId}`} passHref>
      <Box
        as="a"
        border="1px"
        borderColor="theme.100"
        boxShadow="base"
        _hover={{ cursor: 'pointer' }}
        minWidth={72}
        data-cy="article-card"
        borderRadius="sm"
      >
        <AspectRatio ratio={16 / 9}>
          <Image src={coverImg?.url} alt={coverImg?.caption || ''} />
        </AspectRatio>
        <Box m={2}>
          <Text
            fontSize="md"
            fontWeight="bold"
            noOfLines={2}
            mb={2}
            dangerouslySetInnerHTML={{ __html: story.title }}
            minH={12}
          />
          <Flex align="center">
            <CategoryTag category={story.category} />
            {story.publishTimestamp && <Text fontSize="sm">{getFullFormatFromTs(story.publishTimestamp)}</Text>}
          </Flex>
        </Box>
      </Box>
    </Link>
  )
}

const CategoryTag = ({ category }: { category: string }) => {
  const catData = appleDailyCategoryList.find(_ => _.category === category)
  return (
    <Tag mr={2} size="sm" bgColor={catData?.color || 'gray.400'} borderRadius="sm">
      {catData?.text || '未知'}
    </Tag>
  )
}
