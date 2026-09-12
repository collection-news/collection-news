import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GetStaticPropsContext } from 'next'
import { story } from '../fixtures/articles'

vi.mock('../../src/services/dynamo', () => ({
  getArticle: vi.fn(),
  getArticlesByDateAndCat: vi.fn(),
  getLatestGoogleIndexCount: vi.fn(),
}))
import { getArticle, getArticlesByDateAndCat, getLatestGoogleIndexCount } from '../../src/services/dynamo'
import {
  getStaticPaths as articlePaths,
  getStaticProps as articleProps,
} from '../../src/pages/[media]/articles/[articleId]'
import { getStaticPaths as archivePaths, getStaticProps as archiveProps } from '../../src/pages/[media]/[[...path]]'
import {
  getStaticPaths as historyPaths,
  getStaticProps as historyProps,
} from '../../src/pages/[media]/history/[year]/[[...path]]'
import { getStaticProps as googleProps } from '../../src/pages/google'

const context = (params: GetStaticPropsContext['params']): GetStaticPropsContext => ({ params })
const empty = { articles: [], hasMore: false, nextCursor: null }

beforeEach(() => {
  vi.mocked(getArticle).mockReset().mockResolvedValue(story())
  vi.mocked(getArticlesByDateAndCat).mockReset().mockResolvedValue(empty)
  vi.mocked(getLatestGoogleIndexCount).mockReset().mockResolvedValue(1234)
})

describe('article static generation', () => {
  it('renders a found article indefinitely and forwards the exact key', async () => {
    expect(await articleProps(context({ media: 'appledaily', articleId: 'fixture-story' }))).toEqual({
      props: { article: story() },
      revalidate: false,
    })
    expect(getArticle).toHaveBeenCalledWith({ media: 'appledaily', articleId: 'fixture-story' })
  })

  it('returns 404 for an absent article', async () => {
    vi.mocked(getArticle).mockResolvedValue(undefined)
    expect(await articleProps(context({ media: 'appledaily', articleId: 'missing' }))).toEqual({ notFound: true })
  })

  it('uses blocking fallback without pre-rendered article paths', async () => {
    expect(await articlePaths()).toEqual({ paths: [], fallback: 'blocking' })
  })
})

describe('archive static generation', () => {
  it.each([
    ['appledaily', '20210623'],
    ['thestandnews', '20211229'],
  ])('defaults %s to its last archive date', async (publisher, date) => {
    const result = await archiveProps(context({ media: publisher }))
    expect(getArticlesByDateAndCat).toHaveBeenCalledWith({ media: publisher, publishDate: date, getVideo: true })
    expect(result).toMatchObject({
      props: {
        initData: empty,
        currentCategory: null,
        queryParams: { media: publisher },
        currentMedia: { range: expect.arrayContaining([date]) },
      },
      revalidate: false,
    })
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  it('forwards a date and category and supplies the matching category metadata', async () => {
    const result = await archiveProps(context({ media: 'appledaily', path: ['20190612', 'local'] }))
    expect(getArticlesByDateAndCat).toHaveBeenCalledWith({
      media: 'appledaily',
      publishDate: '20190612',
      category: 'local',
      getVideo: true,
    })
    expect(result).toMatchObject({ props: { currentCategory: { engName: 'local', chiName: '本地' } } })
  })

  it.each([{ media: 'invalid' }, { media: 'appledaily', path: ['no-date'] }])(
    'returns 404 before fetching for %j',
    async params => {
      expect(await archiveProps(context(params))).toEqual({ notFound: true, revalidate: false })
      expect(getArticlesByDateAndCat).not.toHaveBeenCalled()
    }
  )

  it('characterizes numeric pre-rendered media paths from array keys (LEGACY-05)', async () => {
    expect(await archivePaths()).toEqual({
      paths: [{ params: { media: '0', path: ['20210623'] } }, { params: { media: '1', path: ['20211229'] } }],
      fallback: 'blocking',
    })
  })
})

describe('history and Google static generation', () => {
  it('uses Hong Kong today in the chosen year and revalidates hourly', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-23T17:00:00Z'))
    const result = await historyProps(context({ media: 'appledaily', year: '2019', path: ['local'] }))
    expect(getArticlesByDateAndCat).toHaveBeenCalledWith({
      media: 'appledaily',
      year: '2019',
      publishDate: '20190624',
      category: 'local',
    })
    expect(result).toMatchObject({ revalidate: 3600, props: { currentCategory: { engName: 'local' } } })
  })

  it.each([
    { media: 'invalid', year: '2019' },
    { media: 'appledaily', year: 'yesterday' },
  ])('returns 404 for invalid history parameters %j', async params => {
    expect(await historyProps(context(params))).toEqual({ notFound: true, revalidate: false })
    expect(getArticlesByDateAndCat).not.toHaveBeenCalled()
  })

  it('uses blocking fallback for history pages', async () => {
    expect(await historyPaths()).toEqual({ paths: [], fallback: 'blocking' })
  })

  it('renders the Google count and revalidates every two hours', async () => {
    expect(await googleProps(context({}))).toEqual({ props: { indexedCount: 1234 }, revalidate: 7200 })
  })
})
