/*
  【文件职责】
    单测：前端消费的后端契约。校验 API base 前缀、adapter 端点、响应字段形状与
    E2E 桩后端，都与 contracts/openapi.yaml（后端 OpenAPI 的引入副本）一致。

  【架构位置】
    tests/unit — 读引入的 spec 与仓库内文件，纯静态断言，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe backend API contract

  【依赖关系】
    - 依赖：contracts/openapi.yaml、config/auth.ts、.env.*、nuxt.config.ts、
      tests/e2e/stub-api/server.mjs、app/features/editor/upload/resolve-upload-url.ts
    - 类型依赖：app/types/*、app/api/*、app/features/editor/upload/types（仅 import type，不进运行时）
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    CONSUMED_ENDPOINTS 是手工维护的「前端依赖面」清单，不是从源码自动抽取的：
    adapter 里的路径字面量与前端路由字面量（如 getWorkspaceDocPath 的 /docs/:id）
    在文本上无法可靠区分，自动抽取只会带来假阳性。新增 adapter 时需要在这里登记，
    换来的是端点被后端改名或删除时立刻失败。

    字段级断言靠 `Record<keyof T, FieldSpec>` 把 spec 和真实领域类型钉在一起：
    领域类型增删字段而这里没跟上是**编译错误**，这里与 spec 不一致是**测试失败**。
    因此不需要 openapi-typescript 之类的生成器 —— 生成物本身又是一份要维护同步的产物，
    而这条链路已经两头都焊死了。

    这组断言的直接由来：
    - 后端把业务路径从无版本的 /api 迁到 /api/v1 并下线了别名，而前端的
      NUXT_PUBLIC_API_BASE 仍指向旧前缀 —— 那次漂移没有任何测试能发现。
    - 后端把项目列表从 { projects } 改成 { projects, pagination }，当时契约里
      data 是空的 {}（等价于「任意值」），同样没有任何一侧能报警。
*/
import { describe, expect, it } from 'vitest'
import { SITE_CONTENT_LOCALE_MAP, SUPPORTED_LOCALES } from '../../config/site'
import {
  AUTH_API_ENDPOINTS,
  REGISTER_PASSWORD_MIN_LENGTH,
  REGISTER_USERNAME_MAX_LENGTH,
  REGISTER_USERNAME_MIN_LENGTH
} from '../../config/auth'
import {
  API_PREFIX,
  deref,
  errorStatusesOf,
  isSecured,
  jsonTypesOf,
  navigate,
  nonNullBranch,
  queryParamEnum,
  readRepoFile,
  requestBodySchema,
  specEndpoints,
  successDataSchema,
  type JsonType,
  type SchemaNode
} from './support/openapi-contract'
// 除 resolveUploadUrl 外全部是 import type：编译后被擦除，不会在 happy-dom 环境里拉起
// Nuxt 自动导入。resolveUploadUrl 所在模块不依赖任何 Nuxt 运行时，可以直接跑。
import type { BackendUser, TokenData } from '../../app/api/auth'
import type {
  LocalizedNewsArticle,
  LocalizedNewsArticleSummary,
  PricingPageContent,
  PricingPlan
} from '../../app/api/public'
import type { EditorDocument } from '../../app/types/document'
import type {
  UserProfile,
  UserProfileGender,
  WritableUserProfileFields
} from '../../app/types/user-profile'
import type {
  WorkspaceProject,
  WorkspaceProjectAccent,
  WorkspaceProjectPagination
} from '../../app/types/workspace-project'
import { resolveUploadUrl } from '../../app/features/editor/upload/resolve-upload-url'
import type { UploadImagesResult } from '../../app/features/editor/upload-api'
import type {
  LargeUploadInitResponse,
  LargeUploadMergeResponse,
  LargeUploadStatusResponse
} from '../../app/features/editor/upload/types'

/** 前端实际调用的端点；新增 adapter 时在此登记 */
const CONSUMED_ENDPOINTS = [
  'POST /register',
  'POST /login',
  'POST /refresh',
  'POST /logout',
  'GET /me',
  'GET /me/profile',
  'PATCH /me/profile',
  'GET /projects',
  'POST /projects',
  'GET /projects/{projectId}',
  'PATCH /projects/{projectId}',
  'DELETE /projects/{projectId}',
  'GET /documents/{documentId}',
  'PATCH /documents/{documentId}',
  'POST /uploads',
  'POST /uploads/large/init',
  'GET /uploads/large/{uploadId}/status',
  'PUT /uploads/large/{uploadId}/chunks/{chunkIndex}',
  'POST /uploads/large/{uploadId}/merge',
  'DELETE /uploads/large/{uploadId}',
  'GET /content/news',
  'GET /content/news/{slug}',
  'GET /content/pricing'
] as const

