<template>
  <a-extract-style>
    <a-config-provider :theme="antdTheme">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>

<script setup lang="ts">
import { THEME_STORAGE_KEY } from '../config/theme'

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
</script>
