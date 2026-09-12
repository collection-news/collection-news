import { Writable } from 'node:stream'
import type { NextApiRequest, NextApiResponse } from 'next'
import { vi } from 'vitest'

export function apiRequest(overrides: Partial<NextApiRequest> = {}): NextApiRequest {
  return { method: 'GET', query: {}, body: undefined, ...overrides } as NextApiRequest
}

export function apiResponse() {
  const headers = new Map<string, unknown>()
  const chunks: Buffer[] = []
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk))
      callback()
    },
  })
  const response = Object.assign(stream, {
    statusCode: 200,
    setHeader: vi.fn((name: string, value: unknown) => {
      headers.set(name.toLowerCase(), value)
      return response
    }),
    status: vi.fn((code: number) => {
      response.statusCode = code
      return response
    }),
    json: vi.fn((_body: unknown) => response),
    send: vi.fn((_body: unknown) => response),
  })
  return {
    response,
    res: response as unknown as NextApiResponse,
    headers,
    body: () => Buffer.concat(chunks),
  }
}
