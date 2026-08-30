// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：LanguageSwitcher 选项渲染与切换后 store / URL 行为。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe LanguageSwitcher

  【依赖关系】
    - 依赖：app/components/layout/LanguageSwitcher.vue、LanguageOptionList.vue、
      app/composables/useLanguageSwitch.ts、app/stores/language.ts
    - mock：无（用真实 store 与真实 router）

  【渲染 / 数据】
    客户端挂载；选项来自 config/site.ts SUPPORTED_LOCALES。

  【边界与注意】
    切换语言必须同时改 store 与（公开页）URL；产品区 URL 不变的分支由 locale-path 单测覆盖。
*/
import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LanguageSwitcher from '../../app/components/layout/LanguageSwitcher.vue'
import { SITE_LOCALE_OPTIONS, SUPPORTED_LOCALES } from '../../config/site'
import { resetComponentTestState } from './support'

describe('LanguageSwitcher', () => {
  beforeEach(resetComponentTestState)

  it('lists every supported locale with its native label', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)
    const labels = wrapper.findAll('.language-option-list__label').map((node) => node.text())

    expect(labels).toEqual(SUPPORTED_LOCALES.map((locale) => SITE_LOCALE_OPTIONS[locale].label))
  })

  it('marks the active locale for assistive technology', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)
    const active = wrapper.findAll('[aria-current="true"]')

    expect(active).toHaveLength(1)
    expect(active[0]?.text()).toContain(SITE_LOCALE_OPTIONS['zh-CN'].label)
  })

  it('switches the UI locale when an option is chosen', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)
    const languageStore = useLanguageStore()
    const englishIndex = SUPPORTED_LOCALES.indexOf('en-US')

    await wrapper.findAll('.language-option-list__item')[englishIndex]?.trigger('click')

    expect(languageStore.currentLanguage).toBe('en-US')
  })

  it('exposes menu semantics on the trigger and the panel', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)

    expect(wrapper.get('.language-switcher__trigger').attributes('aria-haspopup')).toBe('menu')
    expect(wrapper.get('.language-option-list').attributes('role')).toBe('menu')
  })
})
