import { Text, Box } from '@chakra-ui/react'
import { GetStaticProps } from 'next'
import Script from 'next/script'
import React from 'react'

import { ContentWrapper } from '../components/ContentWrapper'
import { NonArticleHead } from '../components/HtmlHead'
import { getLatestGoogleIndexCount } from '../services/dynamo'

type SearchPageProps = {
  indexedCount: number
}

export const getStaticProps: GetStaticProps<SearchPageProps> = async ({ params }) => {
  const indexedCount = await getLatestGoogleIndexCount()
  return { props: { indexedCount }, revalidate: 7200 }
}

export default function SearchPage({ indexedCount }: SearchPageProps) {
  const indexedCountStr = new Intl.NumberFormat().format(indexedCount)
  const totalCountStr = new Intl.NumberFormat().format(2230271)
  return (
    <>
      <NonArticleHead title="搜尋 | 果靈聞庫" />
      <Script
        async
        src="https://cse.google.com/cse.js?cx=a6fb8c7f8fe6c2f5f"
        strategy="beforeInteractive"
        key="google-search"
      />
      <ContentWrapper>
        {indexedCount && (
          <Box mt={2} ml={4}>
            <Text as="p">{`Google現己索引 ${indexedCountStr}/${totalCountStr} 篇文章`}</Text>
            <Text as="p">{'暫時未能搜尋所有文章，敬請原諒。'}</Text>
          </Box>
        )}
        <div className="gcse-search"></div>
      </ContentWrapper>
    </>
  )
}
