/**
 * Single source of truth for "which files docs-sync must cover".
 *
 * generate-manifest.mjs 写入 manifest，check-docs-sync.mjs 与 tests/unit/doc-claims.test.ts
 * 用同一份枚举结果去比对 —— 覆盖范围由真实文件树决定，不再靠硬编码计数。
 */
import { execSync } from 'node:child_process'
import path from 'node:path'

export const ROOT = path.resolve(import.meta.dirname, '../..')

export const FIND_SOURCES_CMD =
  'find app server config docker nuxt.config.ts vitest.config.ts -type f \\( -name "*.ts" -o -name "*.vue" -o -name "*.js" -o -name "*.scss" -o -name "*.yaml" -o -name "*.conf" \\) 2>/dev/null | sort'

export const FIND_DOCS_CMDS = [
  'find docs-site -name "*.md" | sort',
  'find docs -name "*.md" | sort'
]

const run = (cmd) =>
  execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)

export const enumerateSourcePaths = () => run(FIND_SOURCES_CMD)

export const enumerateDocPaths = () => [...FIND_DOCS_CMDS.flatMap(run), 'README.md']

/**
 * 比对已记录的路径集合与真实文件树。
 * 返回 { added, removed }：added 是新增但未纳入 docs-sync 的文件，removed 是已删除但仍被记录的。
 */
export const diffAgainstDisk = (recordedPaths, actualPaths) => {
  const recorded = new Set(recordedPaths)
  const actual = new Set(actualPaths)

  return {
    added: [...actual].filter((p) => !recorded.has(p)).sort(),
    removed: [...recorded].filter((p) => !actual.has(p)).sort()
  }
}

export const formatDiff = ({ added, removed }, label, regenerateHint) => {
  const lines = []
  if (added.length) {
    lines.push(
      `${label}: ${added.length} 个文件未纳入 docs-sync：`,
      ...added.map((p) => `  + ${p}`)
    )
  }
  if (removed.length) {
    lines.push(
      `${label}: ${removed.length} 个记录指向已删除的文件：`,
      ...removed.map((p) => `  - ${p}`)
    )
  }
  if (lines.length) {
    lines.push(`修复：${regenerateHint}`)
  }
  return lines
}
