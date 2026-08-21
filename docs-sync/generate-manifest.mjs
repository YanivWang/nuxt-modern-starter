#!/usr/bin/env node
/**
 * Generates docs-sync/manifest.json, batches.json, and enumerates doc files.
 * Run: node docs-sync/generate-manifest.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  FIND_SOURCES_CMD as FIND_CMD,
  ROOT,
  enumerateDocPaths,
  enumerateSourcePaths
} from './lib/enumerate-sources.mjs'

const sourcePaths = enumerateSourcePaths()
const docPaths = enumerateDocPaths()

const moduleOf = (p) => {
  if (p.startsWith('config/')) return 'config'
  if (p.startsWith('server/')) return 'server'
  if (p.startsWith('docker/')) return 'docker'
  if (p === 'nuxt.config.ts' || p === 'vitest.config.ts') return 'config'
  if (p.startsWith('app/lib/')) return 'lib-http'
  if (p.startsWith('app/api/')) return 'api'
  if (p.startsWith('app/middleware/')) return 'middleware'
  if (p.startsWith('app/plugins/')) return 'plugins'
  if (p.startsWith('app/composables/')) return 'composables'
  if (p.startsWith('app/stores/')) return 'stores'
  if (p.startsWith('app/layouts/')) return 'layouts'
  if (p.startsWith('app/pages/')) return 'pages'
  if (p.startsWith('app/features/workspace/')) return 'feature-workspace'
  if (p.startsWith('app/features/editor/')) return 'feature-editor'
  if (p.startsWith('app/features/account')) return 'feature-account'
  if (p.startsWith('app/features/product-shell/')) return 'feature-product-shell'
  if (p.startsWith('app/features/templates/')) return 'feature-templates'
  if (p.startsWith('app/assets/')) return 'assets-styles'
  if (p.startsWith('app/components/')) return 'components'
  if (p.startsWith('app/utils/')) return 'utils'
  if (p.startsWith('app/types/')) return 'types'
  return 'app-root'
}

const batchRules = [
  {
    id: 1,
    name: 'config + nuxt.config',
    match: (p) =>
      p.startsWith('config/') ||
      p === 'nuxt.config.ts' ||
      p === 'app/app.config.ts' ||
      p === 'app/shims.d.ts' ||
      p.startsWith('app/types/')
  },
  {
    id: 2,
    name: 'app/lib/http + app/api',
    match: (p) => p.startsWith('app/lib/http/') || p.startsWith('app/api/')
  },
  {
    id: 3,
    name: 'middleware + plugins + composables + utils',
    match: (p) =>
      p.startsWith('app/middleware/') ||
      p.startsWith('app/plugins/') ||
      p.startsWith('app/composables/') ||
      p.startsWith('app/utils/')
  },
  {
    id: 4,
    name: 'stores + layouts + components + app-root',
    match: (p) =>
      p.startsWith('app/stores/') ||
      p.startsWith('app/layouts/') ||
      p.startsWith('app/components/') ||
      p === 'app/app.vue' ||
      p === 'app/error.vue'
  },
  {
    id: 5,
    name: 'pages + feature-workspace + feature-editor',
    match: (p) =>
      p.startsWith('app/pages/') ||
      p.startsWith('app/features/workspace/') ||
      p.startsWith('app/features/editor/')
  },
  {
    id: 6,
    name: 'feature-account + product-shell + templates',
    match: (p) =>
      p.startsWith('app/features/account') ||
      p.startsWith('app/features/product-shell/') ||
      p.startsWith('app/features/templates/')
  },
  {
    id: 7,
    name: 'server + assets/styles',
    match: (p) => p.startsWith('server/') || p.startsWith('app/assets/')
  },
  {
    id: 8,
    name: 'docker + vitest.config + doc-review',
    match: (p) => p.startsWith('docker/') || p === 'vitest.config.ts'
  }
]

const assignBatch = (p) => {
  const rule = batchRules.find((r) => r.match(p))
  if (!rule) throw new Error(`No batch for: ${p}`)
  return rule.id
}

const sourceFiles = sourcePaths.map((p) => {
  const full = path.join(ROOT, p)
  const content = fs.readFileSync(full, 'utf8')
  return {
    path: p,
    type: p.split('.').pop(),
    module: moduleOf(p),
    batch: assignBatch(p),
    hasHeaderComment: content.includes('【文件职责】')
  }
})

const batches = batchRules.map((rule) => ({
  id: rule.id,
  name: rule.name,
  files: sourceFiles.filter((f) => f.batch === rule.id).map((f) => f.path)
}))

const manifest = {
  generatedAt: new Date().toISOString(),
  findCommand: FIND_CMD,
  sourceFileCount: sourceFiles.length,
  docFileCount: docPaths.length,
  sourceFiles,
  docFiles: docPaths.map((p) => ({ path: p, type: 'md' }))
}

fs.mkdirSync(path.join(ROOT, 'docs-sync'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'docs-sync/manifest.json'), JSON.stringify(manifest, null, 2))
fs.writeFileSync(
  path.join(ROOT, 'docs-sync/batches.json'),
  JSON.stringify({ batches, totalFiles: sourceFiles.length }, null, 2)
)

const coverage = `# Coverage Report

Generated: ${manifest.generatedAt}

## Enumeration

\`\`\`bash
${FIND_CMD}
\`\`\`

**Source file count:** ${sourceFiles.length}

**Documentation file count:** ${docPaths.length}

## Batch distribution

${batches.map((b) => `- Batch ${b.id} (${b.name}): ${b.files.length} files`).join('\n')}

## Missing header comments

${
  sourceFiles
    .filter((f) => !f.hasHeaderComment)
    .map((f) => `- ${f.path}`)
    .join('\n') || '(none)'
}
`

fs.writeFileSync(path.join(ROOT, 'docs-sync/COVERAGE.md'), coverage)

console.log(`manifest: ${sourceFiles.length} source files, ${docPaths.length} docs`)
console.log(batches.map((b) => `batch ${b.id}: ${b.files.length}`).join(', '))
