import { describe, expect, it } from 'vitest'
import { FORWARDED_HEADER_WHITELIST } from '../../app/composables/useApi'
import { normalizeFlatApiResponse } from '../../app/utils/api-contract'

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

  it('normalizes flat backend messages to the app message field', () => {
    expect(
      normalizeFlatApiResponse({
        code: 200,
        msg: 'ok',
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    ).toEqual({
      code: 200,
      message: 'ok',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
  })
})
