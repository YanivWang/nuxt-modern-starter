/**
 * Builds a searchable index from manifest source files, package.json, and styles.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')

export const readText = (rel) => {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) return null
  return fs.readFileSync(full, 'utf8')
}

export const fileExists = (rel) => fs.existsSync(path.join(ROOT, rel))

/** Bracket paths like [[language]]/index.vue → app/pages/[[language]]/index.vue */
export const resolveDocPath = (raw) => {
  const p = raw.replace(/^~\//, 'app/').replace(/^\.\//, '')
  if (fileExists(p)) return p
  if (p.startsWith('app/') || p.startsWith('config/') || p.startsWith('server/')) return p
  const candidates = [
    `app/pages/${p}`,
    `app/${p}`,
    `config/${p}`,
    `server/${p}`,
    `docker/${p}`,
    `tests/${p}`,
    `i18n/${p}`,
    `scripts/${p}`
  ]
  return candidates.find((c) => fileExists(c)) ?? p
}

export const extractExports = (content, rel) => {
  const names = new Set()
  if (!content) return names

  const patterns = [
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    /export\s+const\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
    /export\s+enum\s+(\w+)/g,
    /export\s+class\s+(\w+)/g
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(content))) names.add(m[1])
  }

  for (const block of content.matchAll(/export\s+\{([^}]+)\}/g)) {
    for (const part of block[1].split(',')) {
      const name = part
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim()
        .split(/\s+/)
        .pop()
      if (name && /^\w+$/.test(name)) names.add(name)
    }
  }

  if (/export\s+default/.test(content)) {
    if (rel.endsWith('.vue')) {
      const base = path.basename(rel, '.vue')
      names.add(base.replace(/^\[\[\w+\]\]/, '').replace(/^\[\.\.\.\w+\]/, '') || base)
      // PascalCase component name from filename
      const pascal = base
        .split(/[-/]/)
        .flatMap((seg) => seg.replace(/\[\[|\]\]|\[\.\.\.|\]/g, '').split(/[-_]/))
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
      if (pascal) names.add(pascal)
    } else {
      names.add('default')
    }
  }

  if (rel.endsWith('.vue')) {
    const base = path.basename(rel, '.vue')
    const kebab = base.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    if (kebab && kebab !== base) names.add(kebab)
  }

  return names
}

export const extractHeaderSection = (content, sectionName) => {
  const marker = `【${sectionName}】`
  const start = content.indexOf(marker)
  if (start < 0) return ''
  const after = content.slice(start + marker.length)
  const next = after.search(/\n\s*【/)
  return (next >= 0 ? after.slice(0, next) : after).trim()
}

