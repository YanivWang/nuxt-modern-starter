#!/usr/bin/env node
/**
 * Audits source files for at least one inline comment after the 【文件职责】 header block.
 * Exit 1 if any manifest source file is missing // or /** inline commentary.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/manifest.json'), 'utf8'))

const hasInlineComment = (content, rel) => {
  let body = content
  if (/\.(ya?ml|conf)$/i.test(rel)) {
    const lines = content.split('\n')
    let i = 0
    while (i < lines.length && (lines[i].startsWith('#') || lines[i].trim() === '')) i++
    body = lines.slice(i).join('\n')
    return /(^|\n)\s*#/.test(body)
  }
  const blockEnd = content.indexOf('*/')
  if (blockEnd >= 0) body = content.slice(blockEnd + 2)
  else {
    const htmlEnd = content.indexOf('-->')
    if (htmlEnd >= 0) body = content.slice(htmlEnd + 3)
  }
  return /(^|\n)\s*(\/\/|\/\*\*|<!--(?![\s\S]*【文件职责]))/.test(body)
}

const missing = []
for (const { path: rel } of manifest.sourceFiles) {
  const full = path.join(ROOT, rel)
  const content = fs.readFileSync(full, 'utf8')
  if (!hasInlineComment(content, rel)) {
    missing.push(rel)
  }
}

if (missing.length) {
  console.error(`missing inline comments: ${missing.length}`)
  missing.forEach((f) => console.error(`  - ${f}`))
  process.exit(1)
}

console.log(`inline comments: ${manifest.sourceFiles.length}/${manifest.sourceFiles.length}`)
