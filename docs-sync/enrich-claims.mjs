#!/usr/bin/env node
/**
 * Adds evidenceHint (file:line) to every claim; fails if any doc has < 2 claims.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/manifest.json'), 'utf8'))
const docClaims = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/doc-claims.json'), 'utf8'))

const findSymbolLine = (filePath, symbol) => {
  const full = path.join(ROOT, filePath)
  if (!fs.existsSync(full)) return null
  const lines = fs.readFileSync(full, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(symbol)) return `${filePath}:${i + 1}`
  }
  return null
}

for (const claim of docClaims.claims) {
  const hints = []
  for (const symbol of claim.symbols) {
    for (const src of claim.sourceFiles) {
      const loc = findSymbolLine(src, symbol)
      if (loc) {
        hints.push(`${loc} (${symbol})`)
        break
      }
    }
  }
  claim.evidenceHint = hints.length ? hints.join('; ') : 'TODO-VERIFY'
}

const docFiles = manifest.docFiles.map((d) => d.path)
const claimCountByDoc = Object.fromEntries(docFiles.map((d) => [d, 0]))
for (const claim of docClaims.claims) {
  claimCountByDoc[claim.docFile] = (claimCountByDoc[claim.docFile] || 0) + 1
}

const missing = docFiles.filter((d) => (claimCountByDoc[d] || 0) < 2)
const todoClaims = docClaims.claims.filter((c) => c.evidenceHint === 'TODO-VERIFY')

docClaims.generatedAt = new Date().toISOString()
docClaims.requiredClaimsPerDoc = 2
docClaims.claimCount = docClaims.claims.length
docClaims.docCoverage = {
  total: docFiles.length,
  covered: docFiles.length - missing.length,
  missing
}

fs.writeFileSync(path.join(ROOT, 'docs-sync/doc-claims.json'), JSON.stringify(docClaims, null, 2))

console.log(`claims: ${docClaims.claims.length}, TODO-VERIFY: ${todoClaims.length}`)
console.log(`docs >=2 claims: ${docFiles.length - missing.length}/${docFiles.length}`)
if (missing.length) {
  console.error('missing docs:', missing.join(', '))
  process.exit(1)
}
if (todoClaims.length) {
  console.error('claims without evidence:', todoClaims.map((c) => c.id).join(', '))
  process.exit(1)
}
