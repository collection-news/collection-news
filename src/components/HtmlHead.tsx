import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { stripHtml } from 'string-strip-html'

type Props = {
  title: string
  imgUrl?: string
}

export const HtmlHead = ({ title, imgUrl }: Props) => {
  const router = useRouter()
  const url = process.env.APP_DOMAIN
    ? `${process.env.APP_DOMAIN}${router.asPath}`
    : router.pathname || window.location.href
  const safeTitle = stripHtml(title).result
  return (
    <Head>
      <title>{safeTitle}</title>
      <meta property="og:type" content="article" />
      <meta property="og:title" content={safeTitle} key="title" />
      {/* <meta property="og:description" content="" /> */}
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="果靈聞庫" />
      {imgUrl && <meta property="og:image" content={imgUrl} />}
    </Head>
  )
}
