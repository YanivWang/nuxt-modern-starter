import { describe, expect, it } from 'vitest'
import { FORWARDED_HEADER_WHITELIST } from '../../app/composables/useApi'

describe('useApi request policy', () => {
  it('only forwards the approved SSR header whitelist', () => {
    expect(FORWARDED_HEADER_WHITELIST).toEqual([
      'cookie',
      'authorization',
      'x-request-id',
      'accept-language'
    ])
    expect(FORWARDED_HEADER_WHITELIST).not.toContain('host')
    expect(FORWARDED_HEADER_WHITELIST).not.toContain('connection')
  })
})