const ENV_FILES = ['.env.dev', '.env.test', '.env.prod', '.env.e2e'] as const

const readApiBase = (envFile: string) =>
  readRepoFile(envFile)
    .split('\n')
    .find((line) => line.startsWith('NUXT_PUBLIC_API_BASE='))
    ?.slice('NUXT_PUBLIC_API_BASE='.length)
    .trim()

/* ------------------------------------------------------------------ *
 * 字段级断言
 * ------------------------------------------------------------------ */

/**
 * 期望 spec 侧的 JSON 类型；数组用于可空字段这类联合。
 * 取值受限的字段再带上 enum：只比 `type: string` 挡不住「后端新增一个枚举取值」，
 * 而那会让前端按旧联合拼出的 CSS 类名落空，静默渲染成无样式元素。
 */
type EnumSpec = { type: JsonType; enum: readonly string[] }

type FieldSpec = JsonType | readonly JsonType[] | EnumSpec

const isEnumSpec = (field: FieldSpec): field is EnumSpec =>
  typeof field === 'object' && !Array.isArray(field) && 'enum' in field

const asTypes = (field: FieldSpec): JsonType[] =>
  isEnumSpec(field)
    ? [field.type]
    : (Array.isArray(field) ? [...field] : [field as JsonType]).sort()

/**
 * 断言字面量数组恰好覆盖联合 T 的全部成员。
 * TS 运行时枚举不出联合成员，只能手写一份再两头钉死：
 * 多写一个成员违反 `V extends readonly T[]`，漏写一个则参数类型塌成 never，两种都编译不过。
 */
const exhaustive =
  <T extends string>() =>
  <const V extends readonly T[]>(values: [T] extends [V[number]] ? V : never) =>
    values

type ShapeOptions = {
  /**
   * 前端类型里有、但契约里本就没有的字段（前端自己补的默认值等）。
   * 登记在这里而不是删掉断言：后端哪天真的开始返回同名字段，这条会立刻变红，
   * 提醒有人去确认前端的默认值是不是该让位给服务端数据。
   */
  frontendOnly?: readonly string[]
  /**
   * 契约里必填、但前端明确不消费的字段。
   * 后端新增必填字段时，它不在这份清单里 —— 于是测试失败，逼一次人工复核。
   * 这正是 { projects } → { projects, pagination } 那次漏掉的环节。
   */
  ignoredRequired?: readonly string[]
}

const expectShape = (
  node: SchemaNode,
  declared: Record<string, FieldSpec>,
  label: string,
  options: ShapeOptions = {}
) => {
  const frontendOnly = options.frontendOnly ?? []
  const properties = node.properties ?? {}
  const consumed = Object.keys(declared).filter((key) => !frontendOnly.includes(key))

  const missing = consumed.filter((key) => !(key in properties))
  expect(missing, `${label}：前端消费的字段在契约里不存在（被改名或删除？）`).toEqual([])

  const mismatched = consumed
    .filter((key) => key in properties)
    .map((key) => ({ key, spec: jsonTypesOf(properties[key]!), want: asTypes(declared[key]!) }))
    .filter((entry) => entry.spec.join('|') !== entry.want.join('|'))
  expect(mismatched, `${label}：字段类型与契约不一致`).toEqual([])

  const enumDrift = consumed
    .filter((key) => key in properties && isEnumSpec(declared[key]!))
    .map((key) => ({
      key,
      spec: [...(deref(properties[key]!).enum ?? [])].sort(),
      want: [...(declared[key] as EnumSpec).enum].sort()
    }))
    .filter((entry) => entry.spec.join('|') !== entry.want.join('|'))
  expect(enumDrift, `${label}：枚举取值集合与契约不一致`).toEqual([])

  const unexpected = frontendOnly.filter((key) => key in properties)
  expect(unexpected, `${label}：契约现在提供了这些字段，前端的本地默认值可以让位了`).toEqual([])

  const declaredKeys = new Set(consumed)
  const requiredButUndeclared = (node.required ?? []).filter((key) => !declaredKeys.has(key)).sort()
  expect(
    requiredButUndeclared,
    `${label}：契约里必填但前端未声明的字段发生变化，请确认是否需要消费后再更新 ignoredRequired`
  ).toEqual([...(options.ignoredRequired ?? [])].sort())
}

