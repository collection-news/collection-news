import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { uncompress } from 'snappy'

const storage = vi.hoisted(() => ({ objects: new Map() }))
vi.mock('@aws-sdk/client-s3', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    S3Client: class {
      async send(command) {
        const { Key, Body } = command.input
        switch (command.constructor.name) {
          case 'PutObjectCommand':
            storage.objects.set(Key, Body)
            return {}
          case 'GetObjectCommand': {
            const bytes = storage.objects.get(Key)
            if (!bytes) throw new Error('NoSuchKey')
            return { Body: { transformToByteArray: async () => bytes } }
          }
          case 'DeleteObjectCommand':
            storage.objects.delete(Key)
            return {}
          default:
            throw new Error(`Unexpected storage command: ${command.constructor.name}`)
        }
      }
    },
  }
})

// Exercise the real cache library and production adapter; only object storage is replaced.
import CacheHandler from '../../cache-handler.mjs'

let directory
let cache
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'collection-cache-'))
  const serverDistDir = path.join(directory, 'server')
  await mkdir(serverDistDir)
  await writeFile(path.join(directory, 'BUILD_ID'), 'integration-build')
  await writeFile(
    path.join(directory, 'prerender-manifest.json'),
    JSON.stringify({ version: 4, routes: {}, dynamicRoutes: {} })
  )
  cache = new CacheHandler({ serverDistDir, dev: false })
})
afterAll(async () => {
  await rm(directory, { recursive: true, force: true })
})
beforeEach(() => {
  storage.objects.clear()
})

it('treats missing object storage entries as cache misses', async () => {
  expect(await cache.get('/absent')).toBeNull()
})

it('round-trips a Pages Router entry with metadata and compressed build-scoped storage', async () => {
  const page = { kind: 'PAGES', html: '<p>香港</p>', pageData: { title: '香港' }, status: 200 }
  await cache.set('/article', page, { cacheControl: { revalidate: 60 }, tags: ['article'] })
  const bytes = storage.objects.get('isr-cache/integration-build/article')
  const stored = JSON.parse(String(await uncompress(bytes, { asBuffer: false })))
  expect(stored).toMatchObject({ value: page, tags: ['article', '_N_T_/article'] })
  expect(stored.lifespan.expireAt).toBeGreaterThan(stored.lastModified / 1000)
  expect(await cache.get('/article')).toEqual(stored)
})

it('keeps null entries in memory and invalidates them through the real library', async () => {
  await cache.set('/missing', null, { tags: ['missing'] })
  expect(await cache.get('/missing')).toMatchObject({ value: null, tags: ['missing'] })
  expect(storage.objects.size).toBe(0)
  await cache.revalidateTag(['missing'])
  expect(await cache.get('/missing')).toBeNull()
})

it('expires and deletes stored entries when their lifetime ends', async () => {
  const now = Date.now()
  vi.spyOn(Date, 'now').mockReturnValue(now)
  await cache.set('/expired', { kind: 'PAGES', html: 'expired', pageData: {} }, { cacheControl: { revalidate: 2 } })
  expect(storage.objects.has('isr-cache/integration-build/expired')).toBe(true)
  vi.spyOn(Date, 'now').mockReturnValue(now + 10000)
  expect(await cache.get('/expired')).toBeNull()
  await vi.waitFor(() => expect(storage.objects.has('isr-cache/integration-build/expired')).toBe(false))
})
