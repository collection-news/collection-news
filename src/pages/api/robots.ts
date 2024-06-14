import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // ensure response is XML & gzip encoded
  res.setHeader('Content-Type', 'text/plain')

  res.status(200).send(`
Sitemap: ${process.env.APP_DOMAIN}/sitemap.xml

User-agent: *
Allow: /
Disallow: /api/*
	`)
}

export const runtime = 'experimental-edge'
