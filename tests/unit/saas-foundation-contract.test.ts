/*
  【文件职责】
    单测：通用 SaaS 基座定位契约，防止旧定位与旧响应契约口径回流。
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
const ignoredFiles = new Set([
  'scripts/i18n-diff.json',
  'scripts/i18n-used.json',
  'tests/unit/saas-foundation-contract.test.ts'
])
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

const legacyPatterns = [
  /personal creator/i,
  /personal-creator/i,
  /consumer-facing/i,
  /consumer creator/i,
  /consumer-product/i,
  /C 端个人创作者/,
  /个人创作者/,
  /个人产品/,
  /裸 JSON/,
  /非信封 JSON/,
  /跳过.*assertApiSuccess/,
  /旧说法/
]

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
          .filter((pattern) => pattern.test(source))
          .map((pattern) => `${file} -> ${pattern}`)
      })

    expect(offenders).toEqual([])
  })
})
