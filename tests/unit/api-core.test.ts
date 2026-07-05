import { describe, expect, it, vi } from 'vitest'
import {
  createApiFailure,
  getApiErrorMessage,
  isUnauthorizedError
} from '../../app/api-core/api-error'
import { createApiClient } from '../../app/api-core/create-api-client'
import { createBearerHeaders, sanitizeHeaders } from '../../app/api-core/api-headers'

describe('api-core', () => {
  it('creates bearer headers and redacts sensitive headers for logs', () => {
    const headers = createBearerHeaders('access-token', {
      cookie: 'sid=secret',
      'x-request-id': 'req_1'
    })

    expect(headers.get('authorization')).toBe('Bearer access-token')
    expect(headers.get('cookie')).toBe('sid=secret')

    expect(sanitizeHeaders(headers)).toEqual({
      authorization: '[redacted]',
      cookie: '[redacted]',
      'x-request-id': 'req_1'
    })
  })

  it('normalizes API errors from common backend shapes', () => {
    expect(getApiErrorMessage({ data: { message: 'normalized' } }, 'fallback')).toBe('normalized')
    expect(getApiErrorMessage({ data: { msg: 'backend' } }, 'fallback')).toBe('backend')
    expect(createApiFailure({ statusCode: 503, message: 'Unavailable' })).toMatchObject({
      statusCode: 503,
      message: 'Unavailable'
    })
    expect(isUnauthorizedError({ response: { status: 401 } })).toBe(true)
  })

  it('creates typed fetch clients with default baseURL and headers', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 200, message: 'ok', data: { id: 'doc_1' } })
    const client = createApiClient({
      baseURL: 'https://api.example.com',
      headers: { 'x-request-id': 'req_1' },
      fetcher
    })

    await expect(client.request('/documents/doc_1')).resolves.toEqual({
      code: 200,
      message: 'ok',
      data: { id: 'doc_1' }
    })
    expect(fetcher).toHaveBeenCalledWith(
      '/documents/doc_1',
      expect.objectContaining({
        baseURL: 'https://api.example.com',
        method: 'GET',
        headers: expect.any(Headers)
      })
    )
    expect(fetcher.mock.calls[0][1].headers.get('x-request-id')).toBe('req_1')
  })

  it('invokes unauthorized handler once before retrying a failed request', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ code: 200, message: 'ok', data: { saved: true } })
    const onUnauthorized = vi.fn().mockResolvedValue({ authorization: 'Bearer next-token' })
    const client = createApiClient({
      baseURL: 'https://api.example.com',
      fetcher,
      onUnauthorized
    })

    await expect(client.request('/documents/doc_1', { method: 'PATCH' })).resolves.toEqual({
      code: 200,
      message: 'ok',
      data: { saved: true }
    })

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1][1].headers.get('authorization')).toBe('Bearer next-token')
  })
})
