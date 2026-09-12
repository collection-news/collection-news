import { stripHtml } from 'string-strip-html'
import { mediaMap } from '../constants/mediaMeta'
import { Article, HTMLBlock, ImageBlock, TextBlock } from '../types/article'
import randomColor from 'randomcolor'
import { media } from '../constants/media'
import { CategoryItem } from '../types/mediaMeta'

export const getCoverImageUrlFromStory = (article: Article): ImageBlock | null => {
  return article.type === 'video'
    ? null
    : (((article.introElements && article.introElements.find(_ => _.type === 'image')) ||
        article.contentElements.find(({ type }) => type === 'image')) as ImageBlock | null)
}

export const getArticleDesc = (article: Article): string => {
  if (article.type === 'video') {
    return ''
  } else {
    const block = article.contentElements.find(({ type }) => type === 'text' || type === 'html') as
      | TextBlock
      | HTMLBlock
      | undefined
    return stripHtml(block?.content || '').result
  }
}

export const getMedia = (matchKey?: media) => mediaMap.find(({ key }) => key === matchKey)

export const getTitle = (title: string, matchKey?: media) => {
  const matchedMedia = mediaMap.find(({ key }) => key === matchKey)

  return `${title} | ${matchedMedia ? `${matchedMedia.brandName}•` : ''}聞庫`
}

export const getCategory = (list: CategoryItem[], matchEngName?: string) =>
  list.find(({ engName }) => engName === matchEngName)

export const getCategoryColor = (name: string) => randomColor({ luminosity: 'light', seed: name })
