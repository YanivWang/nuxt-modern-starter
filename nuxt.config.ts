import { defineNuxtConfig } from 'nuxt/config'
import { prerenderRoutes, swrRouteRules } from './config/routes'

export default defineNuxtConfig({
  compatibilityDate: '2026-07-04',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@ant-design-vue/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:4000/api',
    appEnv: process.env.NUXT_APP_ENV || 'local',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    preset: 'node-server',
    devProxy: {
      '/api': {
        target: process.env.NUXT_DEV_PROXY_API || process.env.NUXT_API_BASE || 'http://localhost:4000/api',
        changeOrigin: true
      }
    }
  },
  antd: {
    extractStyle: true
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  routeRules: {
    ...Object.fromEntries(prerenderRoutes.map((route) => [route, { prerender: true }])),
    ...Object.fromEntries(swrRouteRules.map((route) => [route, { swr: 3600 }])),
    '/api/**': {
      cors: true,
      headers: {
        'cache-control': 'no-store'
      }
    }
  }
})
