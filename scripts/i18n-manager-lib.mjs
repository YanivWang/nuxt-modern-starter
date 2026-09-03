/*
  【文件职责】
    i18n 治理的纯函数库：扁平化文案树、扫描源码里的键引用、比对各语言缺漏。
    与命令行外壳分离，便于在 tests/unit/i18n-manager.test.ts 里直接验证。

  【架构位置】
    scripts — 被 scripts/i18n-manager.mjs 消费。

  【主要导出 / 路由】
    DEFAULT_INCLUDE_DIRS、SOURCE_FILE_PATTERN、flattenMessages、
    buildLocaleDiff、checkLocaleHealth、scanUsedDiffRows、scanUnusedDiffRows

  【依赖关系】
    - 依赖：无（只读文件系统）
    - 被引用：scripts/i18n-manager.mjs、tests/unit/i18n-manager.test.ts

  【渲染 / 数据】
    无副作用的纯计算，调用方负责读写磁盘。

  【边界与注意】
    键的提取基于静态文本匹配，动态拼接的键（`t(`a.${b}`)`）扫不出来，
    因此 unused 结果是「疑似」而非结论，删除前需人工确认。
*/
import fs from 'node:fs'
import path from 'node:path'

// 扫描范围只含运行时源码：i18n/ 自身与 tests/ 不算「使用方」，
// 把它们算进来会让每个键都显得有人用，unused 直接失去意义。
export const DEFAULT_INCLUDE_DIRS = ['app', 'config', 'server']
export const SOURCE_FILE_PATTERN = /\.(?:vue|ts|js|mjs|cjs|mts|cts)$/

export function flattenMessages(messages, prefix = '') {
  return Object.entries(messages).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      return [[nextKey, value]]
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenMessages(value, nextKey)
    }

    return []
  })
}

export function readJsonModules(localeDir) {
  const modulesDir = path.join(localeDir, 'modules')

  if (!fs.existsSync(modulesDir)) {
    throw new Error(`Missing locale modules directory: ${modulesDir}`)
  }

  return fs
    .readdirSync(modulesDir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .reduce((acc, file) => {
      const moduleName = file.replace(/\.json$/, '')
      const modulePath = path.join(modulesDir, file)
      acc[moduleName] = JSON.parse(fs.readFileSync(modulePath, 'utf8'))
      return acc
    }, {})
}

function readBalancedBlock(source, openIndex) {
  let depth = 0
  let quote = ''
  let escaped = false

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '{') {
      depth += 1
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return source.slice(openIndex + 1, index)
      }
    }
  }

  return ''
}

function skipObjectValue(source, index) {
  let depth = 0
  let quote = ''
  let escaped = false

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '{' || char === '[' || char === '(') {
      depth += 1
      continue
    }

    if (char === '}' || char === ']' || char === ')') {
      depth -= 1
      continue
    }

    if (depth === 0 && char === ',') {
      return cursor + 1
    }
  }

  return source.length
}

