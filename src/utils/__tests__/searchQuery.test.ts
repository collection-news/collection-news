import { describe, expect, it } from 'vitest'
import { base64Decode, base64Encode } from '../searchQuery'

describe('searchQuery base64 helpers', () => {
  it('round-trips JSON with CJK characters', () => {
    const payload = { query: '你好', filters: ['科技', '台灣'] }
    const encoded = base64Encode(JSON.stringify(payload))
    const decoded = base64Decode(encoded)

    expect(decoded).toEqual(payload)
  })

  it('produces URI-safe base64 string (no raw + or /)', () => {
    const payload = 'simple text'
    const encoded = base64Encode(payload)

    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
  })
})
