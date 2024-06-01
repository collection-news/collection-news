import { produce } from 'immer'
import { omit } from 'ramda'
import { media } from '../constants/media'
import zlib from 'zlib'

import { Article } from '../types/article'

const ASSET_CDN_HOST = process.env.APP_ASSET_CDN_HOST
const resizeParams = '/cdn-cgi/image/fit=scale-down,width=640,metadata=none,onerror=redirect,f=auto'

function replaceDefaultUrlDomain2CDN(url: string) {
  try {
    const oldUrl = new URL(url)
    const newURL = new URL(url)
    ASSET_CDN_HOST && (newURL.host = ASSET_CDN_HOST)
    ASSET_CDN_HOST && (newURL.pathname = resizeParams + '/' + oldUrl.hostname + newURL.pathname) // console.log(newURL.href)
    return newURL.href
  } catch (error) {
    return url
  }
}
function replaceAppleDailyUrlDomain2CDN(url: string) {
  try {
    // more defensive to handle malform data
    const newURL = new URL(url)
    ASSET_CDN_HOST && (newURL.host = ASSET_CDN_HOST)
    ASSET_CDN_HOST && (newURL.pathname = resizeParams + newURL.pathname)
    return newURL.href
  } catch (error) {
    const regex = new RegExp(/^[A-Z0-9]*\.(jpg|png|gif|jpeg)$/, 'g')
    const shouldReplace = regex.test(url)
    if (shouldReplace && ASSET_CDN_HOST) {
      return `https://${ASSET_CDN_HOST}${resizeParams}/appledaily-ipfs-media/${url}`
    } else {
      return url
    }
  }
}

const replaceUrlDomain2CDN = (url: string, mediaKey: media) => {
  switch (mediaKey) {
    case media.APPLE_DAILY:
      return replaceAppleDailyUrlDomain2CDN(url)
    default:
      return replaceDefaultUrlDomain2CDN(url)
  }
}

export function replaceCDNDomainForArticle(article: Article): Article {
  return produce(article, draftArticle => {
    if (draftArticle.type === 'story') {
      draftArticle.introElements?.forEach(media => {
        if (media.type === 'image') {
          media.url = replaceUrlDomain2CDN(media.url, article.media)
        }
      })
      draftArticle.contentElements.forEach(elm => {
        if (elm.type === 'image') {
          elm.url = replaceUrlDomain2CDN(elm.url, article.media)
        }
      })
    }
  })
}

export async function unGZipArticle(article: Article): Promise<Article> {
  if (article.type !== 'story' || !article?.contentElementsGziped) return article
  const buffer = article.contentElementsGziped
  const result: string = await new Promise(resolve => {
    zlib.gunzip(buffer, (err, buffer) => {
      resolve(buffer.toString('utf8'))
    })
  })

  return { ...omit(['contentElementsGziped'], article), contentElements: JSON.parse(result) }
}
