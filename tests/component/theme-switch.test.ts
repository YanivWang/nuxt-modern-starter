// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：ThemeSwitch 的 a11y 语义与切换行为。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe ThemeSwitch

  【依赖关系】
    - 依赖：app/components/layout/ThemeSwitch.vue、app/stores/theme.ts、config/theme.ts
    - mock：无

  【渲染 / 数据】
    客户端挂载；useTheme onMounted 会读 localStorage 并写 document.dataset.theme。

  【边界与注意】
    toggleTheme 写入显式 light/dark（不保持 system），断言须同时覆盖 store 与 DOM。
*/
import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemeSwitch from '../../app/components/layout/ThemeSwitch.vue'
import { THEME_STORAGE_KEY } from '../../config/theme'
import { resetComponentTestState } from './support'

describe('ThemeSwitch', () => {
  beforeEach(async () => {
    localStorage.clear()
    await resetComponentTestState()
  })

  it('exposes switch semantics reflecting the resolved theme', async () => {
    const wrapper = await mountSuspended(ThemeSwitch)
    const button = wrapper.get('button')

    expect(button.attributes('role')).toBe('switch')
    expect(button.attributes('aria-checked')).toBe('false')
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('persists an explicit mode and syncs the document dataset on toggle', async () => {
    const wrapper = await mountSuspended(ThemeSwitch)

    await wrapper.get('button').trigger('click')

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(wrapper.get('button').attributes('aria-checked')).toBe('true')

    await wrapper.get('button').trigger('click')

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
