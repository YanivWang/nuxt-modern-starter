/*
  【文件职责】
    Nuxt 主配置：modules、runtimeConfig.public、routeRules（prerender/SWR/CSR）、CSP headers。
    routeRules 数据来自 config/routes.ts 单一来源。

  【架构位置】
    根配置 — 构建与 SSR/CSR 策略入口。

  【主要导出 / 路由】
    defineNuxtConfig default export

  【依赖关系】
    - 依赖：config/routes.ts（prerenderRoutes、swrRouteRules、csrRouteRules）
    - 被引用：Nuxt CLI、Docker build、tests/nuxt/smoke

  【渲染 / 数据】
    prerender / SWR 3600s / 产品区 ssr:false；/** CSP 含 script-src（启用 analytics 需放宽）。
    css 挂载 ~/assets/styles/main.scss；vite 向 SFC 注入 tokens/_variables.scss。

  【边界与注意】
    测试环境追加 @nuxt/test-utils/module；修改 routeRules 须同步 config/routes 与单测。
*/
import { defineNuxtConfig } from 'nuxt/config'
import { csrRouteRules, prerenderRoutes, swrRouteRules } from './config/routes'

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
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/tokens/variables" as *;'
        }
      }
    }
  },
  runtimeConfig: {
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET || '',
    public: {
      appEnv: process.env.NUXT_APP_ENV || 'development',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:2026/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      googleSiteVerification: process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      baiduSiteVerification: process.env.NUXT_PUBLIC_BAIDU_SITE_VERIFICATION || '',
      analyticsEnabled: process.env.NUXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      analyticsScriptSrc: process.env.NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC || '',
      analyticsDeferMs: (() => {
        const parsed = Number(process.env.NUXT_PUBLIC_ANALYTICS_DEFER_MS)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3000
      })()
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
  // - csrRouteRules：登录后的产品区仅客户端渲染，适合编辑器、账户中心等强交互页面
  routeRules: {
    ...Object.fromEntries(prerenderRoutes.map((route) => [route, { prerender: true }])),
    ...Object.fromEntries(swrRouteRules.map((route) => [route, { swr: 3600 }])),
    ...Object.fromEntries(csrRouteRules.map((route) => [route, { ssr: false }])),
    '/**': {
      headers: {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'content-security-policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://localhost:* http://127.0.0.1:*; media-src 'self' https: http://localhost:* http://127.0.0.1:* blob:; font-src 'self' data:; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      }
    }
  }
})
