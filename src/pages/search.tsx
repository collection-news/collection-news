import Script from 'next/script'
import React from 'react'

import { ContentWrapper } from '../components/ContentWrapper'
import { NonArticleHead } from '../components/HtmlHead'

export default function SearchPage() {
  return (
    <>
      <NonArticleHead title="搜尋 | 果靈聞庫" />
      <Script async src="https://cse.google.com/cse.js?cx=a6fb8c7f8fe6c2f5f" strategy="beforeInteractive" />
      <ContentWrapper>
        <div className="gcse-search"></div>
      </ContentWrapper>
    </>
  )
}
