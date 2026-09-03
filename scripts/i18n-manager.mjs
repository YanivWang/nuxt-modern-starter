#!/usr/bin/env node
/*
  【文件职责】
    i18n 文案治理命令行：check（各语言键一致性）、scan（提取代码里用到的键）、
    unused（找出没人用的键）、diff（生成跨语言缺漏表）。

  【架构位置】
    scripts — 由 package.json 的 i18n:* 命令调用；check 接在 pnpm quality 链上。

  【主要导出 / 路由】
    无（可执行脚本）；子命令 check / scan / unused / diff。

  【依赖关系】
    - 依赖：scripts/i18n-manager-lib.mjs、i18n/<locale>/modules/*.json
    - 被引用：package.json i18n:check / i18n:scan / i18n:unused / i18n:diff、CI static job

  【渲染 / 数据】
    只读文案文件并写出 scripts/i18n-*.json 快照，不触碰运行时。

  【边界与注意】
    check 同时校验快照是否过期：改了文案却没重跑 scan/unused 会失败，
    避免快照悄悄落后于真实用法。
*/
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
  // scan 每次都先重算 diff 再算 used：两份快照必须出自同一次读盘。
  // 分开跑的话，中间任何一次文案改动都会让 used 与 diff 对应不上，
  // 而 check 正是拿它们互相比对来判断快照是否过期。
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
