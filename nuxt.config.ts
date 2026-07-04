import { defineNuxtConfig } from 'nuxt/config'
import { prerenderRoutes, swrRouteRules } from './config/routes'

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST

export default defineNuxtConfig({
  compatibilityDate: '2026-07-04',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@ant-design-vue/nuxt',
    ...(isTest ? ['@nuxt/test-utils/module'] : []),
    '@nuxt/eslint'
  ],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    public: {
      appEnv: process.env.NUXT_APP_ENV || 'development',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  antd: {
    extractStyle: true
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  // 按路由区分渲染策略：
  // - 未单独配置的路由：默认 SSR
  // - prerenderRoutes：构建时生成静态 HTML
  // - swrRouteRules：SSR 结果缓存，并通过 stale-while-revalidate 后台刷新
  // - /editor：仅客户端渲染，因为编辑器功能依赖浏览器 API
  routeRules: {
    ...Object.fromEntries(prerenderRoutes.map((route) => [route, { prerender: true }])),
    ...Object.fromEntries(swrRouteRules.map((route) => [route, { swr: 3600 }])),
    '/editor': { ssr: false },
    '/**': {
      headers: {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'content-security-policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      }
    }
  }
})
