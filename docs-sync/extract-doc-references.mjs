#!/usr/bin/env node
/**
 * Extracts all verifiable code references from documentation files.
 * Output: docs-sync/doc-references.json
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'docs-sync/doc-references.json')

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs-sync/manifest.json'), 'utf8'))

/** Intentional template / example paths — not real files */
const PATH_ALLOWLIST = new Set([
  'app/features/my-feature/',
  'app/features/my-feature/components/',
  'app/features/my-feature/composables/',
  'app/features/my-feature/stores/',
  'app/features/my-feature/api.ts',
  'app/features/my-feature/types/',
  'app/features/my-feature/constants/',
  'app/features/my-feature/utils/',
  'app/features/my-feature/index.ts'
])

const SYMBOL_ALLOWLIST = new Set([
  'SSR',
  'CSR',
  'SWR',
  'SEO',
  'API',
  'UI',
  'URL',
  'HTTP',
  'JSON',
  'HTML',
  'CSS',
  'JS',
  'TS',
  'LCP',
  'CSP',
  'FAQ',
  'CTA',
  'Docker',
  'Nginx',
  'Vitest',
  'VitePress',
  'Nuxt',
  'Vue',
  'Pinia',
  'Ant',
  'SaaS',
  'Canvas',
  'Logo',
  'Node',
  'pnpm',
  'npm',
  'Husky',
  'E2E',
  'CLI',
  'GET',
  'POST',
  'PATCH',
  'DELETE',
  'PUT',
  'true',
  'false',
  'null',
  'undefined',
  'light',
  'dark',
  'development',
  'production',
  'test',
  'default',
  'optional',
  'required',
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'Promise',
  'Error',
  'Request',
  'Response',
  'Headers',
  'Cookie',
  'localStorage',
  'sessionStorage',
  'document',
  'window',
  'import',
  'export',
  'from',
  'type',
  'interface',
  'const',
  'function',
  'async',
  'await',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'new',
  'class',
  'extends',
  'implements',
  'public',
  'private',
  'protected',
  'static',
  'readonly',
  'void',
  'never',
  'any',
  'unknown',
  'en',
  'zh',
  'zh-CN',
  'en-US',
  'id',
  'slug',
  'path',
  'name',
  'title',
  'desc',
  'key',
  'value',
  'mode',
  'data',
  'props',
  'emit',
  'ref',
  'computed',
  'watch',
  'onMounted',
  'useRoute',
  'useRouter',
  'useState',
  'useFetch',
  'useAsyncData',
  'definePageMeta',
  'defineNuxtConfig',
  'defineVitestConfig',
  'ConfigProvider',
  'script',
  'style',
  'template',
  'setup',
  'lang',
  'ts',
  'scss',
  'vue',
  'md',
  'yaml',
  'yml',
  'json',
  'png',
  'jpg',
  'webp',
  'svg',
  'ico',
  'txt',
  'xml',
  'env',
  'dev',
  'prod',
  'local',
  'remote',
  'src',
  'dest',
  'base',
  'host',
  'port',
  'http',
  'https',
  'localhost',
  'token',
  'auth',
  'user',
  'login',
  'logout',
  'register',
  'password',
  'email',
  'code',
  'status',
  'message',
  'error',
  'success',
  'loading',
  'disabled',
  'enabled',
  'active',
  'inactive',
  'open',
  'close',
  'show',
  'hide',
  'left',
  'right',
  'top',
  'bottom',
  'center',
  'start',
  'end',
  'auto',
  'none',
  'all',
  'full',
  'half',
  'sm',
  'md',
  'lg',
  'xl',
  'xs',
  'xxl',
  'xxx',
  'primary',
  'secondary',
  'brand',
  'danger',
  'warning',
  'info',
  'text',
  'link',
  'button',
  'input',
  'form',
  'table',
  'card',
  'nav',
  'header',
  'footer',
  'main',
  'aside',
  'section',
  'article',
  'div',
  'span',
  'img',
  'picture',
  'source',
  'alt',
  'href',
  'target',
  'rel',
  'meta',
  'head',
  'body',
  'html',
  'lang',
  'theme',
  'color',
  'size',
  'width',
  'height',
  'margin',
  'padding',
  'border',
  'radius',
  'shadow',
  'gradient',
  'opacity',
  'font',
  'weight',
  'line',
  'letter',
  'spacing',
  'gap',
  'flex',
  'grid',
  'block',
  'inline',
  'relative',
  'absolute',
  'fixed',
  'sticky',
  'hidden',
  'visible',
  'overflow',
  'scroll',
  'wrap',
  'nowrap',
  'row',
  'column',
  'reverse',
  'between',
  'around',
  'evenly',
  'stretch',
  'baseline',
  'items',
  'content',
  'self',
  'order',
  'grow',
  'shrink',
  'basis',
  'min',
  'max',
  'fit',
  'cover',
  'contain',
  'repeat',
  'no-repeat',
  'space',
  'round',
  'flat',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'transparent',
  'inherit',
  'initial',
  'unset',
  'important',
  'before',
  'after',
  'hover',
  'focus',
  'active',
  'visited',
  'disabled',
  'checked',
  'first',
  'last',
  'nth',
  'child',
  'of',
  'not',
  'is',
  'where',
  'has',
  'root',
  'empty',
  'target',
  'scope',
  'layer',
  'container',
  'supports',
  'media',
  'print',
  'screen',
  'only',
  'and',
  'or',
  'min',
  'max',
  'px',
  'rem',
  'em',
  'vh',
  'vw',
  'vmin',
  'vmax',
  'ch',
  'ex',
  'fr',
  'deg',
  'rad',
  'turn',
  'grad',
  'ms',
  's',
  'Hz',
  'kHz',
  'dpi',
  'dpcm',
  'dppx',
  'x',
  'y',
  'z',
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'calc',
  'clamp',
  'min',
  'max',
  'var',
  'url',
  'attr',
  'counter',
  'counters',
  'element',
  'env',
  'expression',
  'fit-content',
  'min-content',
  'max-content',
  'stretch',
  'revert',
  'revert-layer'
])

