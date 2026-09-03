/*
  【文件职责】
    帮助页 FAQ 静态内容单一来源：多语言 question / answer 对，按 locale 过滤后返回。
    后续可替换为 CMS 或后台 API，页面通过 app/api/public.ts 消费，组件无需大改。

  【架构位置】
    config/content — 公开 SEO 区静态内容；独立于 i18n 文案包（独立内容域）。

  【主要导出 / 路由】
    FaqItem、LocalizedContent、faqItems、resolveLocalizedContent

  【依赖关系】
    - 依赖：config/site.ts（SupportedLocale 类型）
    - 被引用：app/api/public.ts（getFaqItems）、app/pages/[[language]]/help.vue

  【渲染 / 数据】
    帮助页 SSR；getFaqItems(currentLanguage) 本地读取，不经远程 API。

  【边界与注意】
    新增 FAQ 条目只需扩展 faqItems；每条至少提供 zh-CN 与 en-US，其余语言可按需补译。
*/
import { DEFAULT_LOCALE, type SupportedLocale } from '../site'

/** 至少提供 zh-CN / en-US；其余 locale 可后续补译，读取时回退到 en-US → zh-CN */
export type LocalizedContent = Partial<Record<SupportedLocale, string>> & {
  'zh-CN': string
  'en-US': string
}

export type FaqItem = {
  key: string
  question: LocalizedContent
  answer: LocalizedContent
}

