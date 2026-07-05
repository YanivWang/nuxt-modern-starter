import type { SupportedLocale } from '../site'

export type FaqItem = {
  key: string
  question: Record<SupportedLocale, string>
  answer: Record<SupportedLocale, string>
}

export const faqItems: FaqItem[] = [
  {
    key: 'start',
    question: {
      'zh-CN': '如何启动 Nuxt Modern Starter？',
      'en-US': 'How do I start Nuxt Modern Starter?'
    },
    answer: {
      'zh-CN':
        '启用 Corepack 后，在项目根目录执行 pnpm install 安装依赖，再运行 pnpm dev 启动开发服务器。默认使用 .env.dev 环境层，本地可在 30 分钟内完成克隆、安装与首屏访问。',
      'en-US':
        'Enable Corepack, run pnpm install in the project root, then start the dev server with pnpm dev. The default layer is .env.dev, and the quick-start target is clone, install, and first page load within 30 minutes.'
    }
  },
  {
    key: 'scope',
    question: {
      'zh-CN': '这个项目适合用来做什么？',
      'en-US': 'What is this starter best suited for?'
    },
    answer: {
      'zh-CN':
        'Nuxt Modern Starter 面向公开站点场景：营销官网、SEO 页面、多语言内容站，以及轻量 SaaS 产品前台。它预置首页、价格、帮助、新闻、登录注册与账户页，并附带 SEO、i18n、主题切换和部署样例。',
      'en-US':
        'Nuxt Modern Starter targets public websites: marketing sites, SEO surfaces, multilingual content hubs, and lightweight SaaS frontends. It ships home, pricing, help, news, auth pages, plus SEO, i18n, theme switching, and deployment samples.'
    }
  },
  {
    key: 'i18n',
    question: {
      'zh-CN': '如何新增或调整语言？',
      'en-US': 'How do I add or adjust a language?'
    },
    answer: {
      'zh-CN':
        '在 config/site.ts 中扩展 SUPPORTED_LOCALES 与 SITE_LOCALE_PREFIX_MAP，新增 i18n/<locale>/index.ts 文案文件，并同步更新路由、SEO 与 tests/unit 下的 locale 相关测试，确保 hreflang 与语言切换链接一致。',
      'en-US':
        'Extend SUPPORTED_LOCALES and SITE_LOCALE_PREFIX_MAP in config/site.ts, add i18n/<locale>/index.ts messages, and update routing, SEO, and locale tests under tests/unit so hreflang and language switching stay consistent.'
    }
  },
  {
    key: 'auth',
    question: {
      'zh-CN': '鉴权模块如何使用？',
      'en-US': 'How does the auth module work?'
    },
    answer: {
      'zh-CN':
        '项目提供可选 Bearer Token 鉴权示例，包含登录、注册、退出与账户页。受保护路由通过命名 auth 中间件控制，支持角色与权限校验。接入真实后端时，只需替换 useApi 的目标地址与 token 存储逻辑。',
      'en-US':
        'The starter includes optional Bearer Token auth with login, register, logout, and account pages. Protected routes use the named auth middleware with role and permission checks. Connect a real backend by replacing useApi targets and token persistence.'
    }
  },
  {
    key: 'seo',
    question: {
      'zh-CN': 'SEO 能力包含哪些内容？',
      'en-US': 'What SEO capabilities are included?'
    },
    answer: {
      'zh-CN':
        'usePageSeo 为公开页生成 title、description、canonical 与 hreflang。新闻详情额外输出 Article JSON-LD。404 与受保护页可配置 noindex，OG 元数据与默认 ogImage 也可在 site 配置中集中维护。',
      'en-US':
        'usePageSeo generates title, description, canonical, and hreflang for public pages. News detail pages also emit Article JSON-LD. 404 and protected pages can use noindex, while OG metadata and the default ogImage live in site config.'
    }
  },
  {
    key: 'content',
    question: {
      'zh-CN': 'FAQ 和新闻内容如何维护？',
      'en-US': 'How are FAQ and news content maintained?'
    },
    answer: {
      'zh-CN':
        '当前内容存放在 config/content/faq.ts 与 config/content/news.ts，通过 app/apis/public/content.ts 按语言读取。这种 typed 本地数据便于 starter 开箱即用，后续可替换为 CMS、Markdown 仓库或后台 API，而页面组件无需大改。',
      'en-US':
        'Content currently lives in config/content/faq.ts and config/content/news.ts, loaded by locale through app/apis/public/content.ts. Typed local data keeps the starter self-contained, and you can later swap in a CMS, Markdown repo, or backend API without rewriting page components.'
    }
  },
  {
    key: 'deploy',
    question: {
      'zh-CN': '如何验证 Docker 与 Nginx 部署？',
      'en-US': 'How do I validate Docker and Nginx deployment?'
    },
    answer: {
      'zh-CN':
        '执行 pnpm docker:build 构建镜像，再用 pnpm docker:run 启动 Node server。Nginx 样例位于 docker/nginx/gateway.docker.conf，可将 /_nuxt/ 静态资源配置长缓存。生产环境变量应在容器运行时注入，镜像内不复制真实 .env 文件。',
      'en-US':
        'Run pnpm docker:build to build the image, then pnpm docker:run to start the Node server. The Nginx sample lives in docker/nginx/gateway.docker.conf and can long-cache /_nuxt/ assets. Inject production env vars at runtime instead of copying real .env files into the image.'
    }
  },
  {
    key: 'quality',
    question: {
      'zh-CN': '发布前建议跑哪些质量检查？',
      'en-US': 'Which quality checks should I run before release?'
    },
    answer: {
      'zh-CN':
        '完整 v0.1-core 建议依次执行 pnpm lint、pnpm format:check、pnpm stylelint、pnpm typecheck、pnpm test 与 pnpm build。若涉及部署变更，再补充 Docker 构建运行与 Nginx 反向代理验证，结果可参考 docs/verification-record.md。',
      'en-US':
        'For full v0.1-core, run pnpm lint, pnpm format:check, pnpm stylelint, pnpm typecheck, pnpm test, and pnpm build. If deployment changed, also validate Docker build/run and the Nginx reverse proxy. See docs/verification-record.md for the latest results.'
    }
  }
]
