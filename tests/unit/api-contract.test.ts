/*
  【文件职责】
    单测：前端消费的后端契约。校验 API base 前缀、adapter 端点与 E2E 桩后端
    三者都与 contracts/openapi.yaml（后端 OpenAPI 的引入副本）一致。

  【架构位置】
    tests/unit — 读引入的 spec 与仓库内文件，纯静态断言，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe backend API contract

  【依赖关系】
    - 依赖：contracts/openapi.yaml、config/auth.ts、.env.*、tests/e2e/stub-api/server.mjs
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    CONSUMED_ENDPOINTS 是手工维护的「前端依赖面」清单，不是从源码自动抽取的：
    adapter 里的路径字面量与前端路由字面量（如 getWorkspaceDocPath 的 /docs/:id）
    在文本上无法可靠区分，自动抽取只会带来假阳性。新增 adapter 时需要在这里登记，
    换来的是端点被后端改名或删除时立刻失败。

    这组断言的直接由来：后端把业务路径从无版本的 /api 迁到 /api/v1 并下线了别名，
    而前端的 NUXT_PUBLIC_API_BASE 仍指向旧前缀 —— 那次漂移没有任何测试能发现。
*/
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as parseYaml } from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { AUTH_API_ENDPOINTS } from '../../config/auth'

const projectRoot = resolve(__dirname, '../..')
const read = (rel: string) => readFileSync(resolve(projectRoot, rel), 'utf8')

type OpenApiSpec = {
  paths: Record<string, Record<string, unknown>>
}

const spec = parseYaml(read('contracts/openapi.yaml')) as OpenApiSpec

/** 业务路径的版本前缀。/health、/ready 不带前缀，不参与推导。 */
const API_PREFIX = (() => {
  const versioned = Object.keys(spec.paths).filter((path) => path.startsWith('/api/'))
  const prefixes = new Set(versioned.map((path) => path.split('/').slice(0, 3).join('/')))

  expect([...prefixes], 'spec 里出现了多个业务前缀；无版本别名应当已经下线').toHaveLength(1)

  return [...prefixes][0]!
})()

/** 去掉版本前缀后的端点集合，与 adapter 的相对路径写法对齐 */
const specEndpoints = new Set(
  Object.entries(spec.paths).flatMap(([path, operations]) =>
    path.startsWith(`${API_PREFIX}/`)
      ? Object.keys(operations).map(
          (method) => `${method.toUpperCase()} ${path.slice(API_PREFIX.length)}`
        )
      : []
  )
)

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
  read(envFile)
    .split('\n')
    .find((line) => line.startsWith('NUXT_PUBLIC_API_BASE='))
    ?.slice('NUXT_PUBLIC_API_BASE='.length)
    .trim()

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
    const stub = read('tests/e2e/stub-api/server.mjs')

    // 桩若还提供旧前缀，前端把 base 写错时 E2E 依然会绿
    expect(stub).toContain(`const API_PREFIX = '${API_PREFIX}'`)
  })

  it('covers every stub route with the consumed contract', () => {
    const stub = read('tests/e2e/stub-api/server.mjs')
    const stubPaths = [...stub.matchAll(/p === '(\/[^']*)'/g)]
      .map((match) => match[1]!)
      // __reset 是桩自己的测试夹具，真实后端没有
      .filter((path) => path !== '/__reset')

    const consumedPaths = new Set(CONSUMED_ENDPOINTS.map((endpoint) => endpoint.split(' ')[1]))
    const unexpected = stubPaths.filter((path) => !consumedPaths.has(path))

    expect(unexpected, '桩后端实现了前端并不消费的端点，两者应保持同一份依赖面').toEqual([])
  })
})