export const resolveLocalizedContent = (content: LocalizedContent, locale: SupportedLocale) =>
  content[locale] ?? content['en-US'] ?? content[DEFAULT_LOCALE]

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
        'Nuxt Modern Starter 是一个通用 SaaS 前端基座，基于 Nuxt 4 提供公开官网、SEO、多语言、登录注册、用户工作台、项目管理、账号中心、编辑器流程、请求层、主题系统和部署样例。它不绑定具体业务形态，适合在此基础上扩展 AI 应用、内容工具、生产力工具、创作者工具或轻量业务系统。',
      'en-US':
        'Nuxt Modern Starter is a general-purpose SaaS frontend foundation built on Nuxt 4. It provides a public website, SEO, i18n, sign-in/sign-up, user workspace, project management, account center, editor workflow, request layer, theme system, and deployment samples. It is not tied to one business domain, and can be extended into AI apps, content tools, productivity products, creator tools, or lightweight business systems.'
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
        '在 config/site.ts 中扩展 SUPPORTED_LOCALES、SITE_LOCALE_PREFIX_MAP、SITE_HREFLANG_MAP 与 SITE_LOCALE_OPTIONS（后两者是按 locale 穷举的映射，漏改会类型报错），新增 i18n/<locale>/modules/*.json 与 index.ts 并在 i18n/index.ts 注册 resolver，再补 config/antd-locale.ts 的语言包映射，最后运行 pnpm i18n:check 并更新 tests/unit 下的 locale 相关测试，确保 hreflang 与语言切换链接一致。',
      'en-US':
        'Extend SUPPORTED_LOCALES, SITE_LOCALE_PREFIX_MAP, SITE_HREFLANG_MAP, and SITE_LOCALE_OPTIONS in config/site.ts (the last two are exhaustive per-locale maps, so missing one is a type error), add i18n/<locale>/modules/*.json plus index.ts and register the resolver in i18n/index.ts, map the Ant Design locale in config/antd-locale.ts, then run pnpm i18n:check and update the locale tests under tests/unit so hreflang and language switching stay consistent.'
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
        '项目提供可选 Bearer Token 鉴权示例，包含登录、注册、退出与 `/account`（用户菜单入口，独立 account layout）。受保护产品路由通过命名 auth 中间件控制，支持角色与权限校验；登录 redirect 使用 resolveSafeRedirectPath() 防止开放重定向。与 nuxt-modern-starter-api 联调时，工作台项目 API 走 app/api/workspace-project.ts（跨 feature 共享），编辑器文档 API 走 app/features/editor/api.ts。',
      'en-US':
        'The starter includes optional Bearer Token auth with sign-in, sign-up, logout, and `/account` (via the user menu, using a dedicated account layout). Protected product routes use the named auth middleware with role and permission checks; login redirect uses resolveSafeRedirectPath() to block open redirects. When paired with nuxt-modern-starter-api, workspace project requests use app/api/workspace-project.ts (shared across features) and editor document requests use app/features/editor/api.ts.'
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
        '先在 nuxt-modern-starter-api 后端仓库启动 Docker 栈（常见命令 pnpm docker:dev），保持前端 .env.dev 的 NUXT_PUBLIC_API_BASE=http://localhost:2027/api/v1，后端 CORS_ORIGINS 包含 http://localhost:3000。登录后访问 /workspace，通过顶部「创建项目」按钮进入 /docs/new，或点击已有项目卡片打开 /docs/:id 并自动保存文档；也可删除项目刷新列表。',
      'en-US':
        'Start the nuxt-modern-starter-api backend stack first (commonly pnpm docker:dev in that repo), keep frontend .env.dev at NUXT_PUBLIC_API_BASE=http://localhost:2027/api/v1, and include http://localhost:3000 in backend CORS_ORIGINS. After sign-in, open /workspace, use the primary Create button to enter /docs/new, or open an existing project card at /docs/:id for autosave; you can also delete projects from the list.'
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
        'usePageSeo 为公开页生成 title、description、canonical、hreflang、Open Graph 与 Twitter Card。og:title 与 twitter:title 共用 resolved title（含站点名后缀）。新闻详情额外输出 Article JSON-LD 并将 og:type 设为 article。首页可通过 webPage 与 includeOrganization 输出 WebPage / Organization JSON-LD；WebSite JSON-LD 仍为后续扩展项。404 与受保护页可配置 noindex，默认 ogImage 位于 public/og-default.png。',
      'en-US':
        'usePageSeo generates title, description, canonical, hreflang, Open Graph, and Twitter Card metadata for public pages. og:title and twitter:title share the resolved title with the site-name suffix. News detail pages also emit Article JSON-LD and set og:type to article. The home page can opt into WebPage and Organization JSON-LD; WebSite JSON-LD remains a future addition. 404 and protected pages can use noindex, and the default ogImage lives at public/og-default.png.'
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
        'FAQ 仍存放在 config/content/faq.ts，通过 app/api/public.ts 按语言读取；新闻与定价内容从 nuxt-modern-starter-api 的 GET /api/v1/content/news、GET /api/v1/content/pricing 拉取。后续 FAQ 也可同样替换为 CMS 或后台 API，而页面组件无需大改。',
      'en-US':
        'FAQ still lives in config/content/faq.ts and is loaded by locale through app/api/public.ts. News and pricing content come from nuxt-modern-starter-api via GET /api/v1/content/news and GET /api/v1/content/pricing. You can later swap FAQ to a CMS or backend API without rewriting page components.'
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
        '公开 SEO 页面通过 / 与 /en 前缀区分语言，但登录后的产品区统一使用语言中性 URL，例如 /workspace 与 /docs/:id。UI 语言仍由 language store 控制；若访问 /en/workspace 等路径，locale 与 server middleware 会 301 回到无前缀 canonical。产品路由默认 CSR；工作台与模板页使用 product layout 和 product-shell 侧边栏，/account 使用 account layout，账户入口在用户菜单。',
      'en-US':
        'Public SEO pages use / and /en prefixes, but logged-in product routes stay language-neutral, for example /workspace and /docs/:id. UI language still comes from the language store. If someone opens /en/workspace, locale and server middleware redirect to the canonical path with 301. Product routes are CSR by default; workspace and templates use the product layout and product-shell sidebar, /account uses the account layout, and account access lives in the user menu.'
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
        '发布或部署前运行 pnpm quality。该命令依次执行 lint、format:check、stylelint、typecheck、i18n:check、depcruise、contract:check、docs:sync:check、build 与 test —— build 排在 test 之前，产物体积相关的测试才能读到最新的 .output。日常提交只由 Husky pre-commit 跑 lint-staged（对暂存文件执行 prettier 与 eslint），全量门禁交给 CI。若涉及部署变更，再补充 Docker 构建运行与 Nginx 反向代理验证，步骤可参考 docs/deployment.md。',
      'en-US':
        'Run pnpm quality before release or deployment. It executes lint, format:check, stylelint, typecheck, i18n:check, depcruise, contract:check, docs:sync:check, build, and test - build runs before test so output-budget tests can inspect the latest .output. Day-to-day commits only run lint-staged via the Husky pre-commit hook (prettier and eslint on staged files); the full gate belongs to CI. If deployment changed, also validate Docker build/run and the Nginx reverse proxy. See docs/deployment.md for the validation flow.'
    }
  }
]