/* ------------------------------------------------------------------ *
 * 领域类型 → 契约字段的映射
 *
 * 键被 Record<keyof T, ...> 钉在真实领域类型上：领域类型增删字段而这里没跟上是编译错误。
 * 值写的是 **契约侧** 的 JSON 类型，未必等于前端类型（例如 BackendUser.id 前端放宽成
 * string | number，契约里是 integer）。
 * ------------------------------------------------------------------ */

const TOKEN_FIELDS: Record<keyof TokenData, FieldSpec> = {
  accessToken: 'string',
  refreshToken: 'string',
  accessTokenExpiresIn: 'integer',
  refreshTokenExpiresIn: 'integer'
}

const BACKEND_USER_FIELDS: Record<keyof BackendUser, FieldSpec> = {
  id: 'integer',
  username: 'string',
  avatar: ['string', 'null'],
  nickname: ['string', 'null'],
  // 后端有账号角色但刻意不下发（下发会诱导前端拿它当授权），
  // 由 normalizeAuthUser 兜底成空数组。frontendOnly 因此是长期状态：
  // 契约里哪天真出现了 roles，这条会变红，提醒先确认它是不是能力标识而非授权依据。
  roles: 'array',
  permissions: 'array'
}

/** 与后端 ProjectAccent 同源；取值超出集合会让卡片拼不出主题色类名。 */
const PROJECT_ACCENTS = exhaustive<WorkspaceProjectAccent>()([
  'blue',
  'green',
  'violet',
  'amber',
  'cyan',
  'rose'
])

const PRICING_PLAN_KEYS = exhaustive<PricingPlan['key']>()(['starter', 'growth', 'custom'])

const USER_PROFILE_GENDERS = exhaustive<UserProfileGender>()(['male', 'female', 'unknown'])

/** CTA 只允许指向站内既有页面；后端加一个新路径时前端要先有那个路由 */
const PRICING_CTA_PATHS = exhaustive<PricingPlan['ctaPath']>()(['/sign-up', '/help'])

const WORKSPACE_PROJECT_FIELDS: Record<keyof WorkspaceProject, FieldSpec> = {
  id: 'string',
  workspaceId: 'string',
  documentId: ['string', 'null'],
  title: 'string',
  description: ['string', 'null'],
  updatedAt: 'string',
  accent: { type: 'string', enum: PROJECT_ACCENTS }
}

/** 后端 ProjectDto 必填、但前端卡片不渲染的字段。要用时先加进 WorkspaceProject。 */
const PROJECT_FIELDS_NOT_CONSUMED = ['slideCount', 'status'] as const

const PAGINATION_FIELDS: Record<keyof WorkspaceProjectPagination, FieldSpec> = {
  total: 'integer',
  limit: 'integer',
  offset: 'integer',
  hasMore: 'boolean'
}

/**
 * 扩展资料的可空列一律 anyOf [T, null]：服务端把未填写的列归一化成 null 后下发，
 * 字段本身始终存在。前端曾把它整体类型成 Record<string, unknown>，
 * 于是这一整张表在契约上完全不设防。
 */
const USER_PROFILE_FIELDS: Record<keyof UserProfile, FieldSpec> = {
  id: 'integer',
  userId: 'integer',
  nickname: ['string', 'null'],
  avatar: ['string', 'null'],
  gender: ['string', 'null'],
  birthday: ['string', 'null'],
  bio: ['string', 'null'],
  address: ['string', 'null'],
  company: ['string', 'null'],
  jobTitle: ['string', 'null'],
  isMarried: ['boolean', 'null'],
  mom: ['string', 'null'],
  father: ['string', 'null'],
  university: ['string', 'null'],
  createdAt: 'string',
  updatedAt: 'string'
}

/**
 * PATCH /me/profile 的可写字段。后端 body schema 是 strict 的（additionalProperties: false），
 * 多一个键返回 400 而不是被忽略 —— 所以这里必须与契约精确对齐，不能靠「反正后端会忽略」。
 */
const UPDATE_PROFILE_FIELDS: Record<keyof WritableUserProfileFields, FieldSpec> = {
  nickname: ['string', 'null'],
  avatar: ['string', 'null'],
  gender: ['string', 'null'],
  birthday: ['string', 'null'],
  bio: ['string', 'null'],
  address: ['string', 'null'],
  company: ['string', 'null'],
  jobTitle: ['string', 'null'],
  isMarried: ['boolean', 'null'],
  mom: ['string', 'null'],
  father: ['string', 'null'],
  university: ['string', 'null']
}

const EDITOR_DOCUMENT_FIELDS: Record<keyof EditorDocument, FieldSpec> = {
  id: 'string',
  projectId: 'string',
  title: 'string',
  content: 'string',
  updatedAt: 'string'
}

