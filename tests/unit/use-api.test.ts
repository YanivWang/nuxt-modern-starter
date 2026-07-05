import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '../../app/api-core/api-error'
import {
  createScenarioApiKey,
  createPublicApiHeaders,
  createAuthenticatedApiHeaders
} from '../../app/composables/useApi'

describe('useApi request policy', () => {
  it('extracts user-facing messages from the standard API error shape', () => {
    expect(getApiErrorMessage({ data: { message: 'normalized' } }, 'fallback')).toBe('normalized')
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
