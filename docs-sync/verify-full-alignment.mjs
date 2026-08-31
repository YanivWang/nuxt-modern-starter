#!/usr/bin/env node
/**
 * Strict 100% alignment gate: every doc reference + source header exports + test counts.
 * Usage: node docs-sync/verify-full-alignment.mjs
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildSourceIndex,
  extractExports,
  extractHeaderSymbols,
  fileExists,
  isExternalScript,
  isPathPattern,
  readText,
  resolveDocPath,
  routeMatches
} from './lib/source-index.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/manifest.json'), 'utf8'))
const refsPath = path.join(ROOT, 'docs-sync/doc-references.json')

if (!fs.existsSync(refsPath)) {
  console.error('Run: node docs-sync/extract-doc-references.mjs first')
  process.exit(1)
}

const docRefs = JSON.parse(fs.readFileSync(refsPath, 'utf8'))
const index = buildSourceIndex(manifest)
const pathAllowlist = new Set(docRefs.pathAllowlist ?? [])
const symbolAllowlist = new Set([
  ...(docRefs.symbolAllowlist ?? []),
  'PascalCase',
  'useXxx',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'dataLayer'
])
const errors = []

/** 精确版本的单一来源：.nvmrc（Node）与 package.json packageManager（pnpm） */
/** config/ 下同样可能读取构建期环境变量的模块 */
const envVarConfigModules = fs
  .readdirSync(path.join(ROOT, 'config'))
  .filter((name) => name.endsWith('.ts'))
  .map((name) => `config/${name}`)

const pinnedNodeVersion = fs.existsSync(path.join(ROOT, '.nvmrc'))
  ? fs.readFileSync(path.join(ROOT, '.nvmrc'), 'utf8').trim().replace(/^v/, '')
  : undefined
const pinnedPnpmVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
).packageManager?.replace('pnpm@', '')

const pushError = (category, detail) => errors.push({ category, ...detail })

// ── 1. Verify every extracted doc reference ──
for (const ref of docRefs.references) {
  const { docFile, line, type, value } = ref

  switch (type) {
    case 'path-pattern':
    case 'external-script':
    case 'route-template':
      break
    case 'file-path': {
      if (pathAllowlist.has(value) || isPathPattern(value)) break
      const resolved = resolveDocPath(value)
      if (!fileExists(resolved)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `file not found: ${resolved}`
        })
      }
      break
    }
    case 'env-file':
      break
    case 'env-var': {
      // 构建期变量不一定直接写在 nuxt.config.ts 里：config/ 下的模块（如 config/cache.ts
      // 解析 nitro.storage）读 process.env 后再被 nuxt.config 引用，同样算「被引用」。
      const configSources = ['nuxt.config.ts', ...envVarConfigModules]
      const referenced = configSources.some((file) => readText(file)?.includes(value))
      if (!referenced && !index.envToRuntime[value]) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `env var not referenced in nuxt.config.ts or config/*.ts: ${value}`
        })
      }
      break
    }
    case 'script': {
      if (isExternalScript(value)) break
      if (!index.scripts.has(value)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `script not in package.json: ${value}`
        })
      }
      break
    }
    case 'route': {
      if (!routeMatches(value, index.routeIndex)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `route not mapped to pages or config: ${value}`
        })
      }
      break
    }
    case 'css-var': {
      if (!index.cssVars.has(value)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `CSS variable not found in styles: ${value}`
        })
      }
      break
    }
    case 'css-class': {
      if (!index.cssClasses.has(value)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `CSS class not found in styles: ${value}`
        })
      }
      break
    }
    case 'scss-var': {
      if (!readText('app/assets/styles/tokens/_variables.scss')?.includes(value)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `SCSS variable not found: ${value}`
        })
      }
      break
    }
    case 'symbol': {
      if (symbolAllowlist.has(value)) break
      let found = index.allSymbols.has(value) || index.allExports.has(value)
      if (!found) {
        for (const rel of index.files) {
          if (readText(rel)?.includes(value)) {
            found = true
            break
          }
        }
      }
      if (!found) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `symbol not found in codebase: ${value}`
        })
      }
      break
    }
    case 'version': {
      const [name, ver] = value.split('=')
      const packageNameByDocName = {
        Node: 'node',
        pnpm: 'pnpm',
        Nuxt: 'nuxt',
        Vue: 'vue',
        TypeScript: 'typescript',
        Pinia: 'pinia',
        Vitest: 'vitest'
      }
      const packageName = packageNameByDocName[name] ?? name
      let actual
      // engines 是支持范围（>=x <y），精确版本的单一来源是 .nvmrc 与 packageManager；
      // 文档里的「验证版本」表对齐的是后者，拿 engines 去比会把范围当成版本号。
      if (name === 'Node') actual = pinnedNodeVersion
      else if (name === 'pnpm') actual = pinnedPnpmVersion
      else actual = index.deps[packageName]?.replace(/^[\^~]/, '')

      const pattern = new RegExp(`^${ver.replace(/\./g, '\\.').replace(/x/g, '\\d+')}(?:\\.|$)`)
      if (actual && ver !== actual && !pattern.test(actual)) {
        pushError('doc-reference', {
          docFile,
          line,
          type,
          value,
          message: `version mismatch: doc ${ver} vs package.json ${actual}`
        })
      }
      break
    }
    case 'test-count':
      break
    default:
      break
  }
}

