#!/usr/bin/env node
/*
  【文件职责】
    E2E 桩后端：用零依赖 Node http server 实现 nuxt-modern-starter-api 的请求契约
    （统一 { code, message, data } 信封、Bearer 鉴权、项目 / 文档 / 公开内容端点）。
    它同时是「前端假设的后端契约」的可执行文档 —— 契约漂移会让 E2E 直接失败。

  【架构位置】
    tests/e2e — 仅供 Playwright webServer 启动，不参与应用构建，也不进 Docker 镜像。

  【主要导出 / 路由】
    createStubApiServer、resetStubState、stubRoutes（供 tests/unit/stub-api-contract.test.ts 用）。
    直接 node 运行时才会监听 STUB_API_PORT，被 import 时不监听。

    路由统一挂在 API_PREFIX（/api/v1）下，路由表里写的是剥掉前缀后的相对路径，
    与前端 adapter 的写法一致：
    POST /login|register|refresh|logout、GET /me|/me/profile、
    GET|POST /projects（列表分页：limit/offset）、GET|PATCH|DELETE /projects/:id、
    GET|PATCH /documents/:id、GET /content/news|/content/news/:slug|/content/pricing、
    POST /__reset（仅测试用，重置内存状态）

  【渲染 / 数据】
    进程内内存状态；每个 spec 通过 POST /api/__reset 拿到确定性初始数据，
    可传 { projects: N } 生成 N 条项目，用于验证「加载更多」的翻页行为。

    GET /api/projects 的分页语义与后端 shared/http/pagination 保持一致：
    limit 默认 20、上限 100，offset 默认 0，hasMore = offset + 本页条数 < total，
    排序 updatedAt DESC。桩与真实后端在这里必须逐字段一致 —— 它就是契约本身。
    公开内容端点必须真实存在：/news 与 /pricing 是 SSR / SWR 页面，
    请求由 Nitro 在服务端发出，浏览器侧的 route 拦截够不到。

  【边界与注意】
    只实现 E2E 用得到的**端点**，但已实现端点的成功响应必须与真实后端逐字段等价 ——
    tests/unit/stub-api-contract.test.ts 会用 contracts/openapi.yaml 逐条校验状态码与响应体。
    桩比真实后端少返回字段时，E2E 会在一份现实中不存在的响应上通过。

    唯一刻意的偏差：鉴权失败返回 HTTP 200 + 业务 code 401（真实后端是 HTTP 401 + ErrorBody），
    用于验证前端 assertApiSuccess 对「HTTP 成功但业务失败」这条分支的处理。
    契约校验因此只覆盖成功响应。
    前缀必须与真实后端一致：后端已下线无版本的 /api 别名，只提供 /api/v1。
    桩这边同样不提供别名 —— 否则前端把 base 写错，E2E 依然会绿。
*/
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.STUB_API_PORT || 2127)

/** 与后端 API_VERSION_PREFIX 一致；无版本别名已下线，这里也不提供 */
const API_PREFIX = '/api/v1'

const ACCESS_TOKEN = 'e2e-access-token'
const REFRESH_TOKEN = 'e2e-refresh-token'
const VALID_USER = { username: 'alice', password: 'correct-horse' }

/**
 * 真实后端的 /login 与 /refresh 一定带这两个有效期字段（秒）。
 * 桩少返回它们，前端就会在一份现实中不存在的响应上被验证。
 */
const tokenPair = () => ({
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
  accessTokenExpiresIn: 900,
  refreshTokenExpiresIn: 2_592_000
})

/** 与后端 UserProfile 契约同形：未填写的列一律归一化成 null，字段本身始终存在 */
const userProfile = {
  id: 1,
  userId: 1,
  nickname: 'Alice',
  avatar: null,
  gender: null,
  birthday: null,
  bio: null,
  address: null,
  company: 'Acme',
  jobTitle: null,
  isMarried: null,
  mom: null,
  father: null,
  university: null,
  createdAt: '2026-07-09T00:00:00.000Z',
  updatedAt: '2026-07-09T00:00:00.000Z'
}

/**
 * 生成第 n 个种子项目；updatedAt 递减，保证与后端一样按 updatedAt DESC 稳定排序。
 * status / slideCount 前端当前不消费，但后端 ProjectDto 里是必填 ——
 * 桩少返回它们就不再是「真实后端的等价物」，契约测试会失败。
 */