function findDeclarationIndex(source, exportName) {
  const declarationPattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${exportName}\\b`)
  const match = declarationPattern.exec(source)
  return match?.index ?? -1
}

function findInitializerIndex(source, declarationIndex) {
  let quote = ''
  let escaped = false

  for (let index = declarationIndex; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '=' && source[index + 1] !== '>') {
      return index + 1
    }
  }

  return -1
}

export function extractArrayExport(source, exportName) {
  const exportIndex = findDeclarationIndex(source, exportName)
  if (exportIndex === -1) return []

  const initializerIndex = findInitializerIndex(source, exportIndex)
  if (initializerIndex === -1) return []

  const openIndex = source.indexOf('[', initializerIndex)
  const closeIndex = source.indexOf(']', openIndex)
  if (openIndex === -1 || closeIndex === -1) return []

  return [...source.slice(openIndex, closeIndex).matchAll(/['"]([^'"]+)['"]/g)].map(
    (match) => match[1]
  )
}

export function extractTopLevelObjectKeys(source, exportName) {
  const exportIndex = findDeclarationIndex(source, exportName)
  if (exportIndex === -1) return []

  const initializerIndex = findInitializerIndex(source, exportIndex)
  if (initializerIndex === -1) return []

  const openIndex = source.indexOf('{', initializerIndex)
  if (openIndex === -1) return []

  const body = readBalancedBlock(source, openIndex)
  const keys = []
  let index = 0

  while (index < body.length) {
    while (/[\s,]/.test(body[index] || '')) index += 1

    const char = body[index]
    if (!char) break

    let key
    if (char === '"' || char === "'") {
      const quote = char
      let cursor = index + 1
      while (cursor < body.length && body[cursor] !== quote) cursor += 1
      key = body.slice(index + 1, cursor)
      index = cursor + 1
    } else {
      const match = body.slice(index).match(/^[$A-Z_a-z][$\w-]*/)
      if (!match) {
        index += 1
        continue
      }
      key = match[0]
      index += key.length
    }

    while (/\s/.test(body[index] || '')) index += 1
    if (body[index] === ':') {
      keys.push(key)
      index = skipObjectValue(body, index + 1)
    }
  }

  return keys
}

export function readLocaleMessages(localeDir) {
  return readJsonModules(path.resolve(localeDir))
}

export function normalizeLocaleMessages(messagesByModule) {
  return Object.values(messagesByModule).reduce((acc, messages) => ({ ...acc, ...messages }), {})
}

export function findDuplicateLocaleKeys(localeDir) {
  const messagesByModule = readJsonModules(localeDir)
  if (!messagesByModule) return []

  const keyModules = new Map()

  Object.entries(messagesByModule).forEach(([moduleName, messages]) => {
    flattenMessages(messages).forEach(([key]) => {
      const modules = keyModules.get(key) || []
      modules.push(moduleName)
      keyModules.set(key, modules)
    })
  })

  return [...keyModules.entries()]
    .filter(([, modules]) => modules.length > 1)
    .map(([key, modules]) => ({ key, modules }))
}

export function buildLocaleDiff(i18nRoot) {
  const localeDirs = fs
    .readdirSync(i18nRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  const localeEntries = localeDirs.map((locale) => {
    const messages = normalizeLocaleMessages(readLocaleMessages(path.join(i18nRoot, locale)))
    const flatEntries = flattenMessages(messages)

    return { locale, flatEntries }
  })

  const keys = [
    ...new Set(localeEntries.flatMap(({ flatEntries }) => flatEntries.map(([key]) => key)))
  ].sort()

  return keys.map((key) => {
    const row = { key }

    localeEntries.forEach(({ locale, flatEntries }) => {
      row[locale] = flatEntries.find(([entryKey]) => entryKey === key)?.[1] || ''
    })

    return row
  })
}

export function listSourceFiles(rootDir, includeDirs = DEFAULT_INCLUDE_DIRS) {
  const pendingDirs = includeDirs
    .map((dir) => path.join(rootDir, dir))
    .filter((dir) => fs.existsSync(dir))
  const files = []

  while (pendingDirs.length) {
    const currentDir = pendingDirs.pop()
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    entries.forEach((entry) => {
      const targetPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        pendingDirs.push(targetPath)
      } else if (SOURCE_FILE_PATTERN.test(targetPath)) {
        files.push(targetPath)
      }
    })
  }

  return files
}

function addStaticKeys(source, keys) {
  const patterns = [
    /\$t\s*\(\s*['"]([^'"]+)['"]/g,
    /(?:^|[^\w$])(?:t|te)\s*\(\s*['"]([^'"]+)['"]/g,
    /\b(?:labelKey|titleKey|descriptionKey|statusMessage)\s*:\s*['"]([^'"]+)['"]/g,
    /\bgetLocaleMessage\s*\([^,]+,\s*['"]([^'"]+)['"]/g
  ]

  patterns.forEach((pattern) => {
    for (const match of source.matchAll(pattern)) {
      const key = match[1]
      if (/^[a-z][\w-]*(?:\.[\w-]+)+$/i.test(key)) {
        keys.add(key)
      }
    }
  })
}

function extractConstStringArrays(source) {
  const arrays = new Map()
  const pattern = /const\s+(\w+)\s*=\s*\[([\s\S]*?)\]\s*(?:as const)?/g

  for (const match of source.matchAll(pattern)) {
    const values = [...match[2].matchAll(/['"]([^'"]+)['"]/g)].map((valueMatch) => valueMatch[1])
    if (values.length) {
      arrays.set(match[1], values)
    }
  }

  return arrays
}

function addDynamicKeys(source, keys) {
  const arrays = extractConstStringArrays(source)
  const dynamicPattern =
    /(\w+)\.map\(\s*\(?\s*(\w+)\s*\)?\s*=>\s*(?:t|te|\$t)\s*\(\s*`([^`]*?\$\{\s*\2\s*\}[^`]*)`\s*\)/g

  for (const match of source.matchAll(dynamicPattern)) {
    const [, arrayName, itemName, template] = match
    const values = arrays.get(arrayName)
    if (!values) continue

    values.forEach((value) => {
      keys.add(template.replace(new RegExp(`\\$\\{\\s*${itemName}\\s*\\}`), value))
    })
  }
}

export function collectUsedI18nKeys(rootDir, includeDirs = DEFAULT_INCLUDE_DIRS) {
  const keys = new Set()

  listSourceFiles(rootDir, includeDirs).forEach((file) => {
    const source = fs.readFileSync(file, 'utf8')
    addStaticKeys(source, keys)
    addDynamicKeys(source, keys)
  })

  return keys
}

export function scanUsedDiffRows(diffRows, rootDir, includeDirs = DEFAULT_INCLUDE_DIRS) {
  const usedKeys = collectUsedI18nKeys(rootDir, includeDirs)
  return diffRows.filter((row) => usedKeys.has(row.key))
}

export function scanUnusedDiffRows(diffRows, rootDir, includeDirs = DEFAULT_INCLUDE_DIRS) {
  const usedKeys = collectUsedI18nKeys(rootDir, includeDirs)
  return diffRows.filter((row) => !usedKeys.has(row.key))
}

function arrayDiff(left, right) {
  return left.filter((item) => !right.includes(item))
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

function assertJsonSnapshotSync(rootDir, snapshotPath, expectedRows, errors, command) {
  if (!fs.existsSync(snapshotPath)) return

  const committedRows = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  if (JSON.stringify(committedRows) !== JSON.stringify(expectedRows)) {
    errors.push(`${path.relative(rootDir, snapshotPath)} is out of sync; run ${command}`)
  }
}

function validateLocaleEntrypoint(localeDir, locale) {
  const errors = []
  const modulesDir = path.join(localeDir, 'modules')
  if (!fs.existsSync(modulesDir)) return errors

  const moduleFiles = fs
    .readdirSync(modulesDir)
    .filter((file) => file.endsWith('.json'))
    .sort()
  const indexPath = path.join(localeDir, 'index.ts')
  const source = readIfExists(indexPath)

  if (!source) {
    errors.push(`Locale ${locale} is missing index.ts`)
    return errors
  }

  moduleFiles.forEach((file) => {
    const moduleName = file.replace(/\.json$/, '')
    const importMatch = source.match(
      new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]\\./modules/${moduleName}\\.json['"]`)
    )

    if (!importMatch) {
      errors.push(`Locale ${locale} module ${file} is not imported by index.ts`)
      return
    }

    if (!new RegExp(`\\.\\.\\.${importMatch[1]}\\b`).test(source)) {
      errors.push(`Locale ${locale} module ${file} is imported but not spread by index.ts`)
    }
  })

  return errors
}

