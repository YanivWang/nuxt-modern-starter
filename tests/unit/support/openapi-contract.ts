/*
  【文件职责】
    契约测试共享装置：加载 contracts/openapi.yaml，并提供「从端点定位到响应 schema」的导航。

  【架构位置】
    tests/unit/support — 被 tests/unit/api-contract.test.ts 与 stub-api-contract.test.ts 引用。
    不以 .test.ts 结尾，因此不会被 vitest 当成用例文件收集。

  【主要导出 / 路由】
    spec、API_PREFIX、specEndpoints、readRepoFile、
    deref、jsonTypesOf、successResponse、successDataSchema、navigate

  【依赖关系】
    - 依赖：contracts/openapi.yaml（后端 OpenAPI 的引入副本）
    - 被引用：tests/unit/api-contract.test.ts、tests/unit/stub-api-contract.test.ts

  【渲染 / 数据】
    无

  【边界与注意】
    「怎么读这份 spec」只在这里写一遍：字段级契约与桩后端契约两套断言必须看到同一个
    版本前缀、同一份 $ref 解析规则、同一条「成功响应是哪个状态码」的判定。
    两边各写一份的话，两套测试会在不同的理解上各自变绿。
*/
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as parseYaml } from 'js-yaml'
import { expect } from 'vitest'

const projectRoot = resolve(__dirname, '../../..')

export const readRepoFile = (rel: string) => readFileSync(resolve(projectRoot, rel), 'utf8')

/** spec 里出现的 JSON 类型；integer 与 number 在 OpenAPI 里是两种写法，不做归一 */
export type JsonType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null'

export type SchemaNode = {
  $ref?: string
  type?: JsonType | JsonType[]
  /** 判别联合的标记值，如 instant 分支的 const: true */
  const?: unknown
  enum?: string[]
  anyOf?: SchemaNode[]
  oneOf?: SchemaNode[]
  properties?: Record<string, SchemaNode>
  required?: string[]
  items?: SchemaNode
}

type Operation = {
  requestBody?: { content?: Record<string, { schema: SchemaNode }> }
  responses: Record<string, { content?: Record<string, { schema: SchemaNode }> }>
}

export type OpenApiSpec = {
  paths: Record<string, Record<string, Operation>>
  components: { schemas: Record<string, SchemaNode> }
}

export const spec = parseYaml(readRepoFile('contracts/openapi.yaml')) as OpenApiSpec

/** 业务路径的版本前缀。/health、/ready 不带前缀，不参与推导。 */
export const API_PREFIX = (() => {
  const versioned = Object.keys(spec.paths).filter((path) => path.startsWith('/api/'))
  const prefixes = new Set(versioned.map((path) => path.split('/').slice(0, 3).join('/')))

  expect([...prefixes], 'spec 里出现了多个业务前缀；无版本别名应当已经下线').toHaveLength(1)

  return [...prefixes][0]!
})()

/** 去掉版本前缀后的端点集合，与 adapter 的相对路径写法对齐 */
export const specEndpoints = new Set(
  Object.entries(spec.paths).flatMap(([path, operations]) =>
    path.startsWith(`${API_PREFIX}/`)
      ? Object.keys(operations).map(
          (method) => `${method.toUpperCase()} ${path.slice(API_PREFIX.length)}`
        )
      : []
  )
)

/** 顺着 $ref 取出真正的节点；components 里同一个实体只声明一次，其余位置都是引用。 */
export const deref = (node: SchemaNode): SchemaNode => {
  if (!node.$ref) return node

  const name = node.$ref.replace('#/components/schemas/', '')
  const target = spec.components.schemas[name]

  expect(target, `契约里缺少 component ${name}`).toBeDefined()

  return deref(target!)
}

/** 该节点允许的 JSON 类型集合；可空字段在 spec 里是 anyOf [T, null]。 */
export const jsonTypesOf = (node: SchemaNode): JsonType[] => {
  const resolved = deref(node)
  const branches = resolved.anyOf ?? resolved.oneOf

  if (branches) return [...new Set(branches.flatMap(jsonTypesOf))].sort()
  if (Array.isArray(resolved.type)) return [...resolved.type].sort()

  return resolved.type ? [resolved.type] : []
}

const operationOf = (endpoint: string) => {
  const [method, path] = endpoint.split(' ') as [string, string]
  const operation = spec.paths[`${API_PREFIX}${path}`]?.[method.toLowerCase()]

  expect(operation, `契约里没有 ${endpoint}`).toBeDefined()

  return operation!
}

/**
 * 成功响应及其状态码。
 * 创建类接口回的是 201 而不是 200，所以按 2 开头找而不是写死 "200" ——
 * 写死的话，桩后端与真实后端的状态码差异就永远校验不到。
 *
 * component 一并返回原始名字：ajv 要按 $ref 编译校验器，而 schema 已经解引用过了。
 */
export const successResponse = (
  endpoint: string
): { status: number; schema: SchemaNode; component: string | null } => {
  const found = Object.entries(operationOf(endpoint).responses).find(([status]) =>
    status.startsWith('2')
  )
  const schema = found?.[1].content?.['application/json']?.schema

  expect(schema, `${endpoint} 的成功响应没有 JSON schema`).toBeDefined()

  const ref = schema!.$ref

  return {
    status: Number(found![0]),
    schema: deref(schema!),
    component: ref ? ref.replace('#/components/schemas/', '') : null
  }
}

/** 成功响应信封里的 data 子 schema。 */
export const successDataSchema = (endpoint: string): SchemaNode => {
  const data = successResponse(endpoint).schema.properties?.data

  expect(data, `${endpoint} 的成功响应没有描述 data`).toBeDefined()

  return deref(data!)
}

/** 请求体 schema；没有 requestBody 的端点返回 null。 */
export const requestBodySchema = (endpoint: string): SchemaNode | null => {
  const schema = operationOf(endpoint).requestBody?.content?.['application/json']?.schema

  return schema ? deref(schema) : null
}

/** 段名 '[]' 进数组元素，其余进对象属性。 */
export const navigate = (node: SchemaNode, ...segments: string[]): SchemaNode =>
  segments.reduce((current, segment) => {
    const next = segment === '[]' ? current.items : current.properties?.[segment]

    expect(next, `契约里找不到子 schema：${segment}`).toBeDefined()

    return deref(next!)
  }, node)

/** 可空字段在 spec 里是 anyOf [T, null]；取出非 null 的那一支来做字段级断言。 */
export const nonNullBranch = (node: SchemaNode): SchemaNode => {
  const branches = node.anyOf ?? node.oneOf

  if (!branches) return node

  const branch = branches.map(deref).find((item) => item.type !== 'null')

  expect(branch, '这个联合里没有非 null 分支').toBeDefined()

  return branch!
}