const references = []

const addRef = (docFile, line, type, value, context = '') => {
  const trimmed = value.trim()
  if (!trimmed || trimmed.endsWith(':')) return
  references.push({ docFile, line, type, value: trimmed, context: context.slice(0, 120) })
}

const classifyPath = (raw) => {
  const value = raw.trim()
  if (
    /[<>*?]|\/\*\*|\/\*$|\$\{|features\/\*$|features\/exports\/|<feature>|<name>|<locale>/.test(
      value
    )
  ) {
    return { type: 'path-pattern', value }
  }
  return { type: 'file-path', value }
}

const isLikelyCodeSymbol = (s) =>
  /^[A-Za-z_$][\w$]*$/.test(s) && s.length > 1 && !SYMBOL_ALLOWLIST.has(s) && !/^[a-z]+$/.test(s) // skip plain lowercase words

const extractFromDoc = (docFile, content) => {
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1
    const stripped = line.replace(/<!--[\s\S]*?-->/g, '')

    // File paths
    for (const m of stripped.matchAll(
      /`((?:app|config|server|docker|tests|i18n|scripts|public|docs(?:-site)?)\/[^`\s]+)`/g
    )) {
      const { type, value } = classifyPath(m[1])
      addRef(docFile, lineNum, type, value, stripped)
    }
    for (const m of stripped.matchAll(
      /`(nuxt\.config\.ts|vitest\.config\.ts|package\.json|pnpm-workspace\.yaml)`/g
    )) {
      addRef(docFile, lineNum, 'file-path', m[1], stripped)
    }
    for (const m of stripped.matchAll(/`((?:\[\[language\]\]|workspace|docs)\/[^`]+\.vue)`/g)) {
      addRef(docFile, lineNum, 'file-path', `app/pages/${m[1]}`, stripped)
    }
    for (const m of stripped.matchAll(/`(account\.vue)`/g)) {
      addRef(docFile, lineNum, 'file-path', `app/pages/${m[1]}`, stripped)
    }

    // Env vars
    for (const m of stripped.matchAll(/\b(NUXT(?:_PUBLIC)?_[A-Z0-9_]+)\b/g)) {
      addRef(docFile, lineNum, 'env-var', m[1], stripped)
    }
    for (const m of stripped.matchAll(/`(\.env(?:\.[a-z]+)?)`/g)) {
      addRef(docFile, lineNum, 'env-file', m[1], stripped)
    }

    // Scripts (skip ${...} templates and external-repo commands marked in prose)
    for (const m of stripped.matchAll(/(?:pnpm|corepack pnpm|npm run)\s+([a-z][\w:-]+)/g)) {
      if (m[1].includes('${')) continue
      const scriptType = m[1] === 'docker:dev' || m[1] === 'install' ? 'external-script' : 'script'
      addRef(docFile, lineNum, scriptType, m[1], stripped)
    }

    // Routes (backtick or table) — skip .vue paths and template literals
    for (const m of stripped.matchAll(
      /`(\/(?:workspace|docs|account|news|pricing|about|help|sign-in|sign-up|en)(?:\/[^`\s]*)?)`/g
    )) {
      const route = m[1].replace(/\/\*\*$/, '')
      if (route.includes('.vue') || route.includes('[')) continue
      if (route.includes('${')) {
        addRef(
          docFile,
          lineNum,
          'route-template',
          route.replace(/\$\{[^}]+\}/g, ':param'),
          stripped
        )
        continue
      }
      addRef(docFile, lineNum, 'route', route, stripped)
    }

    // CSS vars
    for (const m of stripped.matchAll(/`(--app-[a-z0-9-]+)`/g)) {
      addRef(docFile, lineNum, 'css-var', m[1], stripped)
    }
    for (const m of stripped.matchAll(/`(--app-[a-z0-9-]+)`/g)) {
      addRef(docFile, lineNum, 'css-var', m[1], stripped)
    }

    // CSS classes
    for (const m of stripped.matchAll(
      /`(\.(?:app|page|workspace|auth|editor|product)-[a-z0-9-]+)`/g
    )) {
      addRef(docFile, lineNum, 'css-class', m[1], stripped)
    }
    for (const m of stripped.matchAll(
      /`(\$(?:color|spacing|radius|font|shadow|layout|breakpoint|z-|line-height|letter-spacing|border|size|app)[\w-]*)`/g
    )) {
      addRef(docFile, lineNum, 'scss-var', m[1], stripped)
    }

    // Backtick symbols (code identifiers)
    for (const m of stripped.matchAll(/`([^`\n]+)`/g)) {
      const inner = m[1].trim()
      if (inner.includes('/') || inner.includes(' ') || inner.startsWith('http')) continue
      if (inner.startsWith('--') || inner.startsWith('.') || inner.startsWith('$')) continue
      if (/^\/[\w/:.-]+$/.test(inner)) continue
      if (/^[A-Z_][A-Z0-9_]+$/.test(inner)) {
        addRef(docFile, lineNum, 'symbol', inner, stripped)
      } else if (isLikelyCodeSymbol(inner)) {
        addRef(docFile, lineNum, 'symbol', inner, stripped)
      }
    }

    // Test counts like "32 文件 / 116"
    const testCount = stripped.match(
      /(\d+)\s*(?:个?\s*)?(?:测试)?文件\s*\/\s*(\d+)\s*(?:个?\s*)?(?:测试|用例)/
    )
    if (testCount) {
      addRef(docFile, lineNum, 'test-count', `${testCount[1]}/${testCount[2]}`, stripped)
    }

    // Version table rows | Node | 22.22.3 |
    const versionRow = stripped.match(
      /^\|\s*(Node|pnpm|Nuxt|vue-i18n|Vitest|ant-design-vue|@pinia\/nuxt|@ant-design-vue\/nuxt|@yanivjs\/yaniv-editor|@nuxt\/test-utils)\s*\|\s*([^|]+)\|/
    )
    if (versionRow) {
      const ver = versionRow[2].trim().replace(/`/g, '')
      if (/^[\d.]+(?:\.\d+)*$/.test(ver)) {
        addRef(docFile, lineNum, 'version', `${versionRow[1]}=${ver}`, stripped)
      }
    }
  })
}

for (const { path: docFile } of manifest.docFiles) {
  const full = path.join(ROOT, docFile)
  if (!fs.existsSync(full)) continue
  extractFromDoc(docFile, fs.readFileSync(full, 'utf8'))
}

// Dedupe
const seen = new Set()
const unique = references.filter((r) => {
  const key = `${r.docFile}:${r.type}:${r.value}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const out = {
  generatedAt: new Date().toISOString(),
  docFileCount: manifest.docFiles.length,
  referenceCount: unique.length,
  pathAllowlist: [...PATH_ALLOWLIST],
  symbolAllowlist: [...SYMBOL_ALLOWLIST],
  references: unique
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2))
console.log(`extracted ${unique.length} references from ${manifest.docFiles.length} docs`)
