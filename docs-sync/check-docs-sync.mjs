#!/usr/bin/env node
/**
 * Validates docs-sync manifest, batches, doc-claims, and header comments —
 * including that every repo file path named inside a header comment actually exists.
 * Usage: node docs-sync/check-docs-sync.mjs [--batch N]
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import {
  diffAgainstDisk,
  enumerateDocPaths,
  enumerateSourcePaths,
  formatDiff
} from './lib/enumerate-sources.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const batchArg = process.argv.find((a) => a.startsWith('--batch='))
const batchFlagIdx = process.argv.indexOf('--batch')
const batchId =
  batchArg?.split('=')[1] ?? (batchFlagIdx >= 0 ? process.argv[batchFlagIdx + 1] : null)

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/manifest.json'), 'utf8'))
const batches = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/batches.json'), 'utf8'))
const docClaims = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/doc-claims.json'), 'utf8'))

const errors = []
const warnings = []

const read = (rel) => {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) return null
  return fs.readFileSync(full, 'utf8')
}

// 1. batches union equals manifest source files
const manifestPaths = new Set(manifest.sourceFiles.map((f) => f.path))
const batchPaths = new Set(batches.batches.flatMap((b) => b.files))
for (const p of manifestPaths) {
  if (!batchPaths.has(p)) errors.push(`batch missing file: ${p}`)
}
for (const p of batchPaths) {
  if (!manifestPaths.has(p)) errors.push(`batch has unknown file: ${p}`)
}
// 覆盖范围对着真实文件树比，不用硬编码计数：新增/删除文件时给出可执行的修复提示
const REGENERATE_HINT = 'pnpm docs:sync:manifest（随后为新文件补头注释与 doc-claims）'
errors.push(
  ...formatDiff(
    diffAgainstDisk([...manifestPaths], enumerateSourcePaths()),
    'manifest.sourceFiles',
    REGENERATE_HINT
  )
)
errors.push(
  ...formatDiff(
    diffAgainstDisk(
      manifest.docFiles.map((d) => d.path),
      enumerateDocPaths()
    ),
    'manifest.docFiles',
    REGENERATE_HINT
  )
)
if (batches.totalFiles !== manifest.sourceFiles.length) {
  errors.push(
    `batches.totalFiles ${batches.totalFiles} 与 manifest.sourceFiles ${manifest.sourceFiles.length} 不一致 → ${REGENERATE_HINT}`
  )
}

// 2. header comment check
const scopeFiles = batchId
  ? (batches.batches.find((b) => String(b.id) === String(batchId))?.files ?? [])
  : manifest.sourceFiles.map((f) => f.path)

for (const rel of scopeFiles) {
  const content = read(rel)
  if (!content) {
    errors.push(`missing file: ${rel}`)
    continue
  }
  if (!content.includes('【文件职责】')) {
    errors.push(`missing header comment: ${rel}`)
  }
}

// 3. doc coverage + evidenceHint (full run only)
if (!batchId) {
  const docFiles = manifest.docFiles.map((d) => d.path)
  const claimCountByDoc = Object.fromEntries(docFiles.map((d) => [d, 0]))
  for (const claim of docClaims.claims) {
    claimCountByDoc[claim.docFile] = (claimCountByDoc[claim.docFile] || 0) + 1
    if (!claim.evidenceHint || claim.evidenceHint === 'TODO-VERIFY') {
      errors.push(`claim ${claim.id}: missing evidenceHint`)
    } else {
      for (const part of claim.evidenceHint.split(';')) {
        const loc = part.trim().split(' ')[0]
        const [file, lineStr] = loc.split(':')
        if (file && lineStr) {
          const content = read(file)
          if (!content) {
            errors.push(`claim ${claim.id}: evidence file missing ${file}`)
          } else {
            const lineNum = Number(lineStr)
            const lines = content.split('\n')
            if (lineNum < 1 || lineNum > lines.length) {
              errors.push(`claim ${claim.id}: evidence line out of range ${loc}`)
            }
          }
        }
      }
    }
  }
  const minClaims = docClaims.requiredClaimsPerDoc ?? 2
  for (const doc of docFiles) {
    if ((claimCountByDoc[doc] || 0) < minClaims) {
      errors.push(`doc ${doc}: only ${claimCountByDoc[doc] || 0} claims (need ${minClaims})`)
    }
  }
}

// 4. doc-claims symbol grep
const claimScope = batchId
  ? docClaims.claims.filter((c) => c.sourceFiles.some((f) => scopeFiles.includes(f)))
  : docClaims.claims

for (const claim of claimScope) {
  for (const symbol of claim.symbols) {
    let found = false
    for (const src of claim.sourceFiles) {
      const content = read(src)
      if (content?.includes(symbol)) {
        found = true
        break
      }
    }
    if (!found) {
      errors.push(
        `claim ${claim.id}: symbol "${symbol}" not found in ${claim.sourceFiles.join(', ')}`
      )
    }
  }
  const docContent = read(claim.docFile)
  if (!docContent) {
    warnings.push(`claim ${claim.id}: doc file missing ${claim.docFile}`)
  }
}

// 5. hardcoded path constants in key docs
const routesContent = read('config/routes.ts')
const authContent = read('config/auth.ts')
const siteContent = read('config/site.ts')

if (routesContent && authContent && siteContent) {
  const productPatterns = ['/workspace/**', '/docs/**', '/account']
  for (const pattern of productPatterns) {
    if (!routesContent.includes(pattern)) {
      errors.push(`config/routes.ts missing product pattern: ${pattern}`)
    }
  }
  if (!authContent.includes("login: '/sign-in'")) {
    errors.push('config/auth.ts AUTH_REDIRECTS.login mismatch')
  }
  if (
    !siteContent.includes("DEFAULT_LOCALE = 'zh-CN'") &&
    !siteContent.includes('DEFAULT_LOCALE')
  ) {
    errors.push('config/site.ts missing DEFAULT_LOCALE')
  }
}

// 6. batch report exists when --batch
if (batchId) {
  const reportPath = path.join(ROOT, `docs-sync/reports/batch-${batchId}.md`)
  if (!fs.existsSync(reportPath)) {
    warnings.push(`batch report not found: docs-sync/reports/batch-${batchId}.md`)
  }
}

// 7. inline comments on all source files (full run only)
if (!batchId) {
  const hasInlineComment = (content, rel) => {
    if (/\.(ya?ml|conf)$/i.test(rel)) {
      const lines = content.split('\n')
      let i = 0
      while (i < lines.length && (lines[i].startsWith('#') || lines[i].trim() === '')) i++
      const body = lines.slice(i).join('\n')
      return /(^|\n)\s*#/.test(body)
    }
    let body = content
    const blockEnd = content.indexOf('*/')
    if (blockEnd >= 0) body = content.slice(blockEnd + 2)
    else {
      const htmlEnd = content.indexOf('-->')
      if (htmlEnd >= 0) body = content.slice(htmlEnd + 3)
    }
    return /(^|\n)\s*(\/\/|\/\*\*|<!--(?![\s\S]*【文件职责]))/.test(body)
  }
  for (const rel of manifest.sourceFiles.map((f) => f.path)) {
    const content = read(rel)
    if (content && !hasInlineComment(content, rel)) {
      errors.push(`missing inline comment: ${rel}`)
    }
  }
}

