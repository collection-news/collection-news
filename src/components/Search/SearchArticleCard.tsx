import { AspectRatio, Box, Flex, Heading, Text, LinkBox, LinkOverlay, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { Highlight, Snippet } from 'react-instantsearch'
import { MeiliSearchArticle } from '../../types/api'
import { ArticleImage } from '../Image'
import { Badge } from '@chakra-ui/react'
import { getDayPartFromDate } from '../../utils/date'
import { Hit } from 'instantsearch.js'
import classes from './SearchHighlights.module.css'

export type Props = {
  article: MeiliSearchArticle
}

const MediaBadge = ({ media }: { media: MeiliSearchArticle['media'] }) => {
  const colorScheme = media === 'appledaily' ? 'orange' : 'teal'
  const label = media === 'appledaily' ? '蘋果日報' : '立場新聞'
  return <Badge colorPalette={colorScheme}>{label}</Badge>
}

export const SearchArticleCard = ({ article }: Props) => {
  return (
    <LinkBox
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      _hover={{ shadow: 'md', borderColor: 'gray.300', bg: 'gray.50' }}
      transition="all 0.2s"
      data-cy="search-article-card"
    >
      <Flex direction={{ base: 'column', sm: 'row' }}>
        <Box width={{ base: '100%', sm: '200px' }} flexShrink={0}>
          <AspectRatio ratio={16 / 9}>
            <ArticleImage src={article.coverUrl || undefined} alt={article.title} />
          </AspectRatio>
        </Box>
        <Box p={4} flex="1">
          <VStack align="flex-start" gap={2}>
            <Heading size="md" lineClamp={2} lineHeight="base">
              <Link href={`/${article.media}/articles/${article.id}`} legacyBehavior passHref>
                <LinkOverlay>
                  <Highlight
                    attribute="title"
                    hit={article as Hit<MeiliSearchArticle>}
                    classNames={{ highlighted: classes.highlightedTitle }}
                  />
                </LinkOverlay>
              </Link>
            </Heading>
            <Flex align="center" wrap="wrap" gap={2}>
              <MediaBadge media={article.media} />
              <Text fontSize="sm" color="gray.500">
                {getDayPartFromDate(article.publish_date)}
              </Text>
            </Flex>
            <Text fontSize="sm" color="gray.600" lineClamp={3}>
              <Snippet
                attribute="content"
                hit={article as Hit<MeiliSearchArticle>}
                classNames={{ highlighted: classes.highlightedContent }}
              />
            </Text>
          </VStack>
        </Box>
      </Flex>
    </LinkBox>
  )
}