const seedProject = (n) => ({
  id: `project_${n}`,
  workspaceId: 'workspace_1',
  documentId: `document_${n}`,
  title: n === 1 ? 'Quarterly plan' : `Seeded project ${n}`,
  description: null,
  status: 'draft',
  slideCount: 0,
  accent: 'violet',
  updatedAt: new Date(Date.UTC(2026, 6, 9, 0, 0, 0) - n * 60_000).toISOString()
})

const seed = (projectCount = 1) => ({
  projects: Array.from({ length: projectCount }, (_, index) => seedProject(index + 1)),
  documents: Object.fromEntries(
    Array.from({ length: projectCount }, (_, index) => {
      const n = index + 1
      return [
        `document_${n}`,
        {
          id: `document_${n}`,
          projectId: `project_${n}`,
          title: n === 1 ? 'Quarterly plan' : `Seeded project ${n}`,
          content: '<p>Existing content</p>',
          updatedAt: seedProject(n).updatedAt
        }
      ]
    })
  ),
  nextId: projectCount + 1
})

let state = seed()

/** 与后端 paginationQuerySchema 同语义：limit 默认 20 / 1~100，offset 默认 0 / 非负 */
const DEFAULT_PAGE_LIMIT = 20
const MAX_PAGE_LIMIT = 100

const parsePagination = (searchParams) => {
  const rawLimit = Number(searchParams.get('limit'))
  const rawOffset = Number(searchParams.get('offset'))
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(rawLimit, MAX_PAGE_LIMIT)
      : DEFAULT_PAGE_LIMIT
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0

  return { limit: Math.trunc(limit), offset: Math.trunc(offset) }
}

const envelope = (data, code = 200, message = 'ok') => ({ code, message, data })

const send = (res, status, payload) => {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    // 前端与桩后端跨端口，CSR 请求需要 CORS
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization,content-type,accept-language',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS'
  })
  res.end(body)
}

// 业务 code 401（而非 HTTP 401）：前端的 refresh 重试链对两者一视同仁，
// 这里用业务 code 顺带验证 assertApiSuccess 的信封校验路径。
const unauthorized = (res) => send(res, 200, envelope(null, 401, 'Unauthorized'))

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })

const isAuthorized = (req) => req.headers.authorization === `Bearer ${ACCESS_TOKEN}`

const newsArticles = [
  {
    slug: 'starter-release',
    title: 'Starter release',
    description: 'The first public build of the starter.',
    publishedAt: '2026-07-01T00:00:00.000Z'
  },
  {
    slug: 'deployment-guide',
    title: 'Deployment guide',
    description: 'Docker, Compose and Nginx samples.',
    publishedAt: '2026-07-02T00:00:00.000Z'
  }
]

const pricingPage = {
  eyebrow: 'Pricing',
  title: 'Simple pricing',
  lead: 'Start free, upgrade when the product needs it.',
  note: 'Prices exclude tax.',
  plans: [
    {
      key: 'starter',
      featured: false,
      ctaPath: '/sign-up',
      name: 'Starter',
      badge: '',
      price: '$0',
      period: '/mo',
      description: 'For evaluating the foundation.',
      cta: 'Get started',
      features: ['Public site', 'SEO', 'i18n']
    },
    {
      key: 'growth',
      featured: true,
      ctaPath: '/sign-up',
      name: 'Growth',
      badge: 'Popular',
      price: '$29',
      period: '/mo',
      description: 'For a shipping product team.',
      cta: 'Start trial',
      features: ['Workspace', 'Editor', 'Autosave']
    },
    {
      key: 'custom',
      featured: false,
      ctaPath: '/help',
      name: 'Custom',
      badge: '',
      price: 'Talk to us',
      period: '',
      description: 'For bespoke deployments.',
      cta: 'Contact',
      features: ['Dedicated support']
    }
  ],
  includes: {
    eyebrow: 'Included',
    title: 'Every plan includes',
    items: ['SSR + prerender + SWR', 'Bearer auth', 'Docker samples']
  }
}

/**
 * 每条路由用 contract 标注它实现的是契约里的哪个端点（去掉 /api/v1 前缀）。
 * tests/unit/stub-api-contract.test.ts 据此反查：新增桩路由却没给它写契约用例时直接失败，
 * 否则桩可以悄悄多出一条谁也没校验过的响应。
 */
