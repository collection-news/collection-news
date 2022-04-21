import { Text, Box } from '@chakra-ui/react'
import { GetStaticProps } from 'next'
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

const googleSearchHtml = `
<script async src="https://cse.google.com/cse.js?cx=a6fb8c7f8fe6c2f5f"> </script>
<div class="gcse-search"></div>
`

export default function SearchPage({ indexedCount }: SearchPageProps) {
  const indexedCountStr = new Intl.NumberFormat().format(indexedCount)
  return (
    <>
      <NonArticleHead title="搜尋 | 聞庫" />
      <ContentWrapper>
        {indexedCount && (
          <Box mt={2} ml={4}>
            <Text as="p">{`Google現己索引 ${indexedCountStr} 篇文章`}</Text>
          </Box>
        )}
        <div dangerouslySetInnerHTML={{ __html: googleSearchHtml }} />
      </ContentWrapper>
    </>
  )
}
