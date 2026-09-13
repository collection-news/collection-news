import { expect, it, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../../src/pages/api/health'

it.each(['abc123', ''])('reports runtime release identity without caching (%s)', release => {
  vi.stubEnv('APP_RELEASE_SHA', release)
  const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() }
  handler({} as NextApiRequest, res as unknown as NextApiResponse)
  expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.json).toHaveBeenCalledWith({ status: 'ok', release: release || null })
})
