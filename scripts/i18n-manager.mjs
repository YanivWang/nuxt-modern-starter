#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import {
  buildLocaleDiff,
  checkLocaleHealth,
  scanUnusedDiffRows,
  scanUsedDiffRows
} from './i18n-manager-lib.mjs'

const rootDir = process.cwd()
const i18nRoot = path.join(rootDir, 'i18n')
const diffPath = path.join(rootDir, 'scripts', 'i18n-diff.json')
const usedPath = path.join(rootDir, 'scripts', 'i18n-used.json')
const unusedPath = path.join(rootDir, 'scripts', 'i18n-unused.json')

const writeJson = (targetPath, payload) => {
  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`wrote ${path.relative(rootDir, targetPath)}`)
}

const command = process.argv[2]

if (!command || !['diff', 'scan', 'used', 'unused', 'check'].includes(command)) {
  console.log('Usage: node scripts/i18n-manager.mjs <diff|scan|used|unused|check>')
  process.exit(command ? 1 : 0)
}

if (command === 'diff') {
  const diffRows = buildLocaleDiff(i18nRoot)
  writeJson(diffPath, diffRows)
}

if (command === 'scan' || command === 'used') {
  const diffRows = buildLocaleDiff(i18nRoot)
  writeJson(diffPath, diffRows)
  const usedRows = scanUsedDiffRows(diffRows, rootDir)
  writeJson(usedPath, usedRows)
}

if (command === 'unused') {
  const diffRows = buildLocaleDiff(i18nRoot)
  writeJson(diffPath, diffRows)
  const unusedRows = scanUnusedDiffRows(diffRows, rootDir)
  writeJson(unusedPath, unusedRows)
}

if (command === 'check') {
  const result = checkLocaleHealth(rootDir)

  result.errors.forEach((error) => console.error(`error: ${error}`))
  result.warnings.forEach((warning) => console.warn(`warn: ${warning}`))
  console.log(
    `checked ${result.stats.locales?.length || 0} locales, ${result.stats.totalKeys || 0} keys`
  )

  if (!result.ok) {
    process.exit(1)
  }
}
