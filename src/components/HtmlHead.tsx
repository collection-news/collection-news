import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { stripHtml } from 'string-strip-html'
import { media } from '../constants/media'
import { Article } from 'schema-dts'
import { jsonLdScriptProps } from 'react-schemaorg'
import { getMedia, getTitle } from '../utils/dataHelper'
import { getFormatForJsonLd, getISOFormatFromTs } from '../utils/date'

type NonArticleHeadProps = {
  title: string
}

function useURLAndLogoSrc() {
  const router = useRouter()
  const url = process.env.APP_DOMAIN
    ? `${process.env.APP_DOMAIN}${router.asPath}` // server-side
    : window.location.href // client-side
  const logoSrc = process.env.APP_DOMAIN
    ? `${process.env.APP_DOMAIN}/og-banner.png` // server-side
    : window.location.origin + '/og-banner.png' // client-side
  return { url, logoSrc }
}

export const NonArticleHead: React.FC<NonArticleHeadProps> = ({ title }) => {
  const { url, logoSrc } = useURLAndLogoSrc()
  const desc = '《蘋果日報》/《立場新聞》文章存檔'
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={desc} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} key="title" />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="聞庫" />
      <meta property="og:image" content={logoSrc} />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={desc} />
      <meta property="twitter:image" content={logoSrc} />
    </Head>
  )
}

type ArticleHeadProp = {
  title: string
  imgUrl?: string
  desc: string
  media?: media
  publishTimestamp: string | null
}

export const ArticleHead: React.FC<ArticleHeadProp> = ({ title, imgUrl, desc, media, publishTimestamp }) => {
  const { url, logoSrc } = useURLAndLogoSrc()
  const safeTitle = stripHtml(title).result
  const ogTitle = getTitle(safeTitle, media)
  const mediaData = getMedia(media)
  const safeImgUrl = imgUrl || logoSrc
  return (
    <Head>
      <title>{ogTitle}</title>
      <meta name="title" content={ogTitle} />
      <meta name="description" content={desc} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle} key="title" />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="聞庫" />
      <meta property="og:image" content={safeImgUrl} />
      {publishTimestamp && <meta property="article:published_time" content={getISOFormatFromTs(publishTimestamp)} />}
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={ogTitle} />
      <meta property="twitter:description" content={desc} />
      <meta property="twitter:image" content={safeImgUrl} />
      {/* JSON-LD */}
      <script
        {...jsonLdScriptProps<Article>({
          '@context': 'https://schema.org',
          '@type': 'Article',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
          },
          ...(mediaData
            ? {
                author: {
                  '@type': 'Organization',
                  name: mediaData.brandName,
                },
              }
            : {}),
          publisher: {
            '@type': 'Organization',
            name: '聞庫',
            logo: {
              '@type': 'ImageObject',
              url: logoSrc,
            },
          },
          headline: ogTitle,
          image: safeImgUrl,
          datePublished: publishTimestamp ? getFormatForJsonLd(publishTimestamp) : '',
        })}
      />
    </Head>
  )
}