// 7b. file paths named inside header comments must exist
//
// 头注释里的「依赖 / 被引用」写的是仓库内的真实路径，而此前没有任何一条检查看过它们 ——
// 于是 server/api/telemetry/errors.post.ts 长期指着一个从不存在的 tests/unit/telemetry-errors.test.ts，
// 全套门禁照样绿。头注释是这个仓库的主要导航方式，指错地方比不写更糟。
//
// 只校验「以已知源码后缀结尾、且首段是仓库内真实顶层目录」的引用：
// 路由（/docs/new）、无后缀模块说明符（config/routes）与通配（app/api/*）都不在此列 ——
// 它们无法与文件路径可靠区分，硬要校验只会制造假阳性。
const HEADER_PATH_EXTENSIONS = [
  'ts',
  'vue',
  'mjs',
  'cjs',
  'json',
  'yaml',
  'yml',
  'scss',
  'css',
  'md'
]
// 构建产物不进版本库：CI 上不存在，本地存在，校验它只会得到一条时有时无的错误
const HEADER_PATH_IGNORED_ROOTS = new Set([
  '.output',
  '.nuxt',
  '.nitro',
  'node_modules',
  'coverage'
])

const repoTopLevelDirs = new Set(
  fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
)

const headerPathPattern = new RegExp(
  String.raw`[\w.@-]+(?:\/[\w.@\[\]-]+)+\.(?:${HEADER_PATH_EXTENSIONS.join('|')})`,
  'g'
)

