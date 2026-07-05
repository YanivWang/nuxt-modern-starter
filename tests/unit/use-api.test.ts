import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, normalizeFlatApiResponse } from '../../app/utils/api-contract'
import {
  createScenarioApiKey,
  createPublicApiHeaders,
  createAuthenticatedApiHeaders
} from '../../app/composables/useApi'

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

  it('keeps public request headers free from authorization by default', () => {
    const headers = createPublicApiHeaders({ 'accept-language': 'zh-CN' })

    expect(headers.get('authorization')).toBeNull()
    expect(headers.get('accept-language')).toBe('zh-CN')
  })

  it('creates authenticated headers for editor and business requests', () => {
    const headers = createAuthenticatedApiHeaders('access-token', { 'x-request-id': 'req_1' })

    expect(headers.get('authorization')).toBe('Bearer access-token')
    expect(headers.get('x-request-id')).toBe('req_1')
  })

  it('scopes request keys by scenario to avoid public and editor cache collisions', () => {
    expect(createScenarioApiKey('public', 'GET', '/documents')).toBe('api:public:GET:/documents:')
    expect(createScenarioApiKey('editor', 'GET', '/documents')).toBe('api:editor:GET:/documents:')
    expect(createScenarioApiKey('editor', 'PATCH', '/documents/1', { title: 'Draft' })).toBe(
      'api:editor:PATCH:/documents/1:{"title":"Draft"}'
    )
  })
})
