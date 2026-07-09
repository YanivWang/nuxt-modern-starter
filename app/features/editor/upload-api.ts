/*
  【文件职责】
    编辑器媒体上传 Product API adapter：普通图片与大文件分片上传。

  【架构位置】
    登录产品区 — app/features/editor，被 useEditorMediaUpload / useLargeFileUpload 消费。

  【主要导出 / 路由】
    uploadImages、createLargeFileUploadApi

  【依赖关系】
    - 依赖：createProductApiClient、resolveUploadUrl、large-upload types
    - 被引用：upload composables、tests/unit/editor-upload-api.test.ts

  【渲染 / 数据】
    相对路径 /uploads、/uploads/large/*（base 已含 /api）；返回绝对媒体 URL。

  【边界与注意】
    FormData 请求勿手动设 Content-Type，由浏览器带 multipart boundary。
*/
import type { ApiResponse } from '~/lib/http/types'
import { createProductApiClient } from '~/api/auth'
import { resolveUploadUrl } from './upload/resolve-upload-url'
import type {
  LargeUploadInitResponse,
  LargeUploadMergeResponse,
  LargeUploadStatusResponse
} from './upload/types'

export type UploadImagesResult = {
  urls: string[]
}

const getApiBase = () => useRuntimeConfig().public.apiBase as string

const toAbsoluteUrls = (urls: string[]) => {
  const apiBase = getApiBase()
  return urls.map((url) => resolveUploadUrl(url, apiBase))
}

const toAbsoluteUrl = (url: string) => resolveUploadUrl(url, getApiBase())

/** POST /uploads，表单字段 files；单文件最大 8MB，jpeg/png/gif/webp */
export const uploadImages = async (files: File[]): Promise<UploadImagesResult> => {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const response = await createProductApiClient().request<ApiResponse<{ urls: string[] }>>(
    '/uploads',
    {
      method: 'POST',
      body: formData
    }
  )

  return { urls: toAbsoluteUrls(response.data.urls) }
}

type LargeUploadInitBody = {
  fileName: string
  fileSize: number
  chunkSize: number
  mimeType?: string
  fileMd5: string
}

/** 大文件分片上传 API（与 API /uploads/large/* 对齐）；路径相对 apiBase（已含 /api） */
export const createLargeFileUploadApi = () => {
  // 每次请求新建 client，与其它 Product adapter 一致，避免长传过程中 token 过期仍用旧凭证
  const request = <T>(
    path: string,
    options: Parameters<ReturnType<typeof createProductApiClient>['request']>[1]
  ) => createProductApiClient().request<T>(path, options)

  return {
    init(body: LargeUploadInitBody): Promise<LargeUploadInitResponse> {
      return request<ApiResponse<LargeUploadInitResponse>>('/uploads/large/init', {
        method: 'POST',
        body,
        timeout: 60_000
      }).then((res) => {
        if (res.data.instant) {
          return {
            ...res.data,
            publicUrl: toAbsoluteUrl(res.data.publicUrl)
          }
        }
        return res.data
      })
    },

    getStatus(uploadId: string): Promise<LargeUploadStatusResponse> {
      return request<ApiResponse<LargeUploadStatusResponse>>(`/uploads/large/${uploadId}/status`, {
        method: 'GET',
        timeout: 30_000
      }).then((res) => {
        const data = res.data
        if (data.publicUrl) {
          return { ...data, publicUrl: toAbsoluteUrl(data.publicUrl) }
        }
        return data
      })
    },

    merge(uploadId: string): Promise<LargeUploadMergeResponse> {
      return request<ApiResponse<LargeUploadMergeResponse>>(`/uploads/large/${uploadId}/merge`, {
        method: 'POST',
        body: {},
        timeout: 300_000
      }).then((res) => ({
        ...res.data,
        url: toAbsoluteUrl(res.data.url)
      }))
    },

    abort(uploadId: string): Promise<void> {
      return request<ApiResponse<null>>(`/uploads/large/${uploadId}`, {
        method: 'DELETE',
        timeout: 30_000
      }).then(() => undefined)
    },

    /** PUT 分片：multipart 字段名 chunk，Header X-Chunk-Md5 */
    async putChunk(
      uploadId: string,
      chunkIndex: number,
      blob: Blob,
      chunkMd5: string,
      config?: { signal?: AbortSignal }
    ): Promise<void> {
      const form = new FormData()
      form.append('chunk', blob)
      await request<ApiResponse<Record<string, unknown>>>(
        `/uploads/large/${uploadId}/chunks/${chunkIndex}`,
        {
          method: 'PUT',
          body: form,
          headers: {
            'X-Chunk-Md5': chunkMd5
          },
          timeout: 180_000,
          signal: config?.signal
        }
      )
    }
  }
}

export type LargeFileUploadApi = ReturnType<typeof createLargeFileUploadApi>
