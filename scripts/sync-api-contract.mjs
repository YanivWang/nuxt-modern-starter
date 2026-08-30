#!/usr/bin/env node
/**
 * 同步后端 OpenAPI 契约到 contracts/openapi.yaml。
 *
 * 前端把契约「引入」而不是「运行时读取」，是为了让 tests/unit/api-contract.test.ts
 * 能在没有后端仓库的机器上（比如 CI）照样校验 adapter 路径与 API base 前缀。
 *
 * 用法：
 *   node scripts/sync-api-contract.mjs           # 从后端仓库同步
 *   node scripts/sync-api-contract.mjs --check   # 只比对，不写入；不一致时退出码 1
 *   node scripts/sync-api-contract.mjs --from <path>
 *
 * --check 在后端仓库不存在时会跳过（退出码 0）：前端 CI 里通常没有后端源码，
 * 那种情况下漂移由 api-contract 单测在引入的副本上兜底，而不是让流水线无谓地红。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = resolve(ROOT, 'contracts/openapi.yaml')
const DEFAULT_SOURCE = resolve(ROOT, '../nuxt-modern-starter-api/docs/openapi.yaml')

const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const fromIndex = args.indexOf('--from')
const source = fromIndex >= 0 ? resolve(args[fromIndex + 1] ?? '') : DEFAULT_SOURCE

if (!existsSync(source)) {
  if (checkOnly) {
    console.log(`[contract] 跳过：未找到后端契约 ${source}`)
    process.exit(0)
  }
  console.error(`[contract] 找不到后端契约：${source}`)
  process.exit(1)
}

const upstream = readFileSync(source, 'utf8')
const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : null

if (upstream === current) {
  console.log('[contract] contracts/openapi.yaml 与后端一致')
  process.exit(0)
}

if (checkOnly) {
  console.error(
    '[contract] contracts/openapi.yaml 已落后于后端契约。\n' +
      '  修复：pnpm contract:sync，然后确认 adapter、类型与 E2E 桩后端是否需要同步调整。'
  )
  process.exit(1)
}

writeFileSync(TARGET, upstream)
console.log(`[contract] 已从 ${source} 更新 contracts/openapi.yaml`)