const NEWS_SUMMARY_FIELDS: Record<keyof LocalizedNewsArticleSummary, FieldSpec> = {
  slug: 'string',
  title: 'string',
  description: 'string',
  publishedAt: 'string'
}

const NEWS_ARTICLE_FIELDS: Record<keyof LocalizedNewsArticle, FieldSpec> = {
  ...NEWS_SUMMARY_FIELDS,
  body: 'array'
}

const PRICING_PAGE_FIELDS: Record<keyof PricingPageContent, FieldSpec> = {
  eyebrow: 'string',
  title: 'string',
  lead: 'string',
  note: 'string',
  plans: 'array',
  includes: 'object'
}

const PRICING_PLAN_FIELDS: Record<keyof PricingPlan, FieldSpec> = {
  key: { type: 'string', enum: PRICING_PLAN_KEYS },
  featured: 'boolean',
  ctaPath: { type: 'string', enum: PRICING_CTA_PATHS },
  name: 'string',
  badge: 'string',
  price: 'string',
  period: 'string',
  description: 'string',
  cta: 'string',
  features: 'array'
}

const UPLOAD_IMAGES_FIELDS: Record<keyof UploadImagesResult, FieldSpec> = {
  urls: 'array'
}

const LARGE_UPLOAD_STATUS_FIELDS: Record<keyof LargeUploadStatusResponse, FieldSpec> = {
  status: 'string',
  chunkTotal: 'integer',
  receivedIndices: 'array',
  publicUrl: 'string',
  fileName: 'string',
  fileSize: 'integer',
  chunkSize: 'integer'
}

const LARGE_UPLOAD_MERGE_FIELDS: Record<keyof LargeUploadMergeResponse, FieldSpec> = {
  url: 'string',
  merged: 'boolean'
}

type InstantInit = Extract<LargeUploadInitResponse, { instant: true }>
type ChunkedInit = Extract<LargeUploadInitResponse, { instant: false }>

const INIT_INSTANT_FIELDS: Record<keyof InstantInit, FieldSpec> = {
  instant: 'boolean',
  publicUrl: 'string',
  chunkTotal: 'number',
  expiresAt: 'string'
}

const INIT_CHUNKED_FIELDS: Record<keyof ChunkedInit, FieldSpec> = {
  instant: 'boolean',
  uploadId: 'string',
  chunkTotal: 'integer',
  expiresAt: 'string'
}

/**
 * 每个消费端点的 data 顶层必填字段。
 *
 * 这是全表最重要的一条：后端往 data 里加一个必填字段（当年的 pagination 就是），
 * 前端不改一行代码也能编译通过、请求也不会报错，只是静默丢数据。
 * 写成精确相等而不是子集，增删两个方向都会红。
 * null 表示该端点的 data 恒为 null。
 */
const RESPONSE_DATA_KEYS: Record<string, readonly string[] | null> = {
  'POST /register': null,
  'POST /login': ['accessToken', 'accessTokenExpiresIn', 'refreshToken', 'refreshTokenExpiresIn'],
  'POST /refresh': ['accessToken', 'accessTokenExpiresIn', 'refreshToken', 'refreshTokenExpiresIn'],
  'POST /logout': null,
  'GET /me': ['user'],
  'GET /me/profile': ['profile'],
  'PATCH /me/profile': ['profile'],
  'GET /projects': ['pagination', 'projects'],
  'POST /projects': ['document', 'project'],
  'GET /projects/{projectId}': ['project'],
  'PATCH /projects/{projectId}': ['project'],
  'DELETE /projects/{projectId}': null,
  'GET /documents/{documentId}': ['document'],
  'PATCH /documents/{documentId}': ['document'],
  'POST /uploads': ['urls'],
  'GET /uploads/large/{uploadId}/status': ['chunkTotal', 'receivedIndices', 'status'],
  'PUT /uploads/large/{uploadId}/chunks/{chunkIndex}': ['chunkIndex'],
  'POST /uploads/large/{uploadId}/merge': ['merged', 'url'],
  // 取消任务返回空对象而不是 null
  'DELETE /uploads/large/{uploadId}': [],
  'GET /content/news': ['articles', 'pagination'],
  'GET /content/news/{slug}': ['article'],
  'GET /content/pricing': ['pricing']
}

/** init 的 data 是 instant 判别联合，没有顶层 required，单独断言两条分支。 */
const UNION_DATA_ENDPOINTS = ['POST /uploads/large/init'] as const

