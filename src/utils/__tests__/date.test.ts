import { describe, expect, it } from 'vitest'
import { getDateParamFromDate, getFullFormatFromTs, getZhFormatFromDateParam } from '../date'

describe('date utils (Asia/Hong_Kong timezone)', () => {
  it('converts Date or ISO string to YYYYMMDD param', () => {
    const result = getDateParamFromDate('2021-12-05T12:00:00Z')
    expect(result).toBe('20211205')
  })

  it('formats date param to Chinese long format', () => {
    const result = getZhFormatFromDateParam('20211205')
    expect(result).toBe('2021年12月5日')
  })

  it('converts timestamp to full display format with timezone applied', () => {
    const result = getFullFormatFromTs('2021-12-05T10:30:00Z')
    expect(result).toBe('2021/12/05 18:30')
  })
})
