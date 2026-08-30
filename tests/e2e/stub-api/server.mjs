#!/usr/bin/env node
/*
  【文件职责】
    E2E 桩后端：用零依赖 Node http server 实现 nuxt-modern-starter-api 的请求契约
    （统一 { code, message, data } 信封、Bearer 鉴权、项目 / 文档 / 公开内容端点）。
    它同时是「前端假设的后端契约」的可执行文档 —— 契约漂移会让 E2E 直接失败。

  【架构位置】
    tests/e2e — 仅供 Playwright webServer 启动，不参与应用构建，也不进 Docker 镜像。

  【主要导出 / 路由】
    POST /api/login|register|refresh|logout、GET /api/me|/api/me/profile、
    GET|POST /api/projects（列表分页：limit/offset）、GET|PATCH|DELETE /api/projects/:id、
    GET|PATCH /api/documents/:id、GET /api/content/news|/api/content/news/:slug|/api/content/pricing、
    POST /api/__reset（仅测试用，重置内存状态）

  【渲染 / 数据】
    进程内内存状态；每个 spec 通过 POST /api/__reset 拿到确定性初始数据，
    可传 { projects: N } 生成 N 条项目，用于验证「加载更多」的翻页行为。

    GET /api/projects 的分页语义与后端 shared/http/pagination 保持一致：
    limit 默认 20、上限 100，offset 默认 0，hasMore = offset + 本页条数 < total，
    排序 updatedAt DESC。桩与真实后端在这里必须逐字段一致 —— 它就是契约本身。
    公开内容端点必须真实存在：/news 与 /pricing 是 SSR / SWR 页面，
    请求由 Nitro 在服务端发出，浏览器侧的 route 拦截够不到。

  【边界与注意】
    只实现 E2E 用得到的行为，不追求与真实后端逐字段等价；
    鉴权失败一律返回业务 code 401，用于验证前端 refresh / 重定向链路。
*/
import { createServer } from 'node:http'

const PORT = Number(process.env.STUB_API_PORT || 2127)

const ACCESS_TOKEN = 'e2e-access-token'
const REFRESH_TOKEN = 'e2e-refresh-token'
const VALID_USER = { username: 'alice', password: 'correct-horse' }

/** 生成第 n 个种子项目；updatedAt 递减，保证与后端一样按 updatedAt DESC 稳定排序 */
const seedProject = (n) => ({
  id: `project_${n}`,
  workspaceId: 'workspace_1',
  documentId: `document_${n}`,
  title: n === 1 ? 'Quarterly plan' : `Seeded project ${n}`,
  description: null,
  updatedAt: new Date(Date.UTC(2026, 6, 9, 0, 0, 0) - n * 60_000).toISOString(),
  accent: 'violet'
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

const routes = [
  {
    method: 'POST',
    match: (p) => p === '/api/__reset',
    handle: async (req, res) => {
      const body = await readBody(req)
      const count = Number(body?.projects)
      state = seed(Number.isFinite(count) && count >= 0 ? count : 1)
      send(res, 200, envelope(null))
    }
  },
  {
    method: 'POST',
    match: (p) => p === '/api/login',
    handle: async (req, res) => {
      const body = await readBody(req)

      if (body.username !== VALID_USER.username || body.password !== VALID_USER.password) {
        return send(res, 200, envelope(null, 401, 'Invalid username or password'))
      }

      send(res, 200, envelope({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN }))
    }
  },
  {
    method: 'POST',
    match: (p) => p === '/api/register',
    handle: (_req, res) => send(res, 200, envelope(null))
  },
  {
    method: 'POST',
    match: (p) => p === '/api/refresh',
    handle: async (req, res) => {
      const body = await readBody(req)

      if (body.refreshToken !== REFRESH_TOKEN) {
        return send(res, 200, envelope(null, 401, 'Unauthorized'))
      }

      send(res, 200, envelope({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN }))
    }
  },
  {
    method: 'POST',
    match: (p) => p === '/api/logout',
    handle: (_req, res) => send(res, 200, envelope(null))
  },
  {
    method: 'GET',
    match: (p) => p === '/api/me',
    handle: (req, res) =>
      isAuthorized(req)
        ? send(
            res,
            200,
            envelope({
              user: {
                id: 1,
                username: VALID_USER.username,
                nickname: 'Alice',
                avatar: null,
                roles: ['member'],
                permissions: ['project:read', 'project:write']
              }
            })
          )
        : unauthorized(res)
  },
  {
    method: 'GET',
    match: (p) => p === '/api/me/profile',
    handle: (req, res) =>
      isAuthorized(req)
        ? send(res, 200, envelope({ profile: { company: 'Acme', plan: 'growth' } }))
        : unauthorized(res)
  },
  {
    method: 'GET',
    match: (p) => p === '/api/projects',
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
    method: 'POST',
    match: (p) => p === '/api/projects',
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
        updatedAt: new Date().toISOString(),
        accent: 'blue'
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

      send(res, 200, envelope({ project, document }))
    }
  },
  {
    method: 'GET',
    match: (p) => /^\/api\/projects\/[^/]+$/.test(p),
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
    method: 'PATCH',
    match: (p) => /^\/api\/projects\/[^/]+$/.test(p),
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
    method: 'DELETE',
    match: (p) => /^\/api\/projects\/[^/]+$/.test(p),
    handle: (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const id = pathname.split('/').pop()
      state.projects = state.projects.filter((item) => item.id !== id)

      send(res, 200, envelope(null))
    }
  },
  {
    method: 'GET',
    match: (p) => /^\/api\/documents\/[^/]+$/.test(p),
    handle: (req, res, { pathname }) => {
      if (!isAuthorized(req)) return unauthorized(res)

      const document = state.documents[pathname.split('/').pop()]

      return document
        ? send(res, 200, envelope({ document }))
        : send(res, 200, envelope(null, 404, 'Document not found'))
    }
  },
  {
    method: 'PATCH',
    match: (p) => /^\/api\/documents\/[^/]+$/.test(p),
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
    method: 'GET',
    match: (p) => p === '/api/content/news',
    handle: (_req, res) => send(res, 200, envelope({ articles: newsArticles }))
  },
  {
    method: 'GET',
    match: (p) => /^\/api\/content\/news\/[^/]+$/.test(p),
    handle: (_req, res, { pathname }) => {
      const slug = pathname.split('/').pop()
      const article = newsArticles.find((item) => item.slug === slug)

      return article
        ? send(res, 200, envelope({ article: { ...article, body: ['First paragraph.'] } }))
        : send(res, 200, envelope(null, 404, 'Article not found'))
    }
  },
  {
    method: 'GET',
    match: (p) => p === '/api/content/pricing',
    handle: (_req, res) => send(res, 200, envelope({ pricing: pricingPage }))
  }
]

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 204, null)
  }

  const { pathname, searchParams } = new URL(req.url, `http://localhost:${PORT}`)
  const route = routes.find((item) => item.method === req.method && item.match(pathname))

  if (!route) {
    return send(res, 200, envelope(null, 404, `No stub route for ${req.method} ${pathname}`))
  }

  await route.handle(req, res, { pathname, searchParams })
})

server.listen(PORT, () => {
  console.log(`[stub-api] listening on http://127.0.0.1:${PORT}`)
})
