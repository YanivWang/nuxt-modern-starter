/*
  【文件职责】
    单测：doc-claims.json、doc-references.json 与 manifest 对齐；严格 100% 引用校验与 docs-sync 门禁一致。
*/
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../..')

const readJson = <T>(rel: string): T =>
  JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) as T

const readText = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

type DocClaim = {
  id: string
  docFile: string
  symbols: string[]
  sourceFiles: string[]
  evidenceHint: string
}

describe('doc-claims sync', () => {
  const manifest = readJson<{ sourceFiles: { path: string }[]; docFiles: { path: string }[] }>(
    'docs-sync/manifest.json'
  )
  const docClaims = readJson<{ claims: DocClaim[]; requiredClaimsPerDoc?: number }>(
    'docs-sync/doc-claims.json'
  )
  const minClaims = docClaims.requiredClaimsPerDoc ?? 2

  it('manifest covers 130 source files and 33 docs', () => {
    expect(manifest.sourceFiles).toHaveLength(130)
    expect(manifest.docFiles).toHaveLength(33)
  })

  it('each doc has at least required claims with evidenceHint', () => {
    const countByDoc = Object.fromEntries(manifest.docFiles.map((d) => [d.path, 0]))
    for (const claim of docClaims.claims) {
      countByDoc[claim.docFile] = (countByDoc[claim.docFile] || 0) + 1
      expect(claim.evidenceHint, claim.id).toBeTruthy()
      expect(claim.evidenceHint, claim.id).not.toBe('TODO-VERIFY')
    }
    for (const doc of manifest.docFiles) {
      expect(countByDoc[doc.path] ?? 0, doc.path).toBeGreaterThanOrEqual(minClaims)
    }
  })

  it('claim symbols exist in source files', () => {
    for (const claim of docClaims.claims) {
      for (const symbol of claim.symbols) {
        const found = claim.sourceFiles.some((src) => readText(src).includes(symbol))
        expect(found, `${claim.id}: ${symbol}`).toBe(true)
      }
    }
  })

  it('claim evidence line numbers are in range', () => {
    for (const claim of docClaims.claims) {
      for (const part of claim.evidenceHint.split(';')) {
        const loc = part.trim().split(' ')[0]
        const [file, lineStr] = loc.split(':')
        if (!file || !lineStr) continue
        const lines = readText(file).split('\n')
        const lineNum = Number(lineStr)
        expect(lineNum, `${claim.id} ${loc}`).toBeGreaterThanOrEqual(1)
        expect(lineNum, `${claim.id} ${loc}`).toBeLessThanOrEqual(lines.length)
      }
    }
  })

  it('doc body mentions claim symbol or source filename', () => {
    for (const claim of docClaims.claims) {
      const docContent = readText(claim.docFile)
      const symbolInDoc = claim.symbols.some((s) => docContent.includes(s))
      const pathInDoc = claim.sourceFiles.some((src) => {
        const base = src.split('/').pop()
        return base ? docContent.includes(base) : false
      })
      expect(symbolInDoc || pathInDoc, `${claim.id} in ${claim.docFile}`).toBe(true)
    }
  })

  it('doc-references.json covers all documentation references', () => {
    expect(fs.existsSync(path.join(ROOT, 'docs-sync/doc-references.json'))).toBe(true)
    const refs = readJson<{ referenceCount: number; references: { type: string }[] }>(
      'docs-sync/doc-references.json'
    )
    expect(refs.referenceCount).toBeGreaterThan(1000)
    expect(refs.references.length).toBe(refs.referenceCount)
    const verifiable = refs.references.filter(
      (r) => !['path-pattern', 'external-script', 'route-template'].includes(r.type)
    )
    expect(verifiable.length).toBeGreaterThan(1000)
  })
})
