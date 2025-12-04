import type { NextApiRequest, NextApiResponse } from 'next'
import { MultiSearchResponse } from 'meilisearch'
import { MeiliSearchArticle } from '../../types/api'
import { replaceUrlDomain2CDN } from '../../utils/dbHelper'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '128kb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.APP_ENABLE_MEILISEARCH !== 'true') {
    return res.status(404).end()
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const meiliHost = process.env.APP_MEILI_HOST
  const meiliKey = process.env.APP_MEILI_SEARCH_KEY

  if (!meiliHost || !meiliKey) {
    console.error('APP_MEILI_HOST or APP_MEILI_SEARCH_KEY not set')
    return res.status(500).json({ error: 'Internal Server Error' })
  }

  let body = req.body

  if (req.method === 'GET') {
    const { q } = req.query
    if (typeof q === 'string') {
      try {
        const decoded = Buffer.from(q, 'base64').toString('utf-8')
        body = JSON.parse(decoded)
      } catch (e) {
        console.error('Failed to parse query param', e)
        return res.status(400).json({ error: 'Invalid query parameter' })
      }
    }
  }

  try {
    const response = await fetch(`${meiliHost}/multi-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${meiliKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Meilisearch error:', response.status, data)
    } else {
      ;(data as MultiSearchResponse<MeiliSearchArticle>).results.forEach(result => {
        result.hits.forEach(hit => (hit.coverUrl = hit.coverUrl && replaceUrlDomain2CDN(hit.coverUrl, hit.media)))
      })
      // Cache successful responses for 1 hour (3600 seconds) on shared caches like Cloudflare.
      // `s-maxage` is for shared caches, `max-age` is for the client's browser.
      res.setHeader('Cache-Control', 's-maxage=3600, max-age=0, public')
    }
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