/**
 * 每个消费端点声明的非 2xx 状态码，精确相等。
 *
 * 前端对这些码有真实分支：401 触发单飞 refresh 并重试一次，404 走空态，
 * 409 在注册页提示用户名已占用，410 意味着分片上传任务过期、必须重新发起。
 * 后端新增或去掉一个状态码而前端不知道，表现就是「线上偶发一个没人处理的错误」。
 *
 * 注意 DELETE /uploads/large/{uploadId} 没有 404：取消是幂等的，
 * 任务不存在时同样返回成功——这条容易被想当然地补上，写在这里正是为了钉住它。
 */
const CONSUMED_ERROR_STATUSES: Record<string, readonly string[]> = {
  'POST /register': ['400', '409', '429', '500'],
  'POST /login': ['400', '401', '429', '500'],
  'POST /refresh': ['400', '401', '403', '429', '500'],
  'POST /logout': ['400', '401', '429', '500'],
  'GET /me': ['400', '401', '429', '500'],
  'GET /me/profile': ['400', '401', '429', '500'],
  'PATCH /me/profile': ['400', '401', '429', '500'],
  'GET /projects': ['400', '401', '429', '500'],
  'POST /projects': ['400', '401', '429', '500'],
  'GET /projects/{projectId}': ['400', '401', '404', '429', '500'],
  'PATCH /projects/{projectId}': ['400', '401', '404', '429', '500'],
  'DELETE /projects/{projectId}': ['400', '401', '404', '429', '500'],
  'GET /documents/{documentId}': ['400', '401', '404', '429', '500'],
  'PATCH /documents/{documentId}': ['400', '401', '404', '429', '500'],
  'POST /uploads': ['400', '401', '429', '500'],
  'POST /uploads/large/init': ['400', '401', '429', '500'],
  'GET /uploads/large/{uploadId}/status': ['400', '401', '403', '404', '410', '429', '500'],
  'PUT /uploads/large/{uploadId}/chunks/{chunkIndex}': [
    '400',
    '401',
    '403',
    '404',
    '409',
    '410',
    '429',
    '500'
  ],
  'POST /uploads/large/{uploadId}/merge': ['400', '401', '403', '404', '409', '410', '429', '500'],
  'DELETE /uploads/large/{uploadId}': ['400', '401', '403', '429', '500'],
  'GET /content/news': ['400', '429', '500'],
  'GET /content/news/{slug}': ['400', '404', '429', '500'],
  'GET /content/pricing': ['400', '429', '500']
}