if (!batchId) {
  for (const rel of manifest.sourceFiles.map((f) => f.path)) {
    const content = read(rel)
    if (!content) continue

    const header = content.match(/【文件职责】[\s\S]*?(?:\*\/|-->)/)
    if (!header) continue

    for (const candidate of new Set(header[0].match(headerPathPattern) ?? [])) {
      const [root] = candidate.split('/')
      if (candidate.includes('*')) continue
      if (HEADER_PATH_IGNORED_ROOTS.has(root)) continue
      if (!repoTopLevelDirs.has(root)) continue
      if (fs.existsSync(path.join(ROOT, candidate))) continue

      errors.push(`header comment references a missing file: ${rel} → ${candidate}`)
    }
  }
}

// 8. doc body mentions at least one claim symbol (full run only)
if (!batchId) {
  for (const claim of docClaims.claims) {
    const docContent = read(claim.docFile)
    if (!docContent) continue
    const symbolInDoc = claim.symbols.some((symbol) => docContent.includes(symbol))
    const pathInDoc = claim.sourceFiles.some((src) => {
      const base = src.split('/').pop()
      return base && docContent.includes(base)
    })
    if (!symbolInDoc && !pathInDoc) {
      errors.push(`claim ${claim.id}: no symbol or source file ref in ${claim.docFile}`)
    }
  }
}

console.log(`docs-sync check${batchId ? ` (batch ${batchId})` : ''}`)
console.log(`scope files: ${scopeFiles.length}`)
console.log(`claims checked: ${claimScope.length}`)

// 9. strict 100% alignment (extract + verify all doc references)
if (!batchId) {
  try {
    // check 必须只读：提取器比较当前结果与提交快照，不刷新 generatedAt 或写任何文件。
    execSync('node docs-sync/extract-doc-references.mjs --check', { cwd: ROOT, stdio: 'pipe' })
    execSync('node docs-sync/verify-full-alignment.mjs', { cwd: ROOT, stdio: 'pipe' })
    console.log('strict alignment: 100% verified')
  } catch (e) {
    // stdout 为空 Buffer 时不是 nullish，?? 会把 stderr 整个吞掉 —— 失败原因必须两路都取
    const out = [e.stdout?.toString(), e.stderr?.toString()]
      .filter((chunk) => chunk && chunk.trim())
      .join('\n')
    errors.push(`strict alignment failed:\n${out || e.message}`)
  }
}

if (warnings.length) {
  console.log('\nWarnings:')
  warnings.forEach((w) => console.log(`  ⚠ ${w}`))
}

if (errors.length) {
  console.log('\nErrors:')
  errors.forEach((e) => console.log(`  ✗ ${e}`))
  process.exit(1)
}

console.log('\n✓ All checks passed')
process.exit(0)
