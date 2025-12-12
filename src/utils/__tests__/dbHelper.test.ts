import { describe, expect, it } from 'vitest'
import { extractAppleDailyResizerPath } from '../dbHelper'

describe('extractAppleDailyResizerPath', () => {
  it('returns /appledaily/... segment for valid resizer URL', () => {
    const url =
      'https://hk.appledaily.com/resizer/dZPh-YDUYjmup5hlTsoBW05s0z0=/750x0/filters:quality(100)/cloudfront-ap-northeast-1.images.arcpublishing.com/appledaily/XDLAGCO2KNWCZJAL4SNBTIB4JY.gif'

    const result = extractAppleDailyResizerPath(url)

    expect(result).toBe('/appledaily/XDLAGCO2KNWCZJAL4SNBTIB4JY.gif')
  })

  it('returns null when host does not match', () => {
    const url = 'https://example.com/resizer/foo/appledaily/bar.gif'

    const result = extractAppleDailyResizerPath(url)

    expect(result).toBeNull()
  })

  it('returns null when path lacks /appledaily/', () => {
    const url = 'https://hk.appledaily.com/resizer/hash/size/filters:quality(100)/cloudfront/foo/bar.gif'

    const result = extractAppleDailyResizerPath(url)

    expect(result).toBeNull()
  })

  it('returns null for malformed URL', () => {
    const url = 'not-a-url'

    const result = extractAppleDailyResizerPath(url)

    expect(result).toBeNull()
  })
})
