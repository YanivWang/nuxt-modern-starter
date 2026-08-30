// @vitest-environment nuxt
/*
  【文件职责】
    单测：editor upload api adapter 路径与绝对 URL 解析。

  【架构位置】
    tests/unit — mock createProductApiClient；upload-api 读 useRuntimeConfig().public.apiBase 拼绝对 URL，
    需 Nuxt 运行时，故首行 `// @vitest-environment nuxt` opt-in。

  【主要导出 / 路由】
    describe editor upload api / resolveUploadUrl

  【依赖关系】
    - 依赖：app/features/editor/upload-api.ts、resolve-upload-url.ts
    - mock：createProductApiClient → { request }

  【边界与注意】
    不覆盖 large-upload 分片并发与 Worker MD5。
*/
import { describe, expect, it, vi, beforeEach } from 'vitest'

const request = vi.fn()

vi.mock('../../app/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../app/api/auth')>()
  return {
    ...actual,
    createProductApiClient: vi.fn(() => ({ request }))
  }
})

const apiOriginFromBase = (apiBase: string) => apiBase.replace(/\/api\/?$/, '')

describe('resolveUploadUrl', () => {
  it('joins API origin with relative /uploads path', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('/uploads/common/a.webp', 'http://localhost:2026/api')).toBe(
      'http://localhost:2026/uploads/common/a.webp'
    )
  })

  it('keeps absolute http(s) URLs unchanged', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('https://cdn.example.com/a.webp', 'http://localhost:2026/api')).toBe(
      'https://cdn.example.com/a.webp'
    )
  })
})

describe('editor upload api', () => {
  beforeEach(() => {
    request.mockReset()
  })

  it('uploads images via POST /uploads FormData', async () => {
    request.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { urls: ['/uploads/common/2026/07/a.webp'] }
    })

    const { uploadImages } = await import('../../app/features/editor/upload-api')
    const file = new File(['x'], 'a.webp', { type: 'image/webp' })
    const result = await uploadImages([file])
    const origin = apiOriginFromBase(useRuntimeConfig().public.apiBase as string)

    expect(request).toHaveBeenCalledWith(
      '/uploads',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    )
    expect(result.urls).toEqual([`${origin}/uploads/common/2026/07/a.webp`])
  })

  it('inits large upload via POST /uploads/large/init', async () => {
    request.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        instant: true,
        publicUrl: '/uploads/large/2026/07/v.mp4',
        chunkTotal: 0,
        expiresAt: '2026-07-09T00:00:00.000Z'
      }
    })

    const { createLargeFileUploadApi } = await import('../../app/features/editor/upload-api')
    const api = createLargeFileUploadApi()
    const result = await api.init({
      fileName: 'v.mp4',
      fileSize: 10,
      chunkSize: 5 * 1024 * 1024,
      mimeType: 'video/mp4',
      fileMd5: 'd41d8cd98f00b204e9800998ecf8427e'
    })
    const origin = apiOriginFromBase(useRuntimeConfig().public.apiBase as string)

    expect(request).toHaveBeenCalledWith(
      '/uploads/large/init',
      expect.objectContaining({ method: 'POST' })
    )
    expect(result).toMatchObject({
      instant: true,
      publicUrl: `${origin}/uploads/large/2026/07/v.mp4`
    })
  })
})
