import { Box, Divider, Heading, Text, Tag, Fade, Flex } from '@chakra-ui/react'
import React from 'react'

import { HeaderBlock, HTMLBlock, ImageBlock, ListBlock, TableBlock, VideoBlock } from '../../components/ArticleBlocks'
import { Article, ContentElement, Story } from '../../types/appleDailyArticle'
import { ArticleHead } from '../../components/HtmlHead'
import { getArticleDesc, getCoverImageUrlFromStory } from '../../utils/dataHelper'
import { isEmpty, trim } from 'ramda'
import { getFullFormatFromTs } from '../../utils/date'
import { Carousel } from '../../components/Carousel'
import { useWindowScroll } from 'react-use'
import { NativeShareBtn } from '../../components/NativeShareBtn'

type Props = {
  article: Article
}

const getBlock = (block: ContentElement) => {
  // some every block can contain HTML, thus force to use HTML block
  switch (block.type) {
    case 'text':
    case 'html':
      return <HTMLBlock html={block.content} />
    case 'image':
      return <ImageBlock url={block.url} caption={block.caption} />
    case 'header':
      return (
        <HeaderBlock level={block.level}>
          <HTMLBlock html={block.content} />
        </HeaderBlock>
      )
    case 'list':
      return <ListBlock listType={block.listType} items={block.items} itemRender={getBlock} />
    case 'story':
      return <AppleDailyArticle article={block} />
    case 'table':
      return <TableBlock header={block.header} rows={block.rows} itemRender={getBlock} />
    case 'video':
      return <VideoBlock streams={block.streams} />
    default:
      return <></>
  }
}

const blackListedPrefix = ['_', ',', '-', '.', '/', '：', 'mt_', 'adfundhk_', 'theme_', 'column_', 'cat_', 'sample']

const filterTag = (tags: string[]) =>
  tags.filter(tag => {
    if (!tag || isEmpty(trim(tag))) return false
    if (blackListedPrefix.some(prefix => tag.startsWith(prefix))) return false
    if (!isNaN(Number(tag))) return false
    return true
  })

export const AppleDailyArticle: React.FC<Props> = ({ article }) => {
  const { y } = useWindowScroll()
  // FIXME: not yet handle video
  const imgSrc = getCoverImageUrlFromStory(article as Story)
  const desc = getArticleDesc(article)

  return (
    <>
      <ArticleHead title={article.title} imgUrl={imgSrc?.url} desc={desc} />
      <Heading data-cy="article-title" dangerouslySetInnerHTML={{ __html: article.title }} my={4} />
      <Box position="sticky" zIndex="sticky" top="header">
        <Fade in={y > 80} unmountOnExit>
          <Box position="absolute" w="100%">
            <Heading size="md" py={2} bg="bg.500" dangerouslySetInnerHTML={{ __html: article.title }} isTruncated />
            <Divider />
          </Box>
        </Fade>
      </Box>

      <Flex direction="row">
        <Text color="gray.500" my={2}>
          蘋果日報 {article.publishTimestamp ? getFullFormatFromTs(article.publishTimestamp) : '未知'}
        </Text>
        <NativeShareBtn title={article.title} text={desc} />
      </Flex>
      <Box my={2}>
        {filterTag(article.tags || []).map((tag, index) => (
          <Tag key={index} mr={2} borderRadius="sm" bg="brand.400">
            {tag}
          </Tag>
        ))}
      </Box>
      <Divider my={4} />
      {article.introElements && !isEmpty(article.introElements) && (
        <Box my={8}>
          <Carousel>
            {article.introElements.map((item, index) => (
              <Box key={index} mb={8}>
                {getBlock(item)}
              </Box>
            ))}
          </Carousel>
        </Box>
      )}
      {article.type === 'video' ? (
        <VideoBlock streams={article.streams || []} />
      ) : (
        <>
          {article.contentElements.map((item, index) => (
            <Box my={8} key={index}>
              {getBlock(item)}
            </Box>
          ))}
        </>
      )}
    </>
  )
}
