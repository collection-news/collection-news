import { beforeEach, describe, expect, it, vi } from 'vitest'
import { compress, uncompress } from 'snappy'

const mocks = vi.hoisted(() => ({ send: vi.fn(), onCreation: vi.fn() }))
vi.mock('@fortedigital/nextjs-cache-handler', () => ({ CacheHandler: { onCreation: mocks.onCreation } }))
vi.mock('@aws-sdk/client-s3', async importOriginal => {
  const actual = await importOriginal<typeof import('@aws-sdk/client-s3')>()
  return {
    ...actual,
    S3Client: class {
      send = mocks.send
    },
  }
})
import '../../cache-handler.mjs'

// Registration happens at import time; Vitest clears mock history before each test.
const createHandlers = mocks.onCreation.mock.calls[0][0]

type CacheValue = { value: unknown; lastModified?: number; tags?: string[] }
type Handler = {
  get: (key: string) => Promise<CacheValue>
  set: (key: string, value: CacheValue) => Promise<void>
  delete: (key: string) => Promise<void>
  revalidateTag: (tag: string) => Promise<void>
}
let memory: Handler
let storage: Handler

beforeEach(async () => {
  mocks.send.mockReset()
  vi.stubEnv('APP_ISR_CACHE_BUCKET_NAME', 'fixture-cache')
  const created = await createHandlers({ buildId: 'test-build' })
  ;[memory, storage] = created.handlers
})

describe('optional cache handler, with a mocked storage client', () => {
  it('keeps null entries in memory and supports deletion', async () => {
    await expect(memory.get('/missing')).rejects.toThrow('cache miss')
    const entry = { value: null, lastModified: 1 }
    await memory.set('/missing', entry)
    expect(await memory.get('/missing')).toEqual(entry)
    await memory.delete('/missing')
    await expect(memory.get('/missing')).rejects.toThrow('cache miss')
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('does not keep non-null entries in the null cache', async () => {
    await memory.set('/article', { value: { html: 'article' } })
    await expect(memory.get('/article')).rejects.toThrow('cache miss')
  })

  it('does not upload a null entry', async () => {
    await storage.set('/missing', { value: null })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('compresses non-null entries and scopes the storage key to the build', async () => {
    const value = { value: { html: '<p>香港</p>' }, lastModified: 12 }
    await storage.set('/article', value)
    const command = mocks.send.mock.calls[0][0]
    expect(command.constructor.name).toBe('PutObjectCommand')
    expect(command.input).toMatchObject({ Bucket: 'fixture-cache', Key: 'isr-cache/test-build/article' })
    expect(JSON.parse(String(await uncompress(command.input.Body, { asBuffer: false })))).toEqual(value)
  })

  it('reads and decompresses an entry', async () => {
    const value = { value: { html: '<p>cached</p>' } }
    const bytes = await compress(JSON.stringify(value))
    mocks.send.mockResolvedValue({ Body: { transformToByteArray: async () => bytes } })
    expect(await storage.get('/article')).toEqual(value)
    expect(mocks.send.mock.calls[0][0].constructor.name).toBe('GetObjectCommand')
  })

  it('uses the matching scoped key when deleting a remote entry', async () => {
    await storage.delete('/article')
    expect(mocks.send.mock.calls[0][0].constructor.name).toBe('DeleteObjectCommand')
    expect(mocks.send.mock.calls[0][0].input).toEqual({ Bucket: 'fixture-cache', Key: 'isr-cache/test-build/article' })
  })

  it.each(['get', 'set', 'delete'] as const)('propagates storage %s failure', async operation => {
    mocks.send.mockRejectedValue(new Error('storage unavailable'))
    await expect(storage[operation]('/article', { value: 'entry' })).rejects.toThrow('storage unavailable')
  })

  it('rejects a corrupt compressed response', async () => {
    mocks.send.mockResolvedValue({ Body: { transformToByteArray: async () => Buffer.from('corrupt') } })
    await expect(storage.get('/article')).rejects.toThrow()
  })

  it('keeps separate builds and memory instances isolated', async () => {
    await memory.set('/missing', { value: null })
    const next = await createHandlers({ buildId: 'other-build' })
    await expect(next.handlers[0].get('/missing')).rejects.toThrow('cache miss')
    await next.handlers[1].set('/article', { value: 'new entry' })
    expect(mocks.send.mock.calls[0][0].input.Key).toBe('isr-cache/other-build/article')
  })

  it('invalidates matching memory tags but leaves remote tag invalidation a no-op (LEGACY-08)', async () => {
    await memory.set('/missing', { value: null, tags: ['tag'] })
    await memory.set('/other', { value: null, tags: ['other'] })
    await memory.revalidateTag('tag')
    await storage.revalidateTag('tag')
    await expect(memory.get('/missing')).rejects.toThrow('cache miss')
    expect(await memory.get('/other')).toEqual({ value: null, tags: ['other'] })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('characterizes missing memory tags causing invalidation to reject (LEGACY-08)', async () => {
    await memory.set('/missing', { value: null })
    await expect(memory.revalidateTag('tag')).rejects.toThrow('includes')
  })
})
