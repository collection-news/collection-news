// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as yup from 'yup'
import { media } from '../../constants/media'

import { getArticlesByDateAndCat } from '../../services/dynamo'
import { ArticleListResponse, OrderOption } from '../../types/api'
import { isDev } from '../../utils/config'

const schema = yup.object().shape({
  media: yup.string().optional().default('appledaily'),
  publishDate: yup.string().required(),
  category: yup.string().optional(),
  nextCursor: yup.string().optional(),
  getVideo: yup.boolean().optional().default(false),
  limit: yup.number().optional(),
  order: yup.string().optional().oneOf(['asc', 'desc']),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse<ArticleListResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  try {
    const params = await schema.validate(req.query)
    const { media, publishDate, category, nextCursor, limit, order, getVideo } = params
    const o = order as OrderOption | undefined
    const resp = await getArticlesByDateAndCat(
      { media: media as media, publishDate, category, getVideo },
      { limit, nextCursor, order: o }
    )
    if (!isDev) {
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable')
    }
    return res.status(200).json(resp)
  } catch (error: any) {
    return res.status(400).json(error)
  }
}
