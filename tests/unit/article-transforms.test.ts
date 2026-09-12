import zlib from 'node:zlib'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { media } from '../../src/constants/media'
import {
  getArticleDesc,
  getCoverImageUrlFromStory,
  getCategory,
  getCategoryColor,
  getMedia,
  getTitle,
} from '../../src/utils/dataHelper'
import {
  extractAppleDailyResizerPath,
  replaceCDNDomainForArticle,
  replaceUrlDomain2CDN,
  unGZipArticle,
} from '../../src/utils/dbHelper'
import { fixtureImage, story, video } from '../fixtures/articles'

describe('CDN transformations', () => {
  it.each([
    ['https://old.test/photo.jpg?size=20', media.THE_STAND_NEWS, 'https://assets.test/old.test/photo.jpg?size=20'],
    ['https://old.test/photo.jpg', media.APPLE_DAILY, 'https://assets.test/photo.jpg'],
    ['ABC123.jpg', media.APPLE_DAILY, 'https://assets.test/appledaily-ipfs-media/ABC123.jpg'],
    ['not a URL', media.APPLE_DAILY, 'not a URL'],
    ['not a URL', media.THE_STAND_NEWS, 'not a URL'],
    [
      'https://hk.appledaily.com/resizer/hash/750x0/host/appledaily/ABC.gif',
      media.APPLE_DAILY,
      'https://assets.test/appledaily/ABC.gif',
    ],
  ])('rewrites %s for %s', (url, publisher, expected) => {
    expect(replaceUrlDomain2CDN(url, publisher)).toBe(expected)
  })

  it('does not extract non-resizer Apple Daily paths', () => {
    expect(extractAppleDailyResizerPath('https://hk.appledaily.com/news/appledaily/photo.jpg')).toBeNull()
  })

  it('rewrites intro and body images without mutating the source article', () => {
    const original = story({
      introElements: [{ ...fixtureImage, url: 'https://old.test/intro.jpg' }],
      contentElements: [
        { type: 'text', content: 'Body' },
        { ...fixtureImage, url: 'https://old.test/body.jpg' },
      ],
    })
    const snapshot = structuredClone(original)
    const rewritten = replaceCDNDomainForArticle(original)
    expect(original).toEqual(snapshot)
    expect(rewritten.introElements[0]).toMatchObject({ url: 'https://assets.test/intro.jpg' })
    expect(rewritten.type === 'story' && rewritten.contentElements[1]).toMatchObject({
      url: 'https://assets.test/body.jpg',
    })
  })

  it('leaves video articles unchanged', () => {
    const article = video()
    expect(replaceCDNDomainForArticle(article)).toEqual(article)
  })

  it('keeps original URLs when no CDN is configured', async () => {
    vi.resetModules()
    vi.stubEnv('APP_ASSET_CDN_HOST', '')
    const helpers = await import('../../src/utils/dbHelper')
    expect(helpers.replaceUrlDomain2CDN('https://old.test/photo.jpg', media.THE_STAND_NEWS)).toBe(
      'https://old.test/photo.jpg'
    )
    expect(helpers.replaceUrlDomain2CDN('ABC123.jpg', media.APPLE_DAILY)).toBe('ABC123.jpg')
    vi.stubEnv('APP_ASSET_CDN_HOST', 'assets.test')
  })
})

describe('compressed articles', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ASSET_CDN_HOST', 'assets.test')
  })

  it('decompresses UTF-8 JSON and removes the compressed payload', async () => {
    const contentElements = [{ type: 'text', content: '香港新聞 📰' }]
    const article = story({ contentElementsGziped: zlib.gzipSync(JSON.stringify(contentElements)) })
    const result = await unGZipArticle(article)
    expect(result).toEqual({ ...story(), contentElements })
    expect(article.contentElementsGziped).toBeDefined()
  })

  it.each([story(), video()])('preserves an uncompressed $type article', async article => {
    expect(await unGZipArticle(article)).toBe(article)
  })

  it('rejects decompressed content that is not JSON', async () => {
    await expect(unGZipArticle(story({ contentElementsGziped: zlib.gzipSync('not JSON') }))).rejects.toThrow(
      SyntaxError
    )
  })

  it('characterizes the unchecked gzip error callback (LEGACY-06)', () => {
    let callback: (error: Error | null, buffer?: Buffer) => void = () => {
      throw new Error('callback not registered')
    }
    vi.spyOn(zlib, 'gunzip').mockImplementation(((_input: unknown, cb: typeof callback) => {
      callback = cb
    }) as typeof zlib.gunzip)
    void unGZipArticle(story({ contentElementsGziped: Buffer.from('corrupt') }))
    // Capture the callback so the known uncaught exception cannot escape the test process.
    expect(() => callback(new Error('invalid gzip'))).toThrow(TypeError)
  })

  it('characterizes compressed body images being unpacked after CDN rewriting (LEGACY-07)', async () => {
    const contentElements = [{ ...fixtureImage, url: 'https://old.test/body.jpg' }]
    const article = story({ contentElementsGziped: zlib.gzipSync(JSON.stringify(contentElements)) })
    const result = await unGZipArticle(replaceCDNDomainForArticle(article))
    expect(result.type === 'story' && result.contentElements[0]).toMatchObject({ url: 'https://old.test/body.jpg' })
  })
})

describe('article presentation data', () => {
  it('prefers an intro image over the first body image', () => {
    const intro = { ...fixtureImage, url: '/intro.svg' }
    expect(getCoverImageUrlFromStory(story({ introElements: [intro], contentElements: [fixtureImage] }))).toBe(intro)
  })

  it('falls back to the body image and returns no cover for video', () => {
    expect(getCoverImageUrlFromStory(story({ introElements: [], contentElements: [fixtureImage] }))).toBe(fixtureImage)
    expect(getCoverImageUrlFromStory(video())).toBeNull()
  })

  it('strips description markup and handles absent text and video', () => {
    expect(getArticleDesc(story({ contentElements: [{ type: 'html', content: '<p>Hello <b>香港</b></p>' }] }))).toBe(
      'Hello 香港'
    )
    expect(getArticleDesc(story({ contentElements: [fixtureImage] }))).toBe('')
    expect(getArticleDesc(video())).toBe('')
  })

  it('resolves publisher/category metadata without inventing missing values', () => {
    expect(getMedia(media.THE_STAND_NEWS)?.brandName).toBe('立場新聞')
    expect(getMedia()).toBeUndefined()
    const categories = getMedia(media.APPLE_DAILY)!.categoryList
    expect(getCategory(categories, 'local')?.chiName).toBe('本地')
    expect(getCategory(categories, 'missing')).toBeUndefined()
  })

  it('builds publisher-specific titles and stable category colors', () => {
    expect(getTitle('Title', media.APPLE_DAILY)).toBe('Title | 蘋果日報•聞庫')
    expect(getTitle('Title')).toBe('Title | 聞庫')
    expect(getCategoryColor('local')).toBe(getCategoryColor('local'))
  })
})