const routes = [
  {
    // 桩自己的测试夹具，真实后端没有；contract 为 null 表示不参与契约校验
    contract: null,
    method: 'POST',
    match: (p) => p === '/__reset',
    handle: async (req, res) => {
      const body = await readBody(req)
      const count = Number(body?.projects)
      resetStubState(Number.isFinite(count) && count >= 0 ? count : 1)
      send(res, 200, envelope(null))
    }
  },
  {
    contract: 'POST /login',
    method: 'POST',
    match: (p) => p === '/login',
    handle: async (req, res) => {
      const body = await readBody(req)

      if (body.username !== VALID_USER.username || body.password !== VALID_USER.password) {
        return send(res, 200, envelope(null, 401, 'Invalid username or password'))
      }

      send(res, 200, envelope(tokenPair()))
    }
  },
  {
    contract: 'POST /register',
    method: 'POST',
    match: (p) => p === '/register',
    handle: (_req, res) => send(res, 200, envelope(null))
  },
  {
    contract: 'POST /refresh',
    method: 'POST',
    match: (p) => p === '/refresh',
    handle: async (req, res) => {
      const body = await readBody(req)

      if (body.refreshToken !== REFRESH_TOKEN) {
        return send(res, 200, envelope(null, 401, 'Unauthorized'))
      }

      send(res, 200, envelope(tokenPair()))
    }
  },
  {
    contract: 'POST /logout',
    method: 'POST',
    match: (p) => p === '/logout',
    handle: (_req, res) => send(res, 200, envelope(null))
  },
  {
    contract: 'GET /me',
    method: 'GET',
    match: (p) => p === '/me',
    handle: (req, res) =>
      isAuthorized(req)
        ? send(
            res,
            200,
            // 后端 /me 不返回 roles / permissions，前端由 normalizeAuthUser 兜底成空数组。
            // 桩若发出它们，等于在一份现实中不存在的响应上验证角色链路。
            envelope({
              user: {
                id: 1,
                username: VALID_USER.username,
                nickname: 'Alice',
                avatar: null
              }
            })
          )
        : unauthorized(res)
  },
  {
    contract: 'GET /me/profile',
    method: 'GET',
    match: (p) => p === '/me/profile',
    handle: (req, res) =>
      isAuthorized(req) ? send(res, 200, envelope({ profile: userProfile })) : unauthorized(res)
  },
  {
    contract: 'GET /projects',
    method: 'GET',
    match: (p) => p === '/projects',
    handle: (req, res, { searchParams }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const { limit, offset } = parsePagination(searchParams)
      // 与后端一致按 updatedAt DESC 排序后再切片，否则翻页会出现重复或漏项
      const ordered = [...state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const rows = ordered.slice(offset, offset + limit)

      send(
        res,
        200,
        envelope({
          projects: rows,
          pagination: {
            total: ordered.length,
            limit,
            offset,
            // hasMore 由服务端算，前端不推断（见 app/types/workspace-project.ts）
            hasMore: offset + rows.length < ordered.length
          }
        })
      )
    }
  },
  {
    contract: 'POST /projects',
    method: 'POST',
    match: (p) => p === '/projects',
    handle: async (req, res) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const body = await readBody(req)
      const id = `project_${state.nextId}`
      const documentId = `document_${state.nextId}`
      state.nextId += 1

      const project = {
        id,
        workspaceId: 'workspace_1',
        documentId,
        title: body.title || 'Untitled',
        description: body.description ?? null,
        status: 'draft',
        slideCount: 0,
        accent: 'blue',
        updatedAt: new Date().toISOString()
      }
      const document = {
        id: documentId,
        projectId: id,
        title: project.title,
        content: '<p></p>',
        updatedAt: project.updatedAt
      }

      state.projects = [project, ...state.projects]
      state.documents[documentId] = document

      // 真实后端创建成功回 201（信封里的 code 仍是 200）
      send(res, 201, envelope({ project, document }))
    }
  },
  {
    contract: 'GET /projects/{projectId}',
    method: 'GET',
    match: (p) => /^\/projects\/[^/]+$/.test(p),
    handle: (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const id = pathname.split('/').pop()
      const project = state.projects.find((item) => item.id === id)

      return project
        ? send(res, 200, envelope({ project }))
        : send(res, 200, envelope(null, 404, 'Project not found'))
    }
  },
  {
    contract: 'PATCH /projects/{projectId}',
    method: 'PATCH',
    match: (p) => /^\/projects\/[^/]+$/.test(p),
    handle: async (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const id = pathname.split('/').pop()
      const project = state.projects.find((item) => item.id === id)

      if (!project) return send(res, 200, envelope(null, 404, 'Project not found'))

      const body = await readBody(req)
      Object.assign(project, body, { updatedAt: new Date().toISOString() })

      send(res, 200, envelope({ project }))
    }
  },
  {
    contract: 'DELETE /projects/{projectId}',
    method: 'DELETE',
    match: (p) => /^\/projects\/[^/]+$/.test(p),
    handle: (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const id = pathname.split('/').pop()
      state.projects = state.projects.filter((item) => item.id !== id)

      send(res, 200, envelope(null))
    }
  },
  {
    contract: 'GET /documents/{documentId}',
    method: 'GET',
    match: (p) => /^\/documents\/[^/]+$/.test(p),
    handle: (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const document = state.documents[pathname.split('/').pop()]

      return document
        ? send(res, 200, envelope({ document }))
        : send(res, 200, envelope(null, 404, 'Document not found'))
    }
  },
  {
    contract: 'PATCH /documents/{documentId}',
    method: 'PATCH',
    match: (p) => /^\/documents\/[^/]+$/.test(p),
    handle: async (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const id = pathname.split('/').pop()
      const document = state.documents[id]

      if (!document) return send(res, 200, envelope(null, 404, 'Document not found'))

      const body = await readBody(req)
      Object.assign(document, body, { updatedAt: new Date().toISOString() })

      const project = state.projects.find((item) => item.id === document.projectId)
      if (project && typeof body.title === 'string') {
        project.title = body.title
      }

      send(res, 200, envelope({ document }))
    }
  },
  {
    contract: 'GET /content/news',
    method: 'GET',
    match: (p) => p === '/content/news',
    handle: (_req, res) => send(res, 200, envelope({ articles: newsArticles }))
  },
  {
    contract: 'GET /content/news/{slug}',
    method: 'GET',
    match: (p) => /^\/content\/news\/[^/]+$/.test(p),
    handle: (_req, res, { pathname }) => {
      const slug = pathname.split('/').pop()
      const article = newsArticles.find((item) => item.slug === slug)

      return article
        ? send(res, 200, envelope({ article: { ...article, body: ['First paragraph.'] } }))
        : send(res, 200, envelope(null, 404, 'Article not found'))
    }
  },
  {
    contract: 'GET /content/pricing',
    method: 'GET',
    match: (p) => p === '/content/pricing',
    handle: (_req, res) => send(res, 200, envelope({ pricing: pricingPage }))
  }
]

