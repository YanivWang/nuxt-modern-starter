/*
  【文件职责】
    单测：通用 SaaS 基座定位契约，防止旧定位与旧响应契约口径回流。
    黑名单模式存放在 docs-sync/legacy-terms.json —— 模式本身就是被禁止的字面量，
    写在测试代码里会让扫描器扫到自己，从而不得不自我豁免。
*/
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../..')
const scannedRoots = [
  'README.md',
  'app',
  'config',
  'docs',
  'docs-site',
  'docs-sync',
  'tests',
  'scripts',
  'server'
] as const

const ignoredDirectories = new Set(['node_modules', '.nuxt', '.output', '.git', 'dist'])
type LegacyTerm = { source: string; flags: string; reason: string }
type LegacyTermsFile = { ignoredFiles: string[]; patterns: LegacyTerm[] }

const legacyTerms = JSON.parse(
  readFileSync(resolve(projectRoot, 'docs-sync/legacy-terms.json'), 'utf8')
) as LegacyTermsFile

const ignoredFiles = new Set(legacyTerms.ignoredFiles)
const textExtensions = new Set([
  '.ts',
  '.vue',
  '.md',
  '.json',
  '.mjs',
  '.js',
  '.scss',
  '.css',
  '.yaml',
  '.yml'
])

const legacyPatterns = legacyTerms.patterns.map((term) => ({
  regex: new RegExp(term.source, term.flags),
  reason: term.reason
}))

const extensionOf = (filePath: string) => {
  const lastDot = filePath.lastIndexOf('.')
  return lastDot === -1 ? '' : filePath.slice(lastDot)
}

const collectTextFiles = (entry: string): string[] => {
  const absolutePath = resolve(projectRoot, entry)
  const relativePath = relative(projectRoot, absolutePath)

  if (ignoredFiles.has(relativePath)) {
    return []
  }

  const stat = statSync(absolutePath)

  if (stat.isDirectory()) {
    if (ignoredDirectories.has(entry.split('/').at(-1) || entry)) {
      return []
    }

    return readdirSync(absolutePath).flatMap((child) => collectTextFiles(join(entry, child)))
  }

  return textExtensions.has(extensionOf(entry)) ? [entry] : []
}

describe('SaaS foundation contract', () => {
  it('keeps old positioning and legacy compatibility language out of maintained source', () => {
    const offenders = scannedRoots
      .flatMap((entry) => collectTextFiles(entry))
      .flatMap((file) => {
        const source = readFileSync(resolve(projectRoot, file), 'utf8')

        return legacyPatterns
          .filter(({ regex }) => regex.test(source))
          .map(({ regex, reason }) => `${file} -> ${regex.source}（${reason}）`)
      })

    expect(offenders).toEqual([])
  })
})
