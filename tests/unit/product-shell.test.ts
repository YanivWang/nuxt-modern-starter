/*
  【文件职责】
    单测：product-shell config 侧栏 path 与 labelKey 约定。

  【架构位置】
    tests/unit — feature config 静态断言。

  【主要导出 / 路由】
    describe product shell configuration

  【依赖关系】
    - 依赖：app/features/product-shell/config.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 ProductShell 组件渲染；修改 productNavItems 须同步。
*/
import { describe, expect, it } from 'vitest'
import { productFooterNavItems, productNavItems } from '../../app/features/product-shell'

describe('product shell configuration', () => {
  it('centralizes product navigation entries', () => {
    expect(productNavItems.map((item) => item.path)).toEqual(['/workspace', '/workspace/templates'])
    expect(productFooterNavItems.map((item) => item.path)).toEqual(['/pricing'])
  })

  it('uses productNav label keys for sidebar and footer items', () => {
    for (const item of [...productNavItems, ...productFooterNavItems]) {
      expect(item.labelKey.startsWith('productNav.')).toBe(true)
      expect(item.icon.length).toBeGreaterThan(0)
    }
  })
})
