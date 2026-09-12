import { describe, expect, it, vi } from 'vitest'
import { articleListQueryParamsSchema, historyPagePathParamsSchema } from '../../src/types/schema'
import {
  getDateFromDateParam,
  getDateParamFromDate,
  getDayPartFromDate,
  getFormatForJsonLd,
  getISOFormatFromTs,
  getTodayOfTheHistory,
  maxYearForToday,
} from '../../src/utils/date'
import { base64Decode, base64Encode } from '../../src/utils/searchQuery'

describe('Hong Kong dates', () => {
  it.each([
    ['2021-06-23T15:59:59Z', '20210623'],
    ['2021-06-23T16:00:00Z', '20210624'],
    ['2020-02-28T16:00:00Z', '20200229'],
    ['2021-12-31T16:00:00Z', '20220101'],
  ])('formats boundary %s as %s', (instant, expected) => {
    expect(getDateParamFromDate(new Date(instant))).toBe(expected)
  })

  it('formats display, ISO, and JSON-LD dates consistently', () => {
    expect(getDayPartFromDate('2021-06-23T17:00:00Z')).toBe('2021/06/24')
    expect(getFormatForJsonLd('2021-06-23T17:00:00Z')).toBe('2021-06-24')
    expect(getISOFormatFromTs('2021-06-24T01:00:00+08:00')).toBe('2021-06-23T17:00:00.000Z')
    expect(getDateParamFromDate(getDateFromDateParam('20210623'))).toBe('20210623')
  })

  it('uses Hong Kong today for historical dates and clamps a leap day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-28T17:00:00Z'))
    expect(getTodayOfTheHistory('2020')).toBe('20200229')
    expect(getTodayOfTheHistory('2019')).toBe('20190228')
  })

  it('selects the previous archive year after the final archive day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-22T02:00:00Z'))
    expect(maxYearForToday('20210623')).toBe(2021)
    vi.setSystemTime(new Date('2026-06-24T02:00:00Z'))
    expect(maxYearForToday('20210623')).toBe(2020)
  })
})

describe('route validation characterization', () => {
  it.each(['appledaily', 'thestandnews'])('accepts a supported publisher %s', async media => {
    expect(await articleListQueryParamsSchema.isValid({ media, publishDate: '20210623' })).toBe(true)
  })

  it.each([
    { publishDate: '20210623' },
    { media: 'invalid', publishDate: '20210623' },
    { media: 'appledaily', publishDate: 'today' },
  ])('rejects %j', async params => {
    expect(await articleListQueryParamsSchema.isValid(params)).toBe(false)
  })

  it('records permissive legacy date/year patterns without tightening production validation (LEGACY-02)', async () => {
    expect(await articleListQueryParamsSchema.isValid({ media: 'appledaily', publishDate: 'x20219999x' })).toBe(true)
    expect(await articleListQueryParamsSchema.isValid({ media: 'appledaily' })).toBe(true)
    expect(await historyPagePathParamsSchema.isValid({ media: 'appledaily', year: 'x2019x' })).toBe(true)
    expect(await historyPagePathParamsSchema.isValid({ media: 'appledaily', year: '1999' })).toBe(false)
  })
})

describe('search query transport', () => {
  it.each(['香港 📰', 'ÿÿÿ', 'a/b+c=d & ?#%', ''])(
    'round-trips difficult characters %s through URLSearchParams',
    query => {
      const encoded = base64Encode(JSON.stringify({ query }))
      expect(base64Decode(new URL(`http://localhost/?q=${encoded}`).searchParams.get('q')!)).toEqual({ query })
      expect(encoded).not.toMatch(/[+/=]/)
    }
  )

  it('normalizes legacy plus-as-space transport', () => {
    const payload = { query: '>>>???' }
    const raw = Buffer.from(JSON.stringify(payload)).toString('base64')
    expect(raw).toContain('+')
    expect(base64Decode(raw.replaceAll('+', ' '))).toEqual(payload)
  })

  it.each(['%', 'not-json', Buffer.from('plain text').toString('base64')])('rejects malformed query %s', query => {
    expect(() => base64Decode(query)).toThrow()
  })
})