export const extractHeaderSymbols = (content) => {
  const section = extractHeaderSection(content, '主要导出 / 路由')
  if (!section) return new Set()
  const symbols = new Set()
  for (const token of section.split(/[,、\n]/)) {
    const t = token.replace(/[`'"]/g, '').trim()
    if (!t || t === '无' || t.startsWith('（') || t.startsWith('(')) continue
    for (const part of t.split(/\s+/)) {
      const clean = part.replace(/[^\w$]/g, '')
      if (clean && /^[A-Za-z_$]/.test(clean)) symbols.add(clean)
    }
  }
  return symbols
}

export const buildSourceIndex = (manifest) => {
  const files = new Set(manifest.sourceFiles.map((f) => f.path))
  const exportsByFile = {}
  const allExports = new Set()
  const allSymbols = new Set()

  for (const { path: rel } of manifest.sourceFiles) {
    const content = readText(rel)
    const ex = extractExports(content ?? '', rel)
    exportsByFile[rel] = ex
    for (const name of ex) {
      allExports.add(name)
      allSymbols.add(name)
    }
    if (content) {
      for (const m of content.matchAll(/\b(?:const|function|type|interface|enum|class)\s+(\w+)/g)) {
        allSymbols.add(m[1])
      }
    }
  }

  const pkg = JSON.parse(readText('package.json'))
  const scripts = new Set(Object.keys(pkg.scripts ?? {}))
  const engines = pkg.engines ?? {}
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  const nuxtConfig = readText('nuxt.config.ts') ?? ''
  const runtimeConfigKeys = new Set()
  for (const m of nuxtConfig.matchAll(/^\s+(\w+):\s/gm)) runtimeConfigKeys.add(m[1])
  for (const m of nuxtConfig.matchAll(/process\.env\.(NUXT_[A-Z0-9_]+)/g)) {
    allSymbols.add(m[1])
  }

  const envToRuntime = {}
  for (const m of nuxtConfig.matchAll(/(\w+):\s*process\.env\.(NUXT_[A-Z0-9_]+)/g)) {
    envToRuntime[m[2]] = m[1]
  }

  const cssVars = new Set()
  const cssClasses = new Set()
  for (const rel of manifest.sourceFiles.map((f) => f.path)) {
    if (!/\.(scss|css|vue)$/.test(rel)) continue
    const content = readText(rel)
    if (!content) continue
    for (const m of content.matchAll(/--app-[a-z0-9-]+/g)) cssVars.add(m[0])
    for (const m of content.matchAll(
      /\.(app-[a-z0-9-]+|page-[a-z0-9-]+|workspace-[a-z0-9-]+|auth-[a-z0-9-]+)/g
    )) {
      cssClasses.add(`.${m[1]}`)
    }
  }

  const pageRoutes = new Set()
  const pageFiles = [...files].filter((f) => f.startsWith('app/pages/') && f.endsWith('.vue'))
  for (const pf of pageFiles) {
    const route =
      pf
        .replace(/^app\/pages\//, '/')
        .replace(/\/index\.vue$/, '')
        .replace(/\.vue$/, '')
        .replace(/\[\[\.\.\.(\w+)\]\]/g, ':$1*')
        .replace(/\[\[\.\.\.(\w+)\]/g, ':$1*')
        .replace(/\[\[(\w+)\]\]/g, ':$1')
        .replace(/\/index$/, '') || '/'
    pageRoutes.add(route.startsWith('/') ? route : `/${route}`)
  }

  const testFiles = fs
    .readdirSync(path.join(ROOT, 'tests'), { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('.test.ts'))
    .map((f) => (typeof f === 'string' && f.includes('/') ? f : `tests/${f}`))

  const routeIndex = buildRouteIndex({ pageRoutes })

  return {
    files,
    exportsByFile,
    allExports,
    allSymbols,
    scripts,
    engines,
    deps,
    runtimeConfigKeys,
    envToRuntime,
    cssVars,
    cssClasses,
    pageRoutes,
    pageFiles,
    routeIndex,
    testFileCount: testFiles.length,
    pkg
  }
}

/** All documented app routes including localized variants and param patterns. */
export const buildRouteIndex = ({ pageRoutes }) => {
  const routes = new Set(pageRoutes)
  const siteContent = readText('config/site.ts') ?? ''
  const routesContent = readText('config/routes.ts') ?? ''

  const publicPaths = [...siteContent.matchAll(/PUBLIC_PAGE_PATHS\s*=\s*\[([\s\S]*?)\]/g)].flatMap(
    (m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
  )

  for (const p of publicPaths) {
    routes.add(p)
    if (p === '/news') routes.add('/news/:slug')
  }

  for (const prefix of (() => {
    const block =
      siteContent.match(/export const SITE_LOCALE_PREFIX_MAP[\s\S]*?=\s*\{([\s\S]*?)\n\}/)?.[1] ??
      ''
    return [...new Set([...block.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]))]
  })()) {
    if (!/^[a-z][\w-]*$/i.test(prefix)) continue
    routes.add(`/${prefix}`)
    for (const p of publicPaths) {
      if (p === '/') routes.add(`/${prefix}`)
      else routes.add(`/${prefix}${p}`)
    }
    routes.add(`/${prefix}/news/:slug`)
    routes.add(`/${prefix}/sign-in`)
    routes.add(`/${prefix}/sign-up`)
    routes.add(`/${prefix}/workspace`)
    routes.add(`/${prefix}/workspace/templates`)
    routes.add(`/${prefix}/docs/:id`)
    routes.add(`/${prefix}/docs/new`)
    routes.add(`/${prefix}/account`)
  }

  routes.add('/docs/:id')
  routes.add('/docs/new')
  routes.add('/docs/*')
  routes.add('/workspace/templates')
  routes.add('/news/*')
  routes.add('/en/*')

  for (const m of routesContent.matchAll(/'(\/[^']+)'/g)) routes.add(m[1])

  return routes
}

export const isPathPattern = (value) =>
  /[<>*?]|\/\*\*|features\/\*$|features\/exports\/|<feature>|<name>|<locale>|\$\{/.test(value)

export const isExternalScript = (value) => new Set(['docker:dev']).has(value)

export const routeMatches = (value, routeIndex) => {
  const normalized = value.replace(/\/$/, '') || '/'
  if (routeIndex.has(normalized)) return true

  // Localized product paths that 301 to canonical (e.g. /en/docs/** → /docs/**)
  if (/^\/en\/(workspace|docs|account)(?:\/|$)/.test(normalized)) return true

  if (normalized.includes('*')) {
    const base = normalized.replace(/\/\*.*$/, '').replace(/\*$/, '')
    if (base === '/en' || base === '/docs' || base === '/news' || base === '/workspace') return true
    return [...routeIndex].some((r) => r.startsWith(base))
  }

  if (normalized.includes(':') || normalized.includes(':param')) {
    const pattern = normalized.replace(/:param/g, '[^/]+').replace(/:[^/]+/g, '[^/]+')
    const regex = new RegExp(`^${pattern}$`)
    if ([...routeIndex].some((r) => regex.test(r))) return true
    if (normalized.startsWith('/news/')) return routeIndex.has('/news/:slug')
    if (normalized === '/docs/:id' && routeIndex.has('/docs/new')) return true
  }

  if (normalized === '/docs/new') {
    return (
      routeIndex.has('/docs/:id') ||
      readText('app/api/workspace-project.ts')?.includes("WORKSPACE_NEW_PROJECT_ID = 'new'")
    )
  }

  return (
    readText('config/routes.ts')?.includes(`'${normalized}'`) ||
    readText('config/site.ts')?.includes(normalized) ||
    readText('config/auth.ts')?.includes(normalized)
  )
}