/** 路由表：供契约测试反查覆盖面。 */
export const stubRoutes = routes

/** 重置进程内内存状态；POST /__reset 与单测共用同一份逻辑。 */
export const resetStubState = (projectCount = 1) => {
  state = seed(projectCount)
}

/**
 * 只建服务器、不监听：契约单测用 listen(0) 拿一个空闲端口，
 * 不去抢开发机上可能已被占用的固定端口。
 */
export const createStubApiServer = () =>
  createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      return send(res, 204, null)
    }

    // 只用于解析 pathname / query，host 部分不参与任何判定
    const { pathname, searchParams } = new URL(req.url, 'http://stub.invalid')

    // 前缀不匹配直接 404：这正是真实后端下线 /api 别名后的行为，
    // 前端一旦把 base 写回旧前缀，E2E 必须立刻红，而不是照常通过。
    if (pathname !== API_PREFIX && !pathname.startsWith(`${API_PREFIX}/`)) {
      return send(res, 200, envelope(null, 404, `No stub route for ${req.method} ${pathname}`))
    }

    const apiPath = pathname.slice(API_PREFIX.length) || '/'
    const route = routes.find((item) => item.method === req.method && item.match(apiPath))

    if (!route) {
      return send(res, 200, envelope(null, 404, `No stub route for ${req.method} ${apiPath}`))
    }

    await route.handle(req, res, { pathname: apiPath, searchParams })
  })

// 只有被 node 直接运行时才监听。被 import 时监听会让单测一加载就占住 2127，
// 而那个端口此刻可能正被另一轮 E2E 用着。
const runAsScript =
  Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (runAsScript) {
  createStubApiServer().listen(PORT, () => {
    console.log(`[stub-api] listening on http://127.0.0.1:${PORT}`)
  })
}
