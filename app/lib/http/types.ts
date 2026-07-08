/*
  【文件职责】
    HTTP 层类型定义：统一 API 信封 ApiResponse<T>、请求选项与 client 工厂选项。
    所有 adapter 返回值均期望 { code, message, data } 形状。

  【架构位置】
    共享层 — app/lib/http，被 client.ts、error.ts、app/api/* 引用。

  【主要导出 / 路由】
    ApiResponse、ApiRequestOptions、ApiClientOptions

  【依赖关系】
    - 依赖：ofetch（FetchOptions 类型）
    - 被引用：app/lib/http/client.ts、error.ts、app/api/*、server/utils/seo.ts

  【渲染 / 数据】
    无 — 纯类型；code === 200 表示业务成功，由 assertApiSuccess 校验。

  【边界与注意】
    onUnauthorized 回调返回新 Headers 时 client 仅重试一次。
*/
import type { FetchOptions } from 'ofetch'

/** 后端统一响应信封；code === 200 表示业务成功，由 assertApiSuccess 校验 */
export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

/** 单次请求选项；baseURL / headers 由 createApiClient 工厂层管理 */
export type ApiRequestOptions = Omit<FetchOptions<'json'>, 'baseURL' | 'headers'> & {
  headers?: HeadersInit
}

export type ApiClientOptions = {
  baseURL: string
  headers?: HeadersInit
  fetcher?: typeof $fetch
  /** 401 时由调用方 refresh token；返回新 Headers 后 client 仅重试原请求一次 */
  onUnauthorized?: () => Promise<HeadersInit | null | undefined>
}
