import { describe, expect, it, vi } from 'vitest'
import { createAuthApiClient } from '../../app/apis/auth/client'
import { createPublicApiClient } from '../../app/apis/public/client'

describe('scenario API clients', () => {
  it('creates an SSR-safe public client without authorization headers', async () => {
    const expectedBaseURL = useRuntimeConfig().public.apiBase
    const fetcher = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: []
    })
    const client = createPublicApiClient({
      locale: 'zh-CN',
      headers: {
        'x-request-id': 'req_public'
      },
      fetcher
    })

    await client.request('/content/news')

    const headers = fetcher.mock.calls[0][1].headers as Headers
    expect(fetcher).toHaveBeenCalledWith(
      '/content/news',
      expect.objectContaining({
        baseURL: expectedBaseURL,
        method: 'GET',
        headers: expect.any(Headers)
      })
    )
    expect(headers.get('authorization')).toBeNull()
    expect(headers.get('accept-language')).toBe('zh-CN')
    expect(headers.get('x-request-id')).toBe('req_public')
  })

  it('creates an authenticated client that refreshes and retries once on 401', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: {
          id: 'doc_1'
        }
      })
    const refreshAccessToken = vi.fn().mockResolvedValue('next-access-token')
    const client = createAuthApiClient({
      accessToken: 'expired-access-token',
      fetcher,
      refreshAccessToken
    })

    await client.request('/documents/doc_1')

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect((fetcher.mock.calls[0][1].headers as Headers).get('authorization')).toBe(
      'Bearer expired-access-token'
    )
    expect((fetcher.mock.calls[1][1].headers as Headers).get('authorization')).toBe(
      'Bearer next-access-token'
    )
  })
})
