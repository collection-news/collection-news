import { Box, Button, Flex, Heading, HStack, IconButton, Image as ChakraImage, Tabs, Separator } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { ContentWrapper } from '../components/ContentWrapper'
import { NonArticleHead } from '../components/HtmlHead'
import { Markdown } from '../components/Markdown'
import { mediaDescMap } from '../constants/mediaMeta/desc'
import AboutUs from '../containers/AboutUs.mdx'
import QA from '../containers/Q&A.mdx'
import CopyRightContent from '../containers/CopyRight.mdx'
import { AiFillGithub } from 'react-icons/ai'
import { getZhFormatFromDateParam } from '../utils/date'
import { mediaMap } from '../constants/mediaMeta'
import Banner from '../components/Banner'

const Index: React.FC = () => {
  return (
    <>
      <NonArticleHead title="聞庫" />
      <Banner />
      <Box pt="8">
        <Flex justifyContent="center">
          <Heading as="h3" size="md" px="4" py="2" borderRadius="sm" bg="theme.500" color="white">
            我們失去了甚麼？
          </Heading>
        </Flex>
        <Tabs.Root unstyled defaultValue={mediaMap[0].key}>
          <Tabs.List mt="6" mb="4">
            <ContentWrapper>
              <HStack
                overflow="auto"
                p="2"
                justifyContent="center"
                separator={<Box w="8" borderTopWidth="2px" borderColor="theme.500" borderRadius="sm" />}
              >
                {mediaMap.map(({ key, brandName, range: [, lastDay] }) => (
                  <Tabs.Trigger
                    value={key}
                    px="4"
                    py="2"
                    key={key}
                    _selected={{ color: 'white', bg: 'theme.500' }}
                    data-cy={`media-tab-${key}-btn`}
                    borderRadius="sm"
                  >
                    <Box>
                      <Box fontSize="lg">{brandName}</Box>
                      <Box fontSize="sm" whiteSpace="nowrap">{`${getZhFormatFromDateParam(lastDay)}`}</Box>
                    </Box>
                  </Tabs.Trigger>
                ))}
              </HStack>
            </ContentWrapper>
          </Tabs.List>
          {mediaDescMap.map(({ key, description, collectionNewsDescription }) => (
            <Tabs.Content value={key} key={key} p="0" bg="theme.500" py="6" px="2">
              <ContentWrapper>
                <Box color="white">
                  <Box textAlign="center">{description}</Box>
                  <Separator my="4" />
                  <Box textAlign="center">{collectionNewsDescription}</Box>
                </Box>
              </ContentWrapper>
              <Flex justifyContent="center" mt="4">
                <Button size="md" data-cy={`show-articles-btn-${key}`} asChild key={key}>
                  <Link href={`/${key}`}>查閱所有文章</Link>
                </Button>
              </Flex>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Box>
      <Box py="6">
        <Flex justifyContent="center" mb="6">
          <Heading as="h3" size="md" px="4" py="2" borderRadius="sm" bg="theme.500" color="white">
            關於我們
          </Heading>
        </Flex>
        <ContentWrapper>
          <Markdown>
            <AboutUs />
          </Markdown>
        </ContentWrapper>
      </Box>
      <Box py="6">
        <Flex justifyContent="center" mb="6">
          <Heading as="h3" size="md" px="4" py="2" borderRadius="sm" bg="theme.500" color="white">
            你問我答
          </Heading>
        </Flex>
        <ContentWrapper>
          <Markdown>
            <QA />
          </Markdown>
        </ContentWrapper>
      </Box>
      <Box bg="theme.500" color="white" fontSize="xs" py="4">
        <ContentWrapper>
          <Markdown>
            <CopyRightContent />
          </Markdown>
          <Flex align="center">
            <a rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
              <ChakraImage
                alt="Creative Commons License"
                src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"
                border={0}
                display="inline-block"
              />
            </a>
            <IconButton aria-label="GitHub repository" borderRadius="full" variant="plain" size="lg" asChild>
              <a href="https://github.com/collection-news/collection-news" target="_blank" rel="noreferrer">
                <AiFillGithub />
              </a>
            </IconButton>
          </Flex>
        </ContentWrapper>
      </Box>
    </>
  )
}

export default Index
