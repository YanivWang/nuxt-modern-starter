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
        'Nuxt Modern Starter 面向公开站点场景：营销官网、SEO 页面、多语言内容站，以及轻量 SaaS 产品前台。它预置首页、价格、帮助、新闻、登录注册，以及 `/workspace`、`/docs/:id`、`/account` 等产品区联调路径，并附带 SEO、i18n、主题切换和部署样例。',
      'en-US':
        'Nuxt Modern Starter targets public websites: marketing sites, SEO surfaces, multilingual content hubs, and lightweight SaaS frontends. It ships home, pricing, help, news, auth pages, and product routes such as `/workspace`, `/docs/:id`, and `/account`, plus SEO, i18n, theme switching, and deployment samples.'
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
        '项目提供可选 Bearer Token 鉴权示例，包含登录、注册、退出与 `/account`（用户菜单入口）。受保护产品路由通过命名 auth 中间件控制，支持角色与权限校验。与 nuxt-modern-starter-api 联调时，工作台走 app/features/workspace/api.ts，编辑器走 app/apis/editor/*。',
      'en-US':
        'The starter includes optional Bearer Token auth with sign-in, sign-up, logout, and `/account` (via the user menu). Protected product routes use the named auth middleware with role and permission checks. When paired with nuxt-modern-starter-api, workspace flows use app/features/workspace/api.ts and editor flows use app/apis/editor/*.'
    }
  },
  {
    key: 'workspace',
    question: {
      'zh-CN': '工作台与编辑器如何联调后端？',
      'en-US': 'How do workspace and editor flows connect to the backend?'
    },
    answer: {
      'zh-CN':
        '先启动 nuxt-modern-starter-api（推荐 pnpm docker:dev），保持前端 .env.dev 的 NUXT_PUBLIC_API_BASE=http://localhost:2026/api，后端 CORS_ORIGINS 包含 http://localhost:3000。登录后访问 /workspace 创建或删除项目（空白卡片或顶部按钮），再通过 /docs/:id（:id 为项目 id）加载并自动保存文档。搜索与筛选目前只是 UI，占位未接 API。',
      'en-US':
        'Start nuxt-modern-starter-api first (pnpm docker:dev recommended), keep frontend .env.dev at NUXT_PUBLIC_API_BASE=http://localhost:2026/api, and include http://localhost:3000 in backend CORS_ORIGINS. After sign-in, use /workspace to create or delete projects (blank card or primary button), then open /docs/:id (:id is the project id) to load and autosave documents. Search and filters are UI-only placeholders without backend APIs yet.'
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
        'FAQ 仍存放在 config/content/faq.ts，通过 app/apis/public/content.ts 按语言读取；新闻与定价内容从 nuxt-modern-starter-api 的 GET /api/content/news、GET /api/content/pricing 拉取。后续 FAQ 也可同样替换为 CMS 或后台 API，而页面组件无需大改。',
      'en-US':
        'FAQ still lives in config/content/faq.ts and is loaded by locale through app/apis/public/content.ts. News and pricing content come from nuxt-modern-starter-api via GET /api/content/news and GET /api/content/pricing. You can later swap FAQ to a CMS or backend API without rewriting page components.'
    }
  },
  {
    key: 'product-routes',
    question: {
      'zh-CN': '产品区路由为什么不带语言前缀？',
      'en-US': 'Why do product routes stay language-neutral without a locale prefix?'
    },
    answer: {
      'zh-CN':
        '公开 SEO 页面通过 / 与 /en 前缀区分语言，但登录后的产品区统一使用语言中性 URL，例如 /workspace 与 /docs/:id。UI 语言仍由 language store 控制；若访问 /en/workspace 等路径，locale 与 server middleware 会 301 回到无前缀 canonical。产品路由默认 CSR，sidebar 导航由 product-shell/config.ts 的 productNavItems 管理，账户入口在用户菜单。',
      'en-US':
        'Public SEO pages use / and /en prefixes, but logged-in product routes stay language-neutral, for example /workspace and /docs/:id. UI language still comes from the language store. If someone opens /en/workspace, locale and server middleware redirect to the canonical path with 301. Product routes are CSR by default; sidebar nav lives in productNavItems, and account access lives in the user menu.'
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
        '发布前建议依次执行 pnpm lint、pnpm format:check、pnpm stylelint、pnpm typecheck、pnpm test 与 pnpm build。若涉及部署变更，再补充 Docker 构建运行与 Nginx 反向代理验证，步骤可参考 docs/deployment.md。',
      'en-US':
        'Before release, run pnpm lint, pnpm format:check, pnpm stylelint, pnpm typecheck, pnpm test, and pnpm build. If deployment changed, also validate Docker build/run and the Nginx reverse proxy. See docs/deployment.md for the validation flow.'
    }
  }
]
