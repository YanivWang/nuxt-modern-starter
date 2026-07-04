import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, normalizeFlatApiResponse } from '../../app/utils/api-contract'

describe('useApi request policy', () => {
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

  it('prefers explicit message while still supporting backend msg', () => {
    expect(
      normalizeFlatApiResponse({
        code: 400,
        message: 'normalized',
        msg: 'backend'
      })
    ).toEqual({
      code: 400,
      message: 'normalized'
    })
    expect(normalizeFlatApiResponse({ code: 400, msg: 'backend' })).toEqual({
      code: 400,
      message: 'backend'
    })
  })

  it('extracts user-facing messages from normalized API errors', () => {
    expect(getApiErrorMessage({ data: { message: 'normalized' } }, 'fallback')).toBe('normalized')
    expect(getApiErrorMessage({ data: { msg: 'backend' } }, 'fallback')).toBe('backend')
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback')
  })
})