// ── 2. Test counts in docs vs vitest ──
/**
 * 用例数只认真实跑一遍 vitest 得到的结果，拿不到就不比。
 *
 * 这里曾经在拿不到时回退成「静态数源码里的 it( 行数」。那个数字数不了 it.each ——
 * 一个 it.each 可能展开成十几个用例，于是回退值系统性偏低，却被当成权威值去和文档比对，
 * 门禁以一条误导性的错误变红（doc 278 vs vitest 263），而文档其实是对的。
 *
 * 拿不到真实计数只有两种情况，都不该让这项比对给出结论：
 * 自己就跑在 vitest 里（再嵌套跑一次会递归），或者那次运行失败了 ——
 * 后者说明测试本来就挂了，quality 链后面的 test 步骤会红，不需要这里再报一个假原因。
 */
const runtimeTestCount = () => {
  try {
    const out = execSync('pnpm exec vitest run --reporter=json 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    })
    return JSON.parse(out.trim().split('\n').pop()).numTotalTests ?? 0
  } catch {
    return 0
  }
}

const actualTests = process.env.VITEST ? 0 : runtimeTestCount()

if (actualTests === 0) {
  console.log('[align] 未取得 vitest 实跑用例数，跳过用例数比对（测试文件数仍然校验）')
}

const testFileCount = index.testFileCount
const testCountRefs = docRefs.references.filter((r) => r.type === 'test-count')
for (const ref of testCountRefs) {
  const [files, tests] = ref.value.split('/').map(Number)
  if (files !== testFileCount) {
    pushError('test-count', {
      docFile: ref.docFile,
      line: ref.line,
      message: `test file count: doc ${files} vs actual ${testFileCount}`
    })
  }
  if (actualTests > 0 && tests !== actualTests) {
    pushError('test-count', {
      docFile: ref.docFile,
      line: ref.line,
      message: `test case count: doc ${tests} vs vitest ${actualTests}`
    })
  }
}

// ── 3. doc-claims must match test counts and symbols ──
const docClaims = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/doc-claims.json'), 'utf8'))
for (const claim of docClaims.claims) {
  if (/(\d+)\s*个?\s*测试文件/.test(claim.claim)) {
    const m = claim.claim.match(/(\d+)\s*个?\s*测试文件[、,\s]+(\d+)\s*个?\s*用例/)
    if (m) {
      const [, files, tests] = m.map(Number)
      if (files !== testFileCount) {
        pushError('doc-claim', {
          id: claim.id,
          message: `claim test files ${files} vs actual ${testFileCount}`
        })
      }
      if (actualTests > 0 && tests !== actualTests) {
        pushError('doc-claim', {
          id: claim.id,
          message: `claim test cases ${tests} vs vitest ${actualTests}`
        })
      }
    }
  }
  for (const symbol of claim.symbols) {
    let found = false
    for (const src of claim.sourceFiles) {
      if (readText(src)?.includes(symbol)) {
        found = true
        break
      }
    }
    if (!found) {
      pushError('doc-claim', {
        id: claim.id,
        message: `symbol "${symbol}" not in ${claim.sourceFiles.join(', ')}`
      })
    }
  }
}

// ── 4. Source header exports must cover all public exports ──
const HEADER_SKIP = new Set([
  'default',
  'defineNuxtConfig',
  'defineVitestConfig',
  'definePageMeta',
  'defineProps',
  'defineEmits',
  'defineModel',
  'defineSlots',
  'defineOptions',
  'BasePictureProps',
  'EditorWorkspaceProps'
])

for (const { path: rel } of manifest.sourceFiles) {
  const content = readText(rel)
  if (!content?.includes('【文件职责】')) continue

  const exports = extractExports(content, rel)
  const headerSyms = extractHeaderSymbols(content)
  const inlineBody = content.replace(/^[\s\S]*?【边界与注意】/m, '')

  for (const exp of exports) {
    if (HEADER_SKIP.has(exp)) continue
    if (exp.length <= 2) continue
    const inHeader = headerSyms.has(exp)
    const inInline =
      inlineBody.includes(exp) ||
      content.includes(`// .*${exp}`) ||
      [...content.matchAll(/\/\/[^\n]*/g)].some((m) => m[0].includes(exp))
    if (!inHeader && !inInline && exports.size > 1) {
      pushError('header-export', {
        file: rel,
        export: exp,
        message: `export "${exp}" not listed in 【主要导出】 or inline comments`
      })
    }
  }
}

// ── Report ──
const verifiable = docRefs.references.filter(
  (r) => !['path-pattern', 'external-script', 'route-template'].includes(r.type)
).length

console.log('verify-full-alignment (strict 100%)')
console.log(`doc references: ${docRefs.references.length} total, ${verifiable} verifiable`)
console.log(`source files: ${manifest.sourceFiles.length}`)
console.log(`test files: ${testFileCount}, test cases: ${actualTests || '(run vitest for count)'}`)

if (errors.length) {
  console.log(`\n✗ ${errors.length} alignment error(s):\n`)
  const grouped = {}
  for (const e of errors) {
    const k = e.category
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(e)
  }
  for (const [cat, list] of Object.entries(grouped)) {
    console.log(`[${cat}] ${list.length}`)
    for (const e of list) {
      const loc = e.docFile ? `${e.docFile}:${e.line}` : (e.file ?? e.id)
      console.log(`  ✗ ${loc} — ${e.message ?? e.export}`)
    }
  }
  process.exit(1)
}

console.log('\n✓ 100% alignment verified')
process.exit(0)
