/*
  【文件职责】
    单测：E2E 桩后端的成功响应是否与 contracts/openapi.yaml 逐字段一致。
    用 ajv 按 OpenAPI 3.1（JSON Schema 2020-12）校验状态码与响应体。

  【架构位置】
    tests/unit — 用 0 端口起一个桩实例，不依赖 Playwright，也不占用 E2E 的固定端口。

  【主要导出 / 路由】
    describe E2E stub API contract

  【依赖关系】
    - 依赖：tests/e2e/stub-api/server.mjs（createStubApiServer / resetStubState / stubRoutes）、
      tests/unit/support/openapi-contract.ts、ajv
    - mock：无（真的把桩跑起来发请求）

  【渲染 / 数据】
    每个用例前 resetStubState(1)，因此 project_1 / document_1 恒定存在。

  【边界与注意】
    E2E 跑的是桩，不是真实后端。桩少返回一个后端必填字段，整轮 E2E 就是在一份
    现实中不存在的响应上通过 —— 之前 /login 就没有 accessTokenExpiresIn、
    /me 反而多返回了后端根本没有的 roles/permissions，而没有任何测试会因此变红。

    只校验成功响应。桩对鉴权失败刻意返回 HTTP 200 + 业务 code 401（真实后端是 HTTP 401），
    那是为了驱动前端 assertApiSuccess 的分支，属于有意偏差，不在契约覆盖范围内。

    覆盖面由桩自己的 routes 表反查：新增桩路由却没在 CASES 里登记会直接失败。
*/
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Ajv2020 from 'ajv/dist/2020'
import type { ValidateFunction } from 'ajv'
import { createStubApiServer, resetStubState, stubRoutes } from '../e2e/stub-api/server.mjs'
import { API_PREFIX, spec, successResponse } from './support/openapi-contract'

const ACCESS_TOKEN = 'e2e-access-token'
const REFRESH_TOKEN = 'e2e-refresh-token'

type StubCase = {
  /** 契约端点，用来从 spec 取期望状态码与响应 schema */
  contract: string
  /** 实际请求路径（相对 API_PREFIX），把 {id} 换成桩里真实存在的值 */
  path: string
  body?: Record<string, unknown>
  /** 默认带 Bearer；公开内容端点不带 */
  anonymous?: boolean
}

const CASES: StubCase[] = [
  { contract: 'POST /register', path: '/register', body: { username: 'bob', password: 'x' } },
  {
    contract: 'POST /login',
    path: '/login',
    body: { username: 'alice', password: 'correct-horse' },
    anonymous: true
  },
  { contract: 'POST /refresh', path: '/refresh', body: { refreshToken: REFRESH_TOKEN } },
  { contract: 'POST /logout', path: '/logout', body: { refreshToken: REFRESH_TOKEN } },
  { contract: 'GET /me', path: '/me' },
  { contract: 'GET /me/profile', path: '/me/profile' },
  { contract: 'GET /projects', path: '/projects' },
  { contract: 'POST /projects', path: '/projects', body: { title: '契约项目' } },
  { contract: 'GET /projects/{projectId}', path: '/projects/project_1' },
  { contract: 'PATCH /projects/{projectId}', path: '/projects/project_1', body: { title: '改名' } },
  { contract: 'DELETE /projects/{projectId}', path: '/projects/project_1' },
  { contract: 'GET /documents/{documentId}', path: '/documents/document_1' },
  {
    contract: 'PATCH /documents/{documentId}',
    path: '/documents/document_1',
    body: { content: '<p>x</p>' }
  },
  { contract: 'GET /content/news', path: '/content/news', anonymous: true },
  {
    contract: 'GET /content/news/{slug}',
    path: '/content/news/starter-release',
    anonymous: true
  },
  { contract: 'GET /content/pricing', path: '/content/pricing', anonymous: true }
]

const ajv = new Ajv2020({ strict: false, allErrors: true })
// 只把 components 挂进去：paths 里有 OpenAPI 自己的关键字（in / required 布尔值等），
// 交给 ajv 编译只会报无关的 schema 错误。
ajv.addSchema({ $id: 'contract', components: { schemas: spec.components.schemas } })

const validatorFor = (contract: string): ValidateFunction => {
  const { component } = successResponse(contract)

  expect(component, `${contract} 的成功响应不是 component 引用，无法编译校验器`).not.toBeNull()

  const validate = ajv.getSchema(`contract#/components/schemas/${component!}`)

  expect(validate, `契约里缺少 component ${component!}`).toBeDefined()

  return validate!
}

let server: Server
let baseUrl: string

beforeAll(async () => {
  server = createStubApiServer()
  // 0 端口：让内核挑一个空闲端口，不去抢 E2E 的 2127（可能正被另一轮 E2E 占着）
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}${API_PREFIX}`
})

afterAll(async () => {
  await new Promise<void>((done) => server.close(() => done()))
})

beforeEach(() => {
  // 每个用例都从同一份种子出发：DELETE 用例会删掉 project_1
  resetStubState(1)
})

describe('E2E stub API contract', () => {
  it('registers a contract endpoint for every stub route', () => {
    const covered = new Set(CASES.map((item) => item.contract))
    const uncovered = stubRoutes
      .filter((route) => route.contract !== null)
      .map((route) => route.contract as string)
      .filter((contract) => !covered.has(contract))

    expect(uncovered, '这些桩路由没有契约用例，它们的响应从未被校验过').toEqual([])
  })

  it.each(CASES.map((item) => [item.contract, item] as const))(
    'serves %s exactly as the contract describes',
    async (contract, testCase) => {
      const [method] = contract.split(' ') as [string]
      const expected = successResponse(contract)

      const response = await fetch(`${baseUrl}${testCase.path}`, {
        method,
        headers: {
          'content-type': 'application/json',
          ...(testCase.anonymous ? {} : { authorization: `Bearer ${ACCESS_TOKEN}` })
        },
        body: testCase.body ? JSON.stringify(testCase.body) : undefined
      })
      const payload: unknown = await response.json()

      // 状态码也来自 spec：创建类接口真实后端回 201，桩回 200 的话前端就没在真实语义上跑过
      expect(response.status, `${contract} 的 HTTP 状态码与契约不一致`).toBe(expected.status)

      const validate = validatorFor(contract)

      expect(
        validate(payload) ? [] : validate.errors,
        `${contract} 的桩响应不符合契约（桩与真实后端必须逐字段等价）`
      ).toEqual([])
    }
  )
})