export function checkLocaleHealth(rootDir) {
  const errors = []
  const warnings = []
  const configSitePath = path.join(rootDir, 'config', 'site.ts')
  const i18nIndexPath = path.join(rootDir, 'i18n', 'index.ts')
  const i18nRoot = path.join(rootDir, 'i18n')

  const siteSource = readIfExists(configSitePath)
  const i18nSource = readIfExists(i18nIndexPath)

  if (!siteSource) errors.push('Missing config/site.ts')
  if (!i18nSource) errors.push('Missing i18n/index.ts')
  if (!fs.existsSync(i18nRoot)) errors.push('Missing i18n directory')

  if (errors.length) {
    return { ok: false, errors, warnings, stats: {} }
  }

  const supportedLocales = extractArrayExport(siteSource, 'SUPPORTED_LOCALES').sort()
  const localeDirs = fs
    .readdirSync(i18nRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  const prefixLocales = extractTopLevelObjectKeys(siteSource, 'SITE_LOCALE_PREFIX_MAP').sort()
  const hreflangLocales = extractTopLevelObjectKeys(siteSource, 'SITE_HREFLANG_MAP').sort()
  const optionLocales = extractTopLevelObjectKeys(siteSource, 'SITE_LOCALE_OPTIONS').sort()
  const resolverLocales = extractTopLevelObjectKeys(i18nSource, 'LOCALE_MESSAGE_RESOLVERS').sort()
  const antdLocalePath = path.join(rootDir, 'config', 'antd-locale.ts')
  const antdSource = readIfExists(antdLocalePath)
  const antdLocales = antdSource
    ? extractTopLevelObjectKeys(antdSource, 'ANTD_LOCALE_LOADERS').sort()
    : []

  arrayDiff(supportedLocales, localeDirs).forEach((locale) =>
    errors.push(`Missing i18n locale directory: ${locale}`)
  )
  arrayDiff(localeDirs, supportedLocales).forEach((locale) =>
    errors.push(`Unexpected i18n locale directory: ${locale}`)
  )
  arrayDiff(supportedLocales, prefixLocales).forEach((locale) =>
    errors.push(`Missing SITE_LOCALE_PREFIX_MAP entry: ${locale}`)
  )
  arrayDiff(prefixLocales, supportedLocales).forEach((locale) =>
    errors.push(`Unexpected SITE_LOCALE_PREFIX_MAP entry: ${locale}`)
  )
  arrayDiff(supportedLocales, hreflangLocales).forEach((locale) =>
    errors.push(`Missing SITE_HREFLANG_MAP entry: ${locale}`)
  )
  arrayDiff(hreflangLocales, supportedLocales).forEach((locale) =>
    errors.push(`Unexpected SITE_HREFLANG_MAP entry: ${locale}`)
  )
  arrayDiff(supportedLocales, optionLocales).forEach((locale) =>
    errors.push(`Missing SITE_LOCALE_OPTIONS entry: ${locale}`)
  )
  arrayDiff(optionLocales, supportedLocales).forEach((locale) =>
    errors.push(`Unexpected SITE_LOCALE_OPTIONS entry: ${locale}`)
  )
  arrayDiff(supportedLocales, resolverLocales).forEach((locale) =>
    errors.push(`Missing LOCALE_MESSAGE_RESOLVERS entry: ${locale}`)
  )
  arrayDiff(resolverLocales, supportedLocales).forEach((locale) =>
    errors.push(`Unexpected LOCALE_MESSAGE_RESOLVERS entry: ${locale}`)
  )
  if (!antdSource) {
    errors.push('Missing config/antd-locale.ts')
  } else {
    arrayDiff(supportedLocales, antdLocales).forEach((locale) =>
      errors.push(`Missing ANTD_LOCALE_LOADERS entry: ${locale}`)
    )
    arrayDiff(antdLocales, supportedLocales).forEach((locale) =>
      errors.push(`Unexpected ANTD_LOCALE_LOADERS entry: ${locale}`)
    )
  }

  localeDirs.forEach((locale) => {
    errors.push(...validateLocaleEntrypoint(path.join(i18nRoot, locale), locale))
    findDuplicateLocaleKeys(path.join(i18nRoot, locale)).forEach(({ key, modules }) => {
      errors.push(`Duplicate locale key in ${locale}: ${key} (${modules.join(', ')})`)
    })
  })

  const diffRows = buildLocaleDiff(i18nRoot)
  const usedRows = scanUsedDiffRows(diffRows, rootDir)
  const unusedRows = scanUnusedDiffRows(diffRows, rootDir)
  diffRows.forEach((row) => {
    supportedLocales.forEach((locale) => {
      if (!(locale in row) || row[locale] === '') {
        errors.push(`Missing translation for ${locale}: ${row.key}`)
      }
    })
  })

  assertJsonSnapshotSync(
    rootDir,
    path.join(rootDir, 'scripts', 'i18n-diff.json'),
    diffRows,
    errors,
    'pnpm i18n:diff'
  )
  assertJsonSnapshotSync(
    rootDir,
    path.join(rootDir, 'scripts', 'i18n-used.json'),
    usedRows,
    errors,
    'pnpm i18n:scan'
  )
  assertJsonSnapshotSync(
    rootDir,
    path.join(rootDir, 'scripts', 'i18n-unused.json'),
    unusedRows,
    errors,
    'pnpm i18n:unused'
  )

  const enRows = diffRows.filter((row) => row['en-US'])
  const placeholderRatios = {}
  supportedLocales
    .filter((locale) => locale !== 'en-US')
    .forEach((locale) => {
      const sameAsEnglish = enRows.filter((row) => row[locale] === row['en-US']).length
      const ratio = enRows.length ? sameAsEnglish / enRows.length : 0
      placeholderRatios[locale] = ratio

      if (ratio === 1) {
        warnings.push(`Locale ${locale} is identical to en-US (${sameAsEnglish}/${enRows.length})`)
      }
    })

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      locales: supportedLocales,
      totalKeys: diffRows.length,
      usedKeys: usedRows.length,
      unusedKeys: unusedRows.length,
      placeholderRatios
    }
  }
}
