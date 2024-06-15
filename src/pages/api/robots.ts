import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // ensure response is XML & gzip encoded
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')

  res.status(200).send(`
Sitemap: ${process.env.APP_DOMAIN}/sitemap.xml

User-agent: *
Allow: /
Disallow: /api/*
	`)
}
