#!/usr/bin/env node
/**
 * 同步后端 OpenAPI 契约到 contracts/openapi.yaml，并记录它的来源。
 *
 * 前端把契约「引入」而不是「运行时读取」，是为了让 tests/unit/api-contract.test.ts
 * 能在没有后端仓库的机器上（比如 CI）照样校验 adapter 路径、API base 前缀与响应字段形状。
 *
 * 引入带来一个自己的问题：这份副本可以被人直接改，而前端 CI 里没有后端源码可比对。
 * 所以同步时把内容摘要与上游 commit 写进 contracts/SOURCE.json：
 * --check 无论有没有后端仓库都会核对摘要，副本被手工改过会立刻失败。
 * 上游是否已经更新则仍然只能在有后端仓库时判断 —— 那是引入这种做法的固有边界。
 *
 * 用法：
 *   node scripts/sync-api-contract.mjs           # 从后端仓库同步
 *   node scripts/sync-api-contract.mjs --check   # 只比对，不写入；不一致时退出码 1
 *   node scripts/sync-api-contract.mjs --from <path>
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = resolve(ROOT, 'contracts/openapi.yaml')
const SOURCE_RECORD = resolve(ROOT, 'contracts/SOURCE.json')
const DEFAULT_SOURCE = resolve(ROOT, '../nuxt-modern-starter-api/docs/openapi.yaml')

const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const fromIndex = args.indexOf('--from')
const source = fromIndex >= 0 ? resolve(args[fromIndex + 1] ?? '') : DEFAULT_SOURCE

const sha256 = (text) => createHash('sha256').update(text).digest('hex')

/** 上游最后一次改动这份契约的 commit；拿不到（不是 git 仓库等）时记 null 而不是让同步失败 */
const upstreamCommit = (specPath) => {
  try {
    return (
      execFileSync('git', ['log', '-1', '--format=%H', '--', specPath], {
        cwd: dirname(specPath),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim() || null
    )
  } catch {
    return null
  }
}

const readRecord = () => {
  if (!existsSync(SOURCE_RECORD)) return null
  try {
    return JSON.parse(readFileSync(SOURCE_RECORD, 'utf8'))
  } catch {
    return null
  }
}

const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : null

if (checkOnly) {
  // 第一关不依赖后端仓库：副本是否还是当初同步下来的那份
  const record = readRecord()

  if (current === null) {
    console.error('[contract] 缺少 contracts/openapi.yaml。修复：pnpm contract:sync')
    process.exit(1)
  }

  if (!record?.sha256) {
    console.error('[contract] 缺少 contracts/SOURCE.json 或其中没有摘要。修复：pnpm contract:sync')
    process.exit(1)
  }

  if (record.sha256 !== sha256(current)) {
    console.error(
      '[contract] contracts/openapi.yaml 与 contracts/SOURCE.json 记录的摘要不符。\n' +
        '  这份文件是后端契约的引入副本，只能由 pnpm contract:sync 生成，不要手工编辑。'
    )
    process.exit(1)
  }

  // 第二关需要后端仓库：上游是否已经走在前面
  if (!existsSync(source)) {
    console.log(`[contract] 摘要一致；未找到后端契约 ${source}，跳过与上游的比对`)
    process.exit(0)
  }

  if (readFileSync(source, 'utf8') !== current) {
    console.error(
      '[contract] contracts/openapi.yaml 已落后于后端契约。\n' +
        '  修复：pnpm contract:sync，然后确认 adapter、类型与 E2E 桩后端是否需要同步调整。'
    )
    process.exit(1)
  }

  console.log('[contract] contracts/openapi.yaml 与后端一致')
  process.exit(0)
}

if (!existsSync(source)) {
  console.error(`[contract] 找不到后端契约：${source}`)
  process.exit(1)
}

const upstream = readFileSync(source, 'utf8')
// 记录里不放同步时间：那会让每次 no-op 同步都产生一条 diff，评审时全是噪声。
// 两个字段都由内容与上游历史决定，内容没变就不会有 diff。
const record = {
  source: 'nuxt-modern-starter-api',
  sourcePath: 'docs/openapi.yaml',
  sourceCommit: upstreamCommit(source),
  sha256: sha256(upstream)
}
const nextRecord = `${JSON.stringify(record, null, 2)}\n`
const currentRecord = existsSync(SOURCE_RECORD) ? readFileSync(SOURCE_RECORD, 'utf8') : null

if (upstream === current && nextRecord === currentRecord) {
  console.log('[contract] contracts/openapi.yaml 与后端一致')
  process.exit(0)
}

writeFileSync(TARGET, upstream)
writeFileSync(SOURCE_RECORD, nextRecord)
console.log(`[contract] 已从 ${source} 更新 contracts/openapi.yaml 与 contracts/SOURCE.json`)
