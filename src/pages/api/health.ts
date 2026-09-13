import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ status: 'ok', release: process.env.APP_RELEASE_SHA || null })
}
