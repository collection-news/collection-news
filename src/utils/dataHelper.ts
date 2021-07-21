import { Article, ImageBlock } from '../types/appleDailyArticle'

export const getCoverImageUrlFromStory = (article: Article): ImageBlock | null => {
  return article.type === 'video'
    ? null
    : (((article.introElements && article.introElements.find(_ => _.type === 'image')) ||
        article.contentElements.find(({ type }) => type === 'image')) as ImageBlock | null)
}
