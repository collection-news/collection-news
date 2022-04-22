import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image as ChakraImage,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
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
        <Tabs variant="unstyled">
          <TabList mt="6" mb="4">
            <ContentWrapper>
              <HStack
                overflow="auto"
                divider={<Divider w="8" borderWidth="2px" borderColor="theme" borderRadius="sm" />}
                p="2"
                justifyContent="center"
              >
                {mediaMap.map(({ key, brandName, range: [, lastDay] }) => (
                  <Tab
                    key={key}
                    _selected={{ color: 'white', bg: 'theme.500' }}
                    data-cy={`media-tab-${key}-btn`}
                    borderRadius="sm"
                  >
                    <Box>
                      <Box fontSize="lg">{brandName}</Box>
                      <Box fontSize="sm" whiteSpace="nowrap">{`${getZhFormatFromDateParam(lastDay)}`}</Box>
                    </Box>
                  </Tab>
                ))}
              </HStack>
            </ContentWrapper>
          </TabList>
          <TabPanels>
            {mediaDescMap.map(({ key, description, collectionNewsDescription }) => (
              <TabPanel key={key} p="0" bg="theme.500" py="6" px="2">
                <ContentWrapper>
                  <Box color="white">
                    <Box textAlign="center">{description}</Box>
                    <Divider my="4" />
                    <Box textAlign="center">{collectionNewsDescription}</Box>
                  </Box>
                </ContentWrapper>
                <Flex justifyContent="center" mt="4">
                  <Link href={`/${key}`} key={key} passHref>
                    <Button size="md" data-cy="show-articles-btn">
                      查閱所有文章
                    </Button>
                  </Link>
                </Flex>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
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
            <a href="https://github.com/appledailybackup/collection-news" target="_blank" rel="noreferrer">
              <IconButton aria-label="GitHub repository" isRound variant="link" size="lg" icon={<AiFillGithub />} />
            </a>
          </Flex>
        </ContentWrapper>
      </Box>
    </>
  )
}

export default Index
