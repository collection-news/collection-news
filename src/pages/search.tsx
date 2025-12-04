import { useRouter } from 'next/router'
import * as React from 'react'
import { SearchModal } from '../components/Search/SearchModal'
import { NonArticleHead } from '../components/HtmlHead'

const SearchPage = () => {
  const router = useRouter()

  // Only render modal when query is ready to avoid flash
  if (!router.isReady) return null

  return (
    <>
      <NonArticleHead title="搜尋 | 聞庫" />
      <SearchModal isPageView isOpen useRouter />
    </>
  )
}

export default SearchPage
