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

    期望的媒体 origin 必须与被测实现**各自独立**推导出来：
    这里用 new URL(apiBase).origin，实现那边用「剥掉 /api[/vN] 前缀」。
    此前测试里放了一份和实现一模一样的剥前缀正则，于是 base 从 /api 迁到 /api/v1 时
    两边一起错、测试照样绿，媒体 URL 却全都多带了一段 /api/v1（404）。
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

/** 静态资源挂在 API 应用根上，所以期望值就是 base 的 origin —— 与实现的推导路径无关 */
const expectedUploadOrigin = () => new URL(useRuntimeConfig().public.apiBase as string).origin

describe('resolveUploadUrl', () => {
  it('strips the versioned API prefix, not just /api', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('/uploads/common/a.webp', 'http://localhost:2027/api/v1')).toBe(
      'http://localhost:2027/uploads/common/a.webp'
    )
    // 前缀抬版本号（/api/v2）后不需要再改这里
    expect(resolveUploadUrl('/uploads/common/a.webp', 'http://localhost:2027/api/v2/')).toBe(
      'http://localhost:2027/uploads/common/a.webp'
    )
    // 下线前的无版本别名
    expect(resolveUploadUrl('/uploads/common/a.webp', 'http://localhost:2027/api')).toBe(
      'http://localhost:2027/uploads/common/a.webp'
    )
  })

  it('keeps the parent path when the API is mounted under a sub-path', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('/uploads/a.webp', 'https://example.com/backend/api/v1')).toBe(
      'https://example.com/backend/uploads/a.webp'
    )
  })

  it('falls back to the origin instead of gluing an unrecognised API path onto media URLs', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('/uploads/a.webp', 'https://gateway.example.com/v1')).toBe(
      'https://gateway.example.com/uploads/a.webp'
    )
  })

  it('keeps absolute http(s) URLs unchanged', async () => {
    const { resolveUploadUrl } = await import('../../app/features/editor/upload/resolve-upload-url')

    expect(resolveUploadUrl('https://cdn.example.com/a.webp', 'http://localhost:2027/api/v1')).toBe(
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
    const origin = expectedUploadOrigin()

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
    const origin = expectedUploadOrigin()

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
