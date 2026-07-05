export default {
  nav: {
    home: '首页',
    pricing: '价格',
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
    error: '操作失败，请稍后重试'
  },
  auth: {
    header: {
      signIn: '登录',
      signUp: '注册'
    },
    form: {
      username: '用户名',
      password: '密码',
      confirmPassword: '确认密码'
    },
    login: {
      eyebrow: '账户登录',
      title: '登录',
      lead: '使用当前应用账户登录，登录后会按 redirect 参数回到原页面。',
      submit: '登录',
      success: '登录成功',
      noAccount: '还没有账户？'
    },
    register: {
      eyebrow: '创建账户',
      title: '注册',
      lead: '注册只创建账户，后端不会自动登录；注册成功后请继续登录。',
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
        value: 'SSR',
        label: '默认服务端渲染与缓存策略'
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
        description: 'FAQ 与新闻内容来自 typed 本地数据，后续可以平滑替换成 CMS 或 API。'
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
        content: '再替换本地内容数据，沉淀产品卖点、FAQ、公告和客户故事。',
        auth: '最后接入后端账号体系，把登录态、权限和业务工作台串起来。'
      }
    },
    ctaEyebrow: '准备开始搭建',
    ctaTitle: '用这套 Nuxt 基础骨架，更快搭出一个像样的产品前台。'
  },
  pricing: {
    eyebrow: '使用方案',
    title: '按团队规模选择合适的起步方式',
    lead: '以下方案展示 Nuxt Modern Starter 在不同场景下的推荐用法。Starter 适合个人验证与原型，Growth 覆盖完整工程闭环，Custom 面向需要深度定制的企业团队。',
    note: '价格仅为示例结构，实际使用时请替换为你们产品的套餐、权益说明与转化按钮。',
    plans: {
      starter: {
        name: 'Starter',
        badge: '个人入门',
        price: '免费',
        period: '开源模板',
        description: '适合个人学习、概念验证，或快速搭建公开营销页原型。',
        cta: '立即开始',
        features: {
          nuxt: 'Nuxt 4 + TypeScript + Pinia 基础工程',
          pages: '首页、价格、帮助、新闻等公开页面',
          i18n: '中英文路由与语言切换',
          seo: 'Canonical、hreflang 与 OG 元数据'
        }
      },
      growth: {
        name: 'Growth',
        badge: '团队推荐',
        price: '推荐',
        period: '完整能力',
        description: '适合需要账号体系、请求封装、部署验证与质量门禁的小团队产品前台。',
        cta: '查看能力清单',
        features: {
          api: '场景化 API client 与 Bearer Token 鉴权',
          auth: '登录、注册、账户页与路由守卫示例',
          deploy: 'Docker 镜像与 Nginx 反向代理样例',
          quality: 'Lint、Stylelint、Typecheck 与 Vitest 测试'
        }
      },
      custom: {
        name: 'Custom',
        badge: '企业定制',
        price: '联系我们',
        period: '按需扩展',
        description: '适合需要品牌主题、CMS 接入、复杂权限或多区域部署的企业项目。',
        cta: '沟通需求',
        features: {
          theme: '设计 token 与 Ant Design Vue 主题深度定制',
          content: 'FAQ、新闻等内容迁移至 CMS 或 API',
          docs: '架构文档、使用指南与部署手册',
          support: '按需补充 E2E、CI 与运维集成方案'
        }
      }
    },
    includes: {
      eyebrow: '所有方案共同包含',
      title: '一套可复用的公开站点基础能力',
      items: {
        stack: 'Nuxt 4、Vue 3、SCSS 设计 token 与 Ant Design Vue 组件体系',
        routing: '默认语言无前缀、英文 /en 前缀，以及统一 localePath 工具',
        content: 'Typed 本地 FAQ 与新闻数据，便于后续替换数据源',
        editor: '内置 Yaniv Editor 示例页，便于扩展富文本或文档场景'
      }
    }
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
    }
  },
  workspace: {
    nav: '工作台',
    eyebrow: '产品工作台',
    title: '管理你的 PPT 作品',
    lead: '登录后在这里管理 PPT 作品。你可以创建项目，并在编辑页保存内容。',
    empty: '暂无项目，先创建一个空白 PPT。',
    projectNotFound: '项目不存在或无权访问',
    create: '新建作品',
    search: '查找我的作品',
    edit: '编辑',
    delete: '删除',
    deleteCancel: '取消',
    deleteConfirm: '确定删除「{title}」吗？此操作不可恢复。',
    deleteSuccess: '作品已删除',
    save: '保存',
    slides: '页',
    slide: '页面',
    properties: '属性面板',
    projectName: '作品名称',
    slideCount: '页面数量',
    backToWorkspace: '返回工作台',
    filters: {
      all: '全部',
      recent: '最近更新',
      shared: '共享作品'
    },
    status: {
      draft: '草稿',
      ready: '可编辑',
      shared: '已共享'
    },
    actions: {
      ai: {
        title: 'AI 新增 PPT',
        description: '从一句话或大纲开始生成作品'
      },
      import: {
        title: '导入文档生成',
        description: '上传文档并生成演示稿结构'
      },
      blank: {
        title: '新建空白 PPT',
        description: '从空白画布开始自由编辑'
      }
    }
  },
  help: {
    eyebrow: '帮助中心',
    title: '快速了解 Nuxt Modern Starter 的使用方式',
    lead: '这里汇总了项目启动、多语言扩展、鉴权接入、SEO 配置与部署验证等常见问题。内容来自 typed 本地数据，后续可平滑替换为 CMS 或后台接口。',
    faqTitle: '常见问题',
    quickStart: {
      title: '30 分钟快速上手',
      steps: {
        install: '启用 Corepack，执行 pnpm install 安装依赖。',
        dev: '运行 pnpm dev，本地访问默认中文路由与 /en 英文路由。',
        explore: '从首页、价格、帮助和新闻页了解公开站点信息结构。',
        extend: '按 docs/usage.md 添加页面、请求、SEO 与可选鉴权模块。'
      }
    },
    resources: {
      title: '推荐阅读',
      architecture: 'docs/architecture.md — 目录职责、渲染策略与运行时流程',
      usage: 'docs/usage.md — 页面、请求、SEO、语言、产品与鉴权扩展',
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
