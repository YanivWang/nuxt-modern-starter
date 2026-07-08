/*
  【文件职责】
    简体中文 UI 文案包：nav、brand、auth、home、editor、workspace、about、help、news、error 等域。
    与 i18n/en-US/index.ts 结构镜像，由 i18n/index.ts 按需加载。

  【架构位置】
    i18n 层 — 默认 locale 文案，构建时同步打入 bundle。

  【主要导出 / 路由】
    default export（vue-i18n messages 对象）

  【依赖关系】
    - 依赖：无
    - 被引用：i18n/index.ts（LOCALE_LANGUAGE_MODULES['zh-CN']）

  【渲染 / 数据】
    无 — 纯静态文案；禁止逐 key 行内注释。

  【边界与注意】
    新增文案域时须同步 en-US/index.ts；key 命名与页面 / feature 模块对齐。
*/
export default {
  nav: {
    home: '首页',
    pricing: '价格',
    about: '关于我们',
    help: '帮助',
    news: '新闻',
    primary: '主导航'
  },
  brand: {
    tagline: '面向公开站点的现代 Nuxt 基础骨架'
  },
  seo: {
    defaultDescription: '面向营销站点、SEO 页面与轻量 SaaS 前台的 Nuxt 4 可复用 starter。'
  },
  common: {
    switchLanguage: '切换语言',
    switchTheme: '切换主题',
    readMore: '阅读更多',
    backHome: '返回首页',
    error: '操作失败，请稍后重试',
    loadFailed: '加载失败，请稍后重试',
    retry: '重试'
  },
  productNav: {
    workspace: '工作台',
    themeTemplates: '主题模版',
    pricing: '定价'
  },
  userMenu: {
    account: '账户',
    language: '语言',
    signOut: '退出登录'
  },
  accountNav: {
    settings: '账户设置'
  },
  templates: {
    empty: '主题模版即将上线，敬请期待。'
  },
  auth: {
    header: {
      signIn: '登录',
      signUp: '注册',
      enterWorkspace: '进入工作台'
    },
    form: {
      username: '用户名',
      password: '密码',
      confirmPassword: '确认密码'
    },
    login: {
      title: '登录',
      submit: '登录',
      success: '登录成功',
      noAccount: '还没有账户？'
    },
    register: {
      title: '注册',
      submit: '注册',
      success: '注册成功，请继续登录',
      hasAccount: '已有账户？'
    },
    logout: {
      submit: '退出登录',
      success: '已退出登录'
    },
    account: {
      eyebrow: '受保护页面',
      title: '账户',
      lead: '此页面通过命名 auth 中间件保护，展示当前登录用户和扩展资料。',
      avatar: '头像',
      sessionTitle: '登录态',
      profileTitle: '扩展资料',
      userId: '用户 ID',
      nickname: '昵称',
      roles: '角色',
      permissions: '权限',
      none: '暂无',
      emptyProfile: '暂无扩展资料'
    },
    validation: {
      usernameRequired: '请输入用户名',
      passwordRequired: '请输入密码',
      confirmPasswordRequired: '请再次输入密码',
      passwordMin: '密码至少需要 6 个字符',
      passwordMismatch: '两次输入的密码不一致'
    },
    errors: {
      loginFailed: '登录失败，请检查用户名或密码',
      registerFailed: '注册失败，请稍后重试',
      unauthorized: '未登录或无效登录凭证'
    }
  },
  home: {
    eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
    title: '面向公开站点的现代 Nuxt 基础骨架',
    lead: 'Nuxt Modern Starter 把营销首页、登录注册、多语言内容、SEO 路由和 Docker/Nginx 部署配置整合进同一套清爽起点。无论你是搭建 SaaS 官网、产品前台还是内容型公开站，都可以从这里快速起步，再按业务逐步替换内容与后端能力。',
    primaryCta: '开始搭建',
    secondaryCta: '查看价格示例',
    preview: {
      metricLabel: '模板覆盖',
      metricValue: '12+ 页面'
    },
    stats: {
      pages: {
        value: '12+',
        label: '可复用页面与内容路由'
      },
      modules: {
        value: '6',
        label: '开箱即用的核心工程模块'
      },
      deploy: {
        value: '4 种',
        label: '按路由分层的混合渲染策略'
      }
    },
    featuresEyebrow: 'Nuxt 4 强力驱动',
    featuresTitle: '把公开站点常见能力一次整理好',
    featuresLead:
      '参考 Nuxt SaaS Template 的信息层级，用更完整的功能卡片承接首屏，让页面从“示例”更像可直接发布的产品站。',
    features: {
      design: {
        title: '统一设计系统',
        description: '基于 Ant Design Vue 和本地主题 token，亮暗色、圆角、阴影和间距可以集中调整。'
      },
      i18n: {
        title: '多语言路由',
        description: '内置语言前缀、语言切换和本地化链接，营销页与内容页都能复用同一套路由规则。'
      },
      seo: {
        title: 'SEO 友好页面',
        description: '首页、价格页、帮助中心和新闻详情都有可扩展的 SEO 入口，适合公开索引。'
      },
      auth: {
        title: '账户流程',
        description: '登录、注册和账户页已经串好基础状态，为后续接入真实后端和权限控制留好位置。'
      },
      content: {
        title: '内容中心',
        description:
          'FAQ 来自本地 typed config；新闻与定价经 Public API 拉取，后续可统一替换为 CMS 或后台接口。'
      },
      deploy: {
        title: '生产部署',
        description: '预置 Docker、Nginx、SWR routeRules 和安全响应头，方便从开发走到上线。'
      }
    },
    workflow: {
      eyebrow: '上线所需，一应俱全',
      title: '从模板到上线，路径更短',
      lead: '保留 starter 的轻量感，同时补齐 SaaS 官网最需要展示的能力、转化入口和内容结构。',
      steps: {
        routes: '先复用首页、价格页、帮助中心和新闻中心组织公开信息。',
        content: '再替换 i18n 文案与内容数据（定价/新闻已接 API，可按业务改为 CMS）。',
        auth: '最后接入后端账号体系，把登录态、权限和业务工作台串起来。'
      }
    },
    ctaEyebrow: '准备开始搭建',
    ctaTitle: '用这套 Nuxt 基础骨架，更快搭出一个像样的产品前台。'
  },
  editor: {
    eyebrow: 'Yaniv Editor',
    title: '内容编辑器',
    placeholder: '开始撰写你的内容...',
    metaTitle: '编辑器',
    autosave: {
      saving: '保存中…',
      saved: '已自动保存 · {time}',
      failed: '自动保存失败，将继续重试'
    },
    rename: {
      failed: '重命名失败，请重试'
    }
  },
  workspace: {
    nav: '工作台',
    title: '管理你的 PPT 作品',
    defaultTitle: '未命名作品',
    empty: '暂无作品，点击右上角按钮创建。',
    projectNotFound: '项目不存在或无权访问',
    create: '新建空白 PPT',
    edit: '编辑',
    delete: '删除',
    deleteCancel: '取消',
    deleteConfirm: '确定删除「{title}」吗？此操作不可恢复。',
    deleteSuccess: '作品已删除',
    save: '保存',
    projectName: '作品名称',
    backToWorkspace: '返回工作台',
    browse: '浏览',
    share: '分享',
    download: '下载',
    more: '更多操作'
  },
  about: {
    eyebrow: '关于我们',
    title: '为公开站点与轻量 SaaS 前台而生',
    lead: 'Nuxt Modern Starter 是一套可复用的 Nuxt 4 工程骨架，帮助团队更快搭建营销页、内容中心与可选鉴权的产品前台。',
    mission: {
      title: '我们的目标',
      body: '把公开站点最常见的能力——多语言路由、SEO、内容页、登录注册与部署样例——整理成一套可直接运行、易于扩展的起点，让团队把时间花在业务差异上，而不是重复搭基础设施。'
    },
    values: {
      title: '我们坚持的原则',
      items: {
        focus: '聚焦公开站点场景，保持目录清晰、边界明确，避免 starter 过度膨胀。',
        quality: '默认启用 TypeScript 严格模式、Lint、测试与部署样例，让质量基线从第一天就到位。',
        openness: '公开页与产品区分层设计，本地内容与 API 内容可平滑替换，便于逐步接入真实后端。'
      }
    },
    story: {
      title: '项目背景',
      paragraphs: {
        origin:
          '项目源于团队在多个 SaaS 官网与产品前台中反复搭建的共性需求：营销首页、定价、帮助、新闻、登录注册，以及登录后的工作台与编辑器示例。',
        practice:
          'starter 默认以中文为主语言、英文挂载 /en 前缀，公开页支持 SSR / prerender / SWR 组合策略，产品区则保持语言中性 URL 与 CSR 渲染。',
        next: '如果你正在评估一套 Nuxt 公开站点模板，可以从 README 快速启动，再按业务替换文案、内容与后端接口。'
      }
    }
  },
  help: {
    eyebrow: '帮助中心',
    title: '快速了解 Nuxt Modern Starter 的使用方式',
    lead: '这里汇总了项目启动、多语言扩展、鉴权接入、SEO 配置与部署验证等常见问题。上手步骤与资源清单来自 i18n，FAQ 来自本地 config，后续可替换为 CMS 或后台接口。',
    faqTitle: '常见问题',
    quickStart: {
      title: '30 分钟快速上手',
      steps: {
        install: '启用 Corepack，执行 pnpm install 安装依赖。',
        dev: '运行 pnpm dev，本地访问默认中文路由与 /en 英文路由。',
        explore: '从首页、价格、关于、帮助和新闻页了解公开站点信息结构。',
        extend: '按 docs/usage.md 添加页面、请求、SEO 与可选鉴权模块。'
      }
    },
    resources: {
      title: '推荐阅读',
      architecture: 'docs/architecture.md — 目录职责、渲染策略、特性模块与运行时流程',
      usage: 'docs/usage.md — 页面、请求、SEO、语言、工作台/编辑器/账户与鉴权扩展',
      conventions: 'docs/conventions.md — 配置边界、请求分层与编码约定',
      deployment: 'docs/deployment.md — 本地、Docker 与 Nginx 部署验证'
    }
  },
  news: {
    eyebrow: '项目动态',
    title: 'Nuxt Modern Starter 更新与实践笔记',
    lead: '这里记录 starter 的版本发布、部署实践与扩展建议，也演示新闻列表、详情页 SEO 与 SWR 缓存策略。',
    notFound: '未找到这篇新闻'
  },
  error: {
    title: '页面不存在',
    message: '请检查访问地址，或返回首页继续浏览。',
    forbidden: '无权访问',
    unsupportedLanguage: '不支持的语言'
  }
}
