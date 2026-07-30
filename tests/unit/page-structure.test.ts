/*
  【文件职责】
    单测：产品页文件位置约定、页面只用 feature barrel、feature 不互相引用。

  【架构位置】
    tests/unit — 读盘静态检查，无运行时。

  【主要导出 / 路由】
    describe page directory boundaries

  【依赖关系】
    - 依赖：app/pages 产品页源码
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    产品页自动遍历；页面不得深引 feature 内部路径；feature 内部不得引用其它 feature。
*/
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../..')
const pagesRoot = resolve(projectRoot, 'app/pages')
const featuresRoot = resolve(projectRoot, 'app/features')

const listFiles = (root: string, extensions: readonly string[]) => {
  const files: string[] = []

  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        visit(fullPath)
        continue
      }

      if (extensions.some((extension) => entry.name.endsWith(extension))) {
        files.push(relative(projectRoot, fullPath).split(sep).join('/'))
      }
    }
  }

  visit(root)
  return files.sort()
}

const allPageFiles = () => listFiles(pagesRoot, ['.vue'])
const productPageFiles = () =>
  allPageFiles().filter((file) => !file.startsWith('app/pages/[[language]]/'))
const featureSourceFiles = () => listFiles(featuresRoot, ['.ts', '.vue'])

const pageDeepFeatureImportPattern =
  /from\s+['"](?:~|@)\/features\/[^/'"]+\/[^'"]+['"]|import\(\s*['"](?:~|@)\/features\/[^/'"]+\/[^'"]+['"]\s*\)/g
const relativeLayerImportPattern = /from\s+['"](?:\.\.\/)+(?:features|api|config)\//g

const getFeatureName = (file: string) => file.split('/')[2]
const crossFeatureImportPattern =
  /from\s+['"](?:~|@)\/features\/([^/'"]+)(?:\/[^'"]*)?['"]|import\(\s*['"](?:~|@)\/features\/([^/'"]+)(?:\/[^'"]*)?['"]\s*\)/g

describe('page directory boundaries', () => {
  it('keeps product pages outside localized public page routes', () => {
    expect(existsSync(resolve(projectRoot, 'app/pages/workspace/index.vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/docs/[id].vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/account.vue'))).toBe(true)
  })

  it('keeps product page imports rooted at app aliases', () => {
    for (const file of productPageFiles()) {
      const source = readFileSync(resolve(projectRoot, file), 'utf8')

      expect(source, file).not.toMatch(relativeLayerImportPattern)
    }
  })

  it('requires pages to import feature barrels instead of feature internals', () => {
    for (const file of allPageFiles()) {
      const source = readFileSync(resolve(projectRoot, file), 'utf8')

      expect(source, file).not.toMatch(pageDeepFeatureImportPattern)
    }
  })

  it('keeps feature modules from importing other feature modules', () => {
    for (const file of featureSourceFiles()) {
      const sourceFeature = getFeatureName(file)
      const source = readFileSync(resolve(projectRoot, file), 'utf8')
      const importedFeatures = [...source.matchAll(crossFeatureImportPattern)].map(
        (match) => match[1] || match[2]
      )

      expect(
        importedFeatures.filter((importedFeature) => importedFeature !== sourceFeature),
        file
      ).toEqual([])
    }
  })
})
