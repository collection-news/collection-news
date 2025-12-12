import { produce } from 'immer'
import { omit } from 'ramda'
import { media } from '../constants/media'
import zlib from 'zlib'

import { Article } from '../types/article'

const ASSET_CDN_HOST = process.env.APP_ASSET_CDN_HOST
const resizeParams = '/cdn-cgi/image/fit=scale-down,width=640,metadata=none,onerror=redirect,f=auto'

/**
 * Extracts the Apple Daily resizer path from the given URL if it matches specific criteria.
 * This is to cater the malform coverUrl data inside meilisearch
 * @param {string} url - The URL from which to extract the resizer path.
 * @return {string | null} Returns the extracted resizer path if the hostname and pathname match the Apple Daily resizer format; otherwise, returns null.
 */
export function extractAppleDailyResizerPath(url: string): string | null {
  try {
    const parsed = new URL(url)
    const isResizerHost = parsed.hostname === 'hk.appledaily.com'
    const isResizerPath = parsed.pathname.startsWith('/resizer/')

    if (!isResizerHost || !isResizerPath) return null

    const appleDailyIndex = parsed.pathname.indexOf('/appledaily/')
    return appleDailyIndex >= 0 ? parsed.pathname.slice(appleDailyIndex) : null
  } catch (error) {
    return null
  }
}

function replaceDefaultUrlDomain2CDN(url: string) {
  try {
    const oldUrl = new URL(url)
    const newURL = new URL(url)
    ASSET_CDN_HOST && (newURL.host = ASSET_CDN_HOST)
    ASSET_CDN_HOST && (newURL.pathname = resizeParams + '/' + oldUrl.hostname + newURL.pathname)
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
    ASSET_CDN_HOST && (newURL.pathname = resizeParams + (extractAppleDailyResizerPath(url) ?? newURL.pathname))
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

export const replaceUrlDomain2CDN = (url: string, mediaKey: media) => {
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