describe('backend API contract', () => {
  it('derives a single versioned prefix from the spec', () => {
    expect(API_PREFIX).toBe('/api/v1')
  })

  it('points every environment layer at the versioned prefix', () => {
    for (const envFile of ENV_FILES) {
      const apiBase = readApiBase(envFile)

      expect(apiBase, `${envFile} 缺少 NUXT_PUBLIC_API_BASE`).toBeTruthy()
      // 后端已下线无版本别名：base 少了 /v1 的话，所有业务请求都会 404
      expect(apiBase!.endsWith(API_PREFIX), `${envFile} 的 API base 未指向 ${API_PREFIX}`).toBe(
        true
      )
    }
  })

  it('points the runtimeConfig fallback at the versioned prefix too', () => {
    // 只校验 .env.* 是不够的：没有 dotenv 的运行方式（裸 node .output/server/index.mjs、
    // vitest 的 nuxt 环境）拿到的是 nuxt.config.ts 里的兜底字面量。
    // /api/v1 迁移当初漏了这一处，于是 nuxt 环境下的单测一直跑在已下线的旧前缀上，
    // 反过来把 resolveUploadUrl 的前缀 bug 盖住了。
    const fallback = readRepoFile('nuxt.config.ts').match(
      /NUXT_PUBLIC_API_BASE \|\| '([^']+)'/
    )?.[1]

    expect(fallback, 'nuxt.config.ts 里找不到 apiBase 兜底值').toBeTruthy()
    expect(
      fallback!.endsWith(API_PREFIX),
      `nuxt.config.ts 的 apiBase 兜底值未指向 ${API_PREFIX}`
    ).toBe(true)
  })

  it('never sends register fields the contract does not declare', () => {
    // 曾把 localStorage 的 utm_* / gclid 浅合并进注册 body：那些键不在契约的请求体里，
    // 后端 Zod 非 strict 会静默丢弃 —— 一条从头到尾没人消费的暗管。
    // 契约机制存在的意义就是不让「接口说一套做一套」，请求侧同样适用。
    const declared = new Set(Object.keys(requestBodySchema('POST /register')?.properties ?? {}))
    const source = readRepoFile('app/api/auth.ts')
    const registerCall = source.slice(source.indexOf('export const registerApi'))

    expect(declared, '契约里 /register 没有描述请求体').not.toEqual(new Set())
    // 只查 import：注释里提到该模块是可以的（那里解释了为什么不再发），
    // 真正要挡的是把它的值重新接回请求体。
    expect(source, 'auth adapter 不应再依赖归因模块').not.toMatch(/^import .*attribution-params/m)
    expect(registerCall).not.toContain('mergeAttributionIntoBody')
  })

  it('validates registration input by the same lengths the backend enforces', () => {
    // 客户端校验比服务端松等于没有：表单放行、请求发出、再被 400 打回来。
    // 这些数字曾经只写在 sign-up.vue 的表单规则里（密码写的 6，后端要求 8）。
    const body = requestBodySchema('POST /register')
    const username = body?.properties?.username
    const password = body?.properties?.password

    expect(username, '契约里 /register 没有描述 username').toBeDefined()
    expect(password, '契约里 /register 没有描述 password').toBeDefined()

    expect({
      usernameMin: (username as { minLength?: number }).minLength,
      usernameMax: (username as { maxLength?: number }).maxLength,
      passwordMin: (password as { minLength?: number }).minLength
    }).toEqual({
      usernameMin: REGISTER_USERNAME_MIN_LENGTH,
      usernameMax: REGISTER_USERNAME_MAX_LENGTH,
      passwordMin: REGISTER_PASSWORD_MIN_LENGTH
    })
  })

  it('only asks the backend for content languages it actually serves', () => {
    // 站点 15 个语言，后端内容只有 2 个。不做映射时后端会把其余 13 个全落到 zh-CN，
    // 页面外壳是本地语言而正文是中文，而站点还在 hreflang 里声明它们是法语版、韩语版。
    const supported = queryParamEnum('GET /content/news', 'locale')

    expect(supported, '契约里 /content/news 没有描述 locale 枚举').not.toBeNull()

    const requested = [...new Set(Object.values(SITE_CONTENT_LOCALE_MAP))].sort()
    const unsupported = requested.filter((locale) => !supported!.includes(locale))

    expect(unsupported, '前端会向后端请求它并不提供的内容语言（会被 400）').toEqual([])
  })

  it('maps every supported site locale to a content language', () => {
    // Record<SupportedLocale, ...> 已经保证不漏键，这里再确认没有空值混进去
    const missing = SUPPORTED_LOCALES.filter((locale) => !SITE_CONTENT_LOCALE_MAP[locale])

    expect(missing, '这些站点语言没有指定内容语言回退目标').toEqual([])
  })

  it('derives media URLs from the base with the API prefix stripped', () => {
    // 静态上传目录挂在 API 应用根上，业务接口才在版本前缀下。
    // 这条把「前缀怎么剥」和 spec 里的前缀钉在一起：抬版本号时任何一处没跟上都会红。
    const apiBase = `https://media.example.com${API_PREFIX}`

    expect(resolveUploadUrl('/uploads/a.webp', apiBase)).toBe(
      'https://media.example.com/uploads/a.webp'
    )
  })

  it('resolves every consumed endpoint in the spec', () => {
    const missing = CONSUMED_ENDPOINTS.filter((endpoint) => !specEndpoints.has(endpoint))

    expect(missing, '这些端点在后端契约里不存在（被改名、删除，或前端写错了路径）').toEqual([])
  })

  it('keeps the auth endpoint map inside the consumed contract', () => {
    // AUTH_API_ENDPOINTS 是声明式的路径表，必须每一项都在契约内
    const consumedPaths = new Set(CONSUMED_ENDPOINTS.map((endpoint) => endpoint.split(' ')[1]))

    for (const path of Object.values(AUTH_API_ENDPOINTS)) {
      expect(consumedPaths.has(path), `AUTH_API_ENDPOINTS.${path} 未登记在消费清单中`).toBe(true)
    }
  })

  it('keeps the E2E stub on the same prefix as the real backend', () => {
    const stub = readRepoFile('tests/e2e/stub-api/server.mjs')

    // 桩若还提供旧前缀，前端把 base 写错时 E2E 依然会绿
    expect(stub).toContain(`const API_PREFIX = '${API_PREFIX}'`)
  })

  it('covers every stub route with the consumed contract', () => {
    const stub = readRepoFile('tests/e2e/stub-api/server.mjs')
    const stubPaths = [...stub.matchAll(/p === '(\/[^']*)'/g)]
      .map((match) => match[1]!)
      // __reset 是桩自己的测试夹具，真实后端没有
      .filter((path) => path !== '/__reset')

    const consumedPaths = new Set(CONSUMED_ENDPOINTS.map((endpoint) => endpoint.split(' ')[1]))
    const unexpected = stubPaths.filter((path) => !consumedPaths.has(path))

    expect(unexpected, '桩后端实现了前端并不消费的端点，两者应保持同一份依赖面').toEqual([])
  })

  it('describes a real payload shape for every consumed endpoint', () => {
    // 这是下面所有字段级断言的前提。契约里 data 若是空 schema（等价于「任意值」），
    // 后面那些断言就会全部空转 —— 那才是最坏的情况：看起来有保护，其实没有。
    const undescribed = CONSUMED_ENDPOINTS.filter(
      (endpoint) => Object.keys(successDataSchema(endpoint)).length === 0
    )

    expect(undescribed, '这些端点的响应 data 没有描述形状，字段级契约无从谈起').toEqual([])
  })

  it('declares the expected data shape for every consumed endpoint', () => {
    const undeclared = CONSUMED_ENDPOINTS.filter(
      (endpoint) =>
        !(endpoint in RESPONSE_DATA_KEYS) &&
        !(UNION_DATA_ENDPOINTS as readonly string[]).includes(endpoint)
    )

    expect(undeclared, '新增消费端点后要在 RESPONSE_DATA_KEYS 里登记它的 data 形状').toEqual([])
  })

  it('pins the top-level data keys of every consumed response', () => {
    for (const [endpoint, expected] of Object.entries(RESPONSE_DATA_KEYS)) {
      const data = successDataSchema(endpoint)

      if (expected === null) {
        expect(jsonTypesOf(data), `${endpoint} 的 data 应恒为 null`).toEqual(['null'])
        continue
      }

      // 精确相等：后端往 data 里加必填字段时也要红，否则前端会静默丢数据
      expect([...(data.required ?? [])].sort(), `${endpoint} 的 data 顶层字段发生变化`).toEqual(
        [...expected].sort()
      )
    }
  })

  it('declares the error statuses of every consumed endpoint', () => {
    const undeclared = CONSUMED_ENDPOINTS.filter(
      (endpoint) => !(endpoint in CONSUMED_ERROR_STATUSES)
    )

    expect(undeclared, '新增消费端点后要在 CONSUMED_ERROR_STATUSES 里登记它会返回的错误码').toEqual(
      []
    )

    for (const [endpoint, expected] of Object.entries(CONSUMED_ERROR_STATUSES)) {
      expect(errorStatusesOf(endpoint), `${endpoint} 的错误状态码发生变化`).toEqual(
        [...expected].sort()
      )
    }
  })

  it('backs the 401 refresh-and-retry path with the contract', () => {
    // createApiClient 在 401 时会单飞 refresh 并重试一次。
    // 若某个需要鉴权的端点没声明 401，那条重试路径在契约上就是无依据的。
    const missing401 = CONSUMED_ENDPOINTS.filter(
      (endpoint) => isSecured(endpoint) && !errorStatusesOf(endpoint).includes('401')
    )

    expect(missing401, '这些端点需要鉴权却没声明 401，401 重试链失去契约依据').toEqual([])
  })

  it('matches the workspace project and pagination domain types', () => {
    const listData = successDataSchema('GET /projects')

    expectShape(
      navigate(listData, 'projects', '[]'),
      WORKSPACE_PROJECT_FIELDS,
      'WorkspaceProject（列表项）',
      { ignoredRequired: PROJECT_FIELDS_NOT_CONSUMED }
    )
    expectShape(navigate(listData, 'pagination'), PAGINATION_FIELDS, 'WorkspaceProjectPagination')

    for (const endpoint of [
      'GET /projects/{projectId}',
      'PATCH /projects/{projectId}',
      'POST /projects'
    ]) {
      expectShape(
        navigate(successDataSchema(endpoint), 'project'),
        WORKSPACE_PROJECT_FIELDS,
        `WorkspaceProject（${endpoint}）`,
        { ignoredRequired: PROJECT_FIELDS_NOT_CONSUMED }
      )
    }
  })

  it('matches the user profile domain type on both read and write', () => {
    // GET 在用户从未填写过资料时返回 null，因此 data.profile 是 anyOf [UserProfile, null]
    expectShape(
      nonNullBranch(navigate(successDataSchema('GET /me/profile'), 'profile')),
      USER_PROFILE_FIELDS,
      'UserProfile（GET /me/profile）'
    )
    expect(
      jsonTypesOf(navigate(successDataSchema('GET /me/profile'), 'profile')),
      'GET /me/profile 的 profile 必须允许 null，否则前端的空态分支就是死代码'
    ).toEqual(['null', 'object'])

    // PATCH 之后必定非空
    expectShape(
      navigate(successDataSchema('PATCH /me/profile'), 'profile'),
      USER_PROFILE_FIELDS,
      'UserProfile（PATCH /me/profile）'
    )
    expect(
      jsonTypesOf(navigate(successDataSchema('PATCH /me/profile'), 'profile')),
      'PATCH /me/profile 的 profile 不该是可空的'
    ).toEqual(['object'])
  })

  it('matches the writable profile fields on the request side', () => {
    const body = requestBodySchema('PATCH /me/profile')

    expect(body, 'PATCH /me/profile 应当有 JSON 请求体').not.toBeNull()
    expectShape(body!, UPDATE_PROFILE_FIELDS, 'UpdateProfilePayload')

    // 后端 body 是 strict 的：前端类型比契约宽一个键，用户就会拿到 400 而不是被忽略
    expect(
      body!.additionalProperties,
      'PATCH /me/profile 的 body 不再拒绝未知字段，UpdateProfilePayload 可以放宽了'
    ).toBe(false)

    const gender = nonNullBranch(navigate(body!, 'gender'))
    expect([...(gender.enum ?? [])].sort(), 'gender 取值集合与 UserProfileGender 不一致').toEqual(
      [...USER_PROFILE_GENDERS].sort()
    )
  })

  it('matches the editor document domain type', () => {
    // 新建 flow 从 POST /projects 的响应里直接取 document，三处形状必须一致
    for (const [endpoint, field] of [
      ['GET /documents/{documentId}', 'document'],
      ['PATCH /documents/{documentId}', 'document'],
      ['POST /projects', 'document']
    ] as const) {
      expectShape(
        navigate(successDataSchema(endpoint), field),
        EDITOR_DOCUMENT_FIELDS,
        `EditorDocument（${endpoint}）`
      )
    }
  })

  it('matches the auth token and current-user types', () => {
    for (const endpoint of ['POST /login', 'POST /refresh']) {
      expectShape(successDataSchema(endpoint), TOKEN_FIELDS, `TokenData（${endpoint}）`)
    }

    expectShape(
      navigate(successDataSchema('GET /me'), 'user'),
      BACKEND_USER_FIELDS,
      'BackendUser',
      {
        frontendOnly: ['roles', 'permissions']
      }
    )
  })

  it('matches the public content types', () => {
    expectShape(
      navigate(successDataSchema('GET /content/news'), 'articles', '[]'),
      NEWS_SUMMARY_FIELDS,
      'LocalizedNewsArticleSummary'
    )
    expectShape(
      navigate(successDataSchema('GET /content/news/{slug}'), 'article'),
      NEWS_ARTICLE_FIELDS,
      'LocalizedNewsArticle'
    )

    const pricing = navigate(successDataSchema('GET /content/pricing'), 'pricing')

    expectShape(pricing, PRICING_PAGE_FIELDS, 'PricingPageContent')
    expectShape(navigate(pricing, 'plans', '[]'), PRICING_PLAN_FIELDS, 'PricingPlan')
  })

  it('matches the upload types on both init branches', () => {
    expectShape(successDataSchema('POST /uploads'), UPLOAD_IMAGES_FIELDS, 'UploadImagesResult')
    expectShape(
      successDataSchema('GET /uploads/large/{uploadId}/status'),
      LARGE_UPLOAD_STATUS_FIELDS,
      'LargeUploadStatusResponse'
    )
    expectShape(
      successDataSchema('POST /uploads/large/{uploadId}/merge'),
      LARGE_UPLOAD_MERGE_FIELDS,
      'LargeUploadMergeResponse'
    )

    // 秒传命中与否是两条形状不同的分支：instant=true 没有 uploadId，
    // 客户端拿 publicUrl 收尾；判别字段错位会让前端对着不存在的 uploadId 发分片。
    const branches = successDataSchema('POST /uploads/large/init').oneOf ?? []

    expect(branches, 'init 的 data 应当是 instant 判别联合').toHaveLength(2)

    const [instant, chunked] = branches.map(deref).sort((left, right) =>
      // const: true 的分支排前面，与 LargeUploadInitResponse 的声明顺序对齐
      left.properties?.instant?.const === true
        ? -1
        : right.properties?.instant?.const === true
          ? 1
          : 0
    )

    expectShape(instant!, INIT_INSTANT_FIELDS, 'LargeUploadInitResponse（秒传分支）')
    expectShape(chunked!, INIT_CHUNKED_FIELDS, 'LargeUploadInitResponse（分片分支）')
  })
})
