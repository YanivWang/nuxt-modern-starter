import type { SupportedLocale } from '../site'

export type NewsArticle = {
  slug: string
  title: Record<SupportedLocale, string>
  description: Record<SupportedLocale, string>
  body: Record<SupportedLocale, string>
  publishedAt: string
}

export const newsArticles: NewsArticle[] = [
  {
    slug: 'starter-release',
    title: {
      'zh-CN': 'Nuxt Modern Starter v0.1 发布',
      'en-US': 'Nuxt Modern Starter v0.1 is ready'
    },
    description: {
      'zh-CN': '基础骨架提供 Nuxt 4、SEO、多语言、请求与部署默认路径。',
      'en-US': 'The starter ships Nuxt 4, SEO, i18n, request helpers, and deployment defaults.'
    },
    body: {
      'zh-CN': '这个版本聚焦公开站点的最小完整闭环，适合官网、营销页、内容站和轻 SaaS 前台开局。',
      'en-US':
        'This release focuses on a complete foundation for public websites, marketing pages, content hubs, and lightweight SaaS frontends.'
    },
    publishedAt: '2026-07-04'
  },
  {
    slug: 'deployment-guide',
    title: {
      'zh-CN': '默认部署路径采用 Node server',
      'en-US': 'Node server is the default deployment path'
    },
    description: {
      'zh-CN': 'Docker 与 Nginx 样例用于验证自托管部署路径。',
      'en-US': 'Docker and Nginx examples verify the self-hosted deployment path.'
    },
    body: {
      'zh-CN':
        '生产环境变量通过容器运行时注入，镜像不复制真实 .env 文件，Nuxt 静态资源由 Nginx 配置长缓存。',
      'en-US':
        'Production environment variables are injected at runtime, real .env files are not copied into the image, and Nuxt assets receive long-cache headers in Nginx.'
    },
    publishedAt: '2026-07-04'
  }
]

export const getNewsArticle = (slug: string) =>
  newsArticles.find((article) => article.slug === slug)
