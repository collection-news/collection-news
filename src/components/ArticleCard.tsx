import { AspectRatio, Box, Flex, Tag, Text, Tooltip } from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'

import { Article, Story, Video } from '../types/article'
import { getCategory, getCategoryColor, getCoverImageUrlFromStory, getMedia } from '../utils/dataHelper'
import { getFullFormatFromTs } from '../utils/date'
import { Empty } from './Empty'
import { ArticleImage } from './Image'
import { CategoryItem } from '../types/mediaMeta'

type Props = { article: Article }

export const ArticleCard: React.FC<Props> = ({ article }) => {
  const categoryList = getMedia(article.media)?.categoryList || []
  const category = getCategory(categoryList, article.category)
  switch (article.type) {
    case 'video':
      return <VideoCard story={article as Video} category={category} />
    case 'story':
      return <StoryCard story={article as Story} category={category} />
  }
}

const VideoCard: React.FC<{ story: Video; category?: CategoryItem }> = ({ story, category }) => {
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
            <CategoryTag category={category} />
            {story.publishTimestamp && <Text fontSize="sm">{getFullFormatFromTs(story.publishTimestamp)}</Text>}
          </Flex>
        </Box>
      </Flex>
    </Tooltip>
  )
}

const StoryCard: React.FC<{ story: Story; category?: CategoryItem }> = ({ story, category }) => {
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
          <ArticleImage src={coverImg?.url} alt={coverImg?.caption || ''} />
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
            <CategoryTag category={category} />
            {story.publishTimestamp && <Text fontSize="sm">{getFullFormatFromTs(story.publishTimestamp)}</Text>}
          </Flex>
        </Box>
      </Box>
    </Link>
  )
}

const CategoryTag = ({ category }: { category?: CategoryItem }) => {
  return (
    <Tag mr={2} size="sm" bgColor={category ? getCategoryColor(category.engName) : 'gray.300'} borderRadius="sm">
      {category?.chiName || '未知'}
    </Tag>
  )
}
