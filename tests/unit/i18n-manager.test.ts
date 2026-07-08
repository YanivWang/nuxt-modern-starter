import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildLocaleDiff,
  checkLocaleHealth,
  collectUsedI18nKeys,
  extractTopLevelObjectKeys,
  flattenMessages,
  normalizeLocaleMessages,
  parseReExportTarget,
  readLocaleMessages,
  scanUnusedDiffRows,
  scanUsedDiffRows
} from '../../scripts/i18n-manager-lib.mjs'

const tempDirs: string[] = []

afterEach(() => {
  tempDirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))
})

describe('i18n manager helpers', () => {
  it('flattens nested locale objects into dot-separated keys', () => {
    expect(flattenMessages({ home: { title: 'Hello' }, common: { retry: 'Retry' } })).toEqual([
      ['home.title', 'Hello'],
      ['common.retry', 'Retry']
    ])
  })

  it('parses locale re-export entries', () => {
    expect(parseReExportTarget("export { default } from '../en-US'")).toBe('../en-US')
  })

  it('extracts object keys from declarations instead of comments', () => {
    expect(
      extractTopLevelObjectKeys(
        [
          '/* SITE_LANG_MAP appears in file comments with { braces } */',
          "export const SITE_LANG_MAP = { 'en-US': { label: 'English' } } as const"
        ].join('\n'),
        'SITE_LANG_MAP'
      )
    ).toEqual(['en-US'])
  })

  it('reads module-based locales and locale aliases, then builds diffs', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-manager-'))
    tempDirs.push(root)

    fs.mkdirSync(path.join(root, 'en-US', 'modules'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' } })
    )
    fs.writeFileSync(path.join(root, 'en-US', 'index.ts'), 'export default {}\n')

    fs.mkdirSync(path.join(root, 'pt-PT'))
    fs.writeFileSync(path.join(root, 'pt-PT', 'index.ts'), "export { default } from '../en-US'\n")

    expect(readLocaleMessages(path.join(root, 'pt-PT'))).toEqual({
      global: { nav: { home: 'Home' } }
    })

    expect(normalizeLocaleMessages(readLocaleMessages(path.join(root, 'en-US')))).toEqual({
      nav: { home: 'Home' }
    })

    expect(buildLocaleDiff(root)).toEqual([
      {
        key: 'nav.home',
        'en-US': 'Home',
        'pt-PT': 'Home'
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
        "export const SITE_HREFLANG_MAP = { 'en-US': 'en' }"
      ].join('\n')
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'index.ts'),
      [
        "export const SITE_LANG_MAP = { 'en-US': { id: 'en', pathPrefix: 'en', label: 'English' } }",
        "const LOCALE_MESSAGE_RESOLVERS = { 'en-US': () => import('./en-US/index').then((module) => module.default) }"
      ].join('\n')
    )
    fs.writeFileSync(
      path.join(root, 'i18n', 'en-US', 'modules', 'global.json'),
      JSON.stringify({ nav: { home: 'Home' } })
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
})
