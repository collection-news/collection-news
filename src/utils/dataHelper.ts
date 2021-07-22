import { stripHtml } from 'string-strip-html'
import { Article, HTMLBlock, ImageBlock, TextBlock } from '../types/appleDailyArticle'

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
