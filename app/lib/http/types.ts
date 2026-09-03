/*
  【文件职责】
    HTTP 层类型定义：统一 API 信封 ApiResponse<T>、请求选项与 client 工厂选项。
    所有 adapter 返回值均期望 { code, message, data } 形状。

  【架构位置】
    共享层 — app/lib/http，被 client.ts、error.ts、app/api/* 引用。

  【主要导出 / 路由】
    ApiResponse、ApiPagination、ApiRequestOptions、ApiClientOptions

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

/**
 * 列表接口的分页元信息，与后端 shared/http/pagination.ts 的 paginationSchema 一一对应。
 *
 * 只此一份：后端把 limit/offset 语义收在一个共享 schema 里，前端各模块各抄一份的话，
 * 「hasMore 谁来算」这类约定迟早会有某处理解得不一样。
 *
 * hasMore 由服务端按「offset + 本页实际条数 < total」算好下发，前端不要自己推断 ——
 * 客户端拿不到「本页条数与 limit 不等」之外的信息，自己推会在最后一页多发一次请求。
 */
export type ApiPagination = {
  total: number
  limit: number
  offset: number
  hasMore: boolean
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
