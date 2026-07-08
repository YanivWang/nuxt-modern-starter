import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildLocaleDiff,
  checkLocaleHealth,
  collectUsedI18nKeys,
  extractTopLevelObjectKeys,
  findDuplicateLocaleKeys,
  flattenMessages,
  normalizeLocaleMessages,
  readLocaleMessages,
  scanUnusedDiffRows,
  scanUsedDiffRows
} from '../../scripts/i18n-manager-lib.mjs'

const tempDirs: string[] = []

afterEach(() => {
  tempDirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))
})

const writeAntdLocaleConfig = (root: string, locales: string[]) => {
  fs.writeFileSync(
    path.join(root, 'config', 'antd-locale.ts'),
    [
      'const ANTD_LOCALE_LOADERS = {',
      ...locales.map(
        (locale) =>
          `  '${locale}': () => import('ant-design-vue/es/locale/en_US').then((module) => module.default)`
      ),
      '}'
    ].join('\n')
  )
}

describe('i18n manager helpers', () => {
  it('flattens nested locale objects into dot-separated keys', () => {
    expect(flattenMessages({ home: { title: 'Hello' }, common: { retry: 'Retry' } })).toEqual([
      ['home.title', 'Hello'],
      ['common.retry', 'Retry']
    ])
  })

  it('extracts object keys from declarations instead of comments', () => {
    expect(
      extractTopLevelObjectKeys(
        [
          '/* SITE_LOCALE_OPTIONS appears in file comments with { braces } */',
          "export const SITE_LOCALE_OPTIONS = { 'en-US': { label: 'English' } } as const"
        ].join('\n'),
        'SITE_LOCALE_OPTIONS'
      )
    ).toEqual(['en-US'])
  })

  it('extracts object keys from typed declarations after the assignment', () => {
    expect(
      extractTopLevelObjectKeys(
        [
          'export const SITE_LOCALE_OPTIONS: Record<SupportedLocale, { id: string; label: string }> = {',
          "  'en-US': { id: 'en', label: 'English' }",
          '}'
        ].join('\n'),
        'SITE_LOCALE_OPTIONS'
      )
    ).toEqual(['en-US'])
  })

  it('reads module-based locales, then builds diffs', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-manager-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'en-US', 'modules'), { recursive: true })
    fs.mkdirSync(path.join(root, 'pt-PT', 'modules'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' } })
    )
    fs.writeFileSync(
      path.join(root, 'pt-PT', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Início' } })
    )

    expect(readLocaleMessages(path.join(root, 'en-US'))).toEqual({
      global: { nav: { home: 'Home' } }
    })

    expect(normalizeLocaleMessages(readLocaleMessages(path.join(root, 'en-US')))).toEqual({
      nav: { home: 'Home' }
    })

    expect(buildLocaleDiff(root)).toEqual([
      {
        key: 'nav.home',
        'en-US': 'Home',
        'pt-PT': 'Início'
      }
    ])
  })

  it('detects static and common dynamic i18n key usage', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-scan-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'app', 'pages'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'app', 'pages', 'about.vue'),
      [
        "const valueKeys = ['focus', 'quality'] as const",
        'const values = computed(() => valueKeys.map((key) => t(`about.values.items.${key}`)))',
        "const nav = { labelKey: 'nav.home' }",
        "<template>{{ $t('common.retry') }}</template>"
      ].join('\n')
    )

    const rows = [
      { key: 'about.values.items.focus', 'en-US': 'Focus' },
      { key: 'about.values.items.quality', 'en-US': 'Quality' },
      { key: 'nav.home', 'en-US': 'Home' },
      { key: 'common.retry', 'en-US': 'Retry' },
      { key: 'unused.key', 'en-US': 'Unused' }
    ]

    expect([...collectUsedI18nKeys(root)].sort()).toEqual([
      'about.values.items.focus',
      'about.values.items.quality',
      'common.retry',
      'nav.home'
    ])
    expect(scanUsedDiffRows(rows, root).map((row) => row.key)).toEqual([
      'about.values.items.focus',
      'about.values.items.quality',
      'nav.home',
      'common.retry'
    ])
    expect(scanUnusedDiffRows(rows, root).map((row) => row.key)).toEqual(['unused.key'])
  })

  it('checks locale config, registered resolvers, modules, and committed snapshots', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-check-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'config'), { recursive: true })
    fs.mkdirSync(path.join(root, 'i18n', 'en-US', 'modules'), { recursive: true })
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'config', 'site.ts'),
      [
        "export const SUPPORTED_LOCALES = ['en-US'] as const",
        "export const SITE_LOCALE_PREFIX_MAP = { 'en-US': 'en' }",
        "export const SITE_HREFLANG_MAP = { 'en-US': 'en' }",
        "export const SITE_LOCALE_OPTIONS = { 'en-US': { id: 'en', label: 'English' } }"
      ].join('\n')
    )
    writeAntdLocaleConfig(root, ['en-US'])
    fs.writeFileSync(
      path.join(root, 'i18n', 'index.ts'),
      [
        "const LOCALE_MESSAGE_RESOLVERS = { 'en-US': () => import('./en-US/index').then((module) => module.default) }"
      ].join('\n')
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' }, common: { retry: 'Retry' } })
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'index.ts'),
      ["import global from './modules/global.json'", 'export default {', '  ...global', '}'].join(
        '\n'
      )
    )
    fs.writeFileSync(
      path.join(root, 'scripts', 'i18n-diff.json'),
      `${JSON.stringify(buildLocaleDiff(path.join(root, 'i18n')), null, 2)}\n`
    )

    expect(checkLocaleHealth(root).ok).toBe(true)

    fs.mkdirSync(path.join(root, 'i18n', 'fr-FR', 'modules'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'i18n', 'fr-FR', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Accueil' } })
    )
    fs.writeFileSync(path.join(root, 'i18n', 'fr-FR', 'index.ts'), 'export default {}\n')

    const result = checkLocaleHealth(root)
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Unexpected i18n locale directory: fr-FR')
    expect(result.errors).toContain('Locale fr-FR module global.json is not imported by index.ts')
  })

  it('rejects stale locale metadata that is not backed by supported locales', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-metadata-check-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'config'), { recursive: true })
    fs.mkdirSync(path.join(root, 'i18n', 'en-US', 'modules'), { recursive: true })
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'config', 'site.ts'),
      [
        "export const SUPPORTED_LOCALES = ['en-US'] as const",
        "export const SITE_LOCALE_PREFIX_MAP = { 'en-US': 'en', 'fr-FR': 'fr' }",
        "export const SITE_HREFLANG_MAP = { 'en-US': 'en' }",
        "export const SITE_LOCALE_OPTIONS = { 'en-US': { id: 'en', label: 'English' }, 'fr-FR': { id: 'fr', label: 'Français' } }"
      ].join('\n')
    )
    writeAntdLocaleConfig(root, ['en-US', 'fr-FR'])
    fs.writeFileSync(
      path.join(root, 'i18n', 'index.ts'),
      [
        "const LOCALE_MESSAGE_RESOLVERS = { 'en-US': () => import('./en-US/index').then((module) => module.default), 'fr-FR': () => import('./fr-FR/index').then((module) => module.default) }"
      ].join('\n')
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' }, common: { retry: 'Retry' } })
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'index.ts'),
      ["import global from './modules/global.json'", 'export default {', '  ...global', '}'].join(
        '\n'
      )
    )
    fs.writeFileSync(
      path.join(root, 'scripts', 'i18n-diff.json'),
      `${JSON.stringify(buildLocaleDiff(path.join(root, 'i18n')), null, 2)}\n`
    )

    const result = checkLocaleHealth(root)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Unexpected SITE_LOCALE_PREFIX_MAP entry: fr-FR')
    expect(result.errors).toContain('Unexpected SITE_LOCALE_OPTIONS entry: fr-FR')
    expect(result.errors).toContain('Unexpected LOCALE_MESSAGE_RESOLVERS entry: fr-FR')
  })

  it('detects duplicate flattened keys across locale modules', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-duplicate-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'en-US', 'modules'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' } })
    )
    fs.writeFileSync(
      path.join(root, 'en-US', 'modules', 'marketing.json'),
      JSON.stringify({ nav: { home: 'Marketing Home' } })
    )

    expect(findDuplicateLocaleKeys(path.join(root, 'en-US'))).toEqual([
      { key: 'nav.home', modules: ['global', 'marketing'] }
    ])
  })

  it('checks AntD locale metadata and used/unused snapshots', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-snapshot-check-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'config'), { recursive: true })
    fs.mkdirSync(path.join(root, 'i18n', 'en-US', 'modules'), { recursive: true })
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
    fs.mkdirSync(path.join(root, 'app'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'config', 'site.ts'),
      [
        "export const SUPPORTED_LOCALES = ['en-US'] as const",
        "export const SITE_LOCALE_PREFIX_MAP = { 'en-US': 'en' }",
        "export const SITE_HREFLANG_MAP = { 'en-US': 'en' }",
        "export const SITE_LOCALE_OPTIONS = { 'en-US': { id: 'en', label: 'English' } }"
      ].join('\n')
    )
    writeAntdLocaleConfig(root, [])
    fs.writeFileSync(
      path.join(root, 'i18n', 'index.ts'),
      [
        "const LOCALE_MESSAGE_RESOLVERS = { 'en-US': () => import('./en-US/index').then((module) => module.default) }"
      ].join('\n')
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' }, common: { retry: 'Retry' } })
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'index.ts'),
      ["import global from './modules/global.json'", 'export default {', '  ...global', '}'].join(
        '\n'
      )
    )
    const diffRows = buildLocaleDiff(path.join(root, 'i18n'))
    fs.writeFileSync(
      path.join(root, 'scripts', 'i18n-diff.json'),
      `${JSON.stringify(diffRows, null, 2)}\n`
    )
    fs.writeFileSync(path.join(root, 'scripts', 'i18n-used.json'), '[]\n')
    fs.writeFileSync(path.join(root, 'scripts', 'i18n-unused.json'), '[]\n')
    fs.writeFileSync(
      path.join(root, 'app', 'page.vue'),
      "<template>{{ $t('nav.home') }}</template>"
    )

    const result = checkLocaleHealth(root)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Missing ANTD_LOCALE_LOADERS entry: en-US')
    expect(result.errors).toContain('scripts/i18n-used.json is out of sync; run pnpm i18n:scan')
    expect(result.errors).toContain('scripts/i18n-unused.json is out of sync; run pnpm i18n:unused')
  })
})
