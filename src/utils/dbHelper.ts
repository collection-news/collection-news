import produce from 'immer'

import { Article } from '../types/appleDailyArticle'

const ASSET_CDN_HOST = process.env.APP_ASSET_CDN_HOST

function replaceUrlDomain2CDN(url: string) {
  try {
    // more defensive to handle malform data
    const newURL = new URL(url)
    ASSET_CDN_HOST && (newURL.host = ASSET_CDN_HOST)
    return newURL.href
  } catch (error) {
    const regex = new RegExp(/^[A-Z0-9]*\.(jpg|png|gif|jpeg)$/, 'g')
    const shouldReplace = regex.test(url)
    if (shouldReplace && ASSET_CDN_HOST) {
      return `https://${ASSET_CDN_HOST}/appledaily-ipfs-media/${url}`
    } else {
      return url
    }
  }
}

export function replaceCDNDomainForArticle(article: Article): Article {
  return produce(article, draftArticle => {
    if (draftArticle.type === 'story') {
      draftArticle.introElements?.forEach(media => {
        if (media.type === 'image') {
          media.url = replaceUrlDomain2CDN(media.url)
        }
      })
      draftArticle.contentElements.forEach(elm => {
        if (elm.type === 'image') {
          elm.url = replaceUrlDomain2CDN(elm.url)
        }
      })
    }
  })
}
