<!--
  【文件职责】
    应用根组件：Ant Design ConfigProvider + NuxtLayout/NuxtPage，注入 theme 防 FOUC 脚本，按需加载 AntD locale。

  【架构位置】
    共享层 — app/app.vue，全站入口 wrapper。

  【主要导出 / 路由】
    无（Nuxt 自动挂载）

  【依赖关系】
    - 依赖：useTheme、config/theme THEME_STORAGE_KEY、config/antd-locale、a-extract-style
    - 被引用：Nuxt app entry

  【渲染 / 数据】
    universal — head inline script 在 hydration 前设置 dataset.theme。

  【边界与注意】
    theme 持久化键与 useTheme / theme store 须一致。
-->
<template>
  <a-extract-style>
    <a-config-provider :theme="antdTheme" :locale="antdLocale">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>

<script setup lang="ts">
import { THEME_STORAGE_KEY } from '../config/theme'
import { loadAntdLocale } from '../config/antd-locale'

useHead({
  script: [
    {
      key: 'theme-init',
      innerHTML: `(() => { try { const saved = localStorage.getItem('${THEME_STORAGE_KEY}'); const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const mode = saved || 'system'; document.documentElement.dataset.theme = mode === 'dark' || (mode === 'system' && systemDark) ? 'dark' : 'light'; } catch {} })();`,
      tagPosition: 'head'
    }
  ]
})

const { antdTheme } = useTheme()
const languageStore = useLanguageStore()
const antdLocale = shallowRef(await loadAntdLocale(languageStore.currentLanguage))
let antdLocaleRequestId = 0

watch(
  () => languageStore.currentLanguage,
  async (locale) => {
    const requestId = ++antdLocaleRequestId
    const nextLocale = await loadAntdLocale(locale)

    if (requestId === antdLocaleRequestId) {
      antdLocale.value = nextLocale
    }
  }
)
</script>
