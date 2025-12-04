import { appleDaily } from './appleDaily'
import { theStandNews } from './theStandNews'

export const categoryMap: Record<string, string> = {
  ...appleDaily.categoryList.reduce((acc, cur) => ({ ...acc, [cur.engName]: cur.chiName }), {}),
  ...theStandNews.categoryList.reduce((acc, cur) => ({ ...acc, [cur.engName]: cur.chiName }), {}),
}
