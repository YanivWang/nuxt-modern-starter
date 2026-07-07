/*
  【文件职责】
    单测：产品页文件位置约定与 import 须用 ~/features、~/api alias。

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
    不覆盖公开 [[language]] 页；仅断言路径与 import 风格。
*/
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../..')
const productPageFiles = [
  'app/pages/account.vue',
  'app/pages/docs/[id].vue',
  'app/pages/workspace/index.vue',
  'app/pages/workspace/templates/index.vue'
]

describe('page directory boundaries', () => {
  it('keeps product pages outside localized public page routes', () => {
    expect(existsSync(resolve(projectRoot, 'app/pages/workspace/index.vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/docs/[id].vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/account.vue'))).toBe(true)
  })

  it('keeps product page imports rooted at the app aliases', () => {
    for (const file of productPageFiles) {
      const source = readFileSync(resolve(projectRoot, file), 'utf8')

      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+(?:features|api)\//)
      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+config\//)
    }
  })
})
