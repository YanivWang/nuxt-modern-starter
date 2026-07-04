export default {
  nav: {
    home: '首页',
    pricing: '价格',
    help: '帮助',
    news: '新闻'
  },
  common: {
    switchLanguage: '切换语言',
    switchTheme: '切换主题',
    readMore: '阅读更多',
    backHome: '返回首页'
  },
  auth: {
    form: {
      username: '用户名',
      password: '密码',
      confirmPassword: '确认密码'
    },
    login: {
      eyebrow: '账户登录',
      title: '登录',
      lead: '使用 express-modern-starter 账户登录，登录后会按 redirect 参数回到原页面。',
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
    lead: '为营销页、多语言内容、SEO 页面和轻 SaaS 前台准备的可复用起点。',
    primaryCta: '开始搭建',
    secondaryCta: '查看价格示例',
    matrixTitle: '核心能力矩阵',
    solutionTitle: '适用解决方案',
    customerTitle: '客户案例结构'
  },
  pricing: {
    title: '清晰展示服务套餐和价格结构',
    lead: '价格页示例展示套餐、权益、CTA 和 SEO 配置的推荐组织方式。'
  },
  help: {
    title: '用 SSR 友好的内容构建帮助中心',
    lead: 'FAQ 数据来自 typed 本地内容，后续可以替换为 CMS 或接口。'
  },
  news: {
    title: '新闻与内容中心',
    lead: '新闻列表和详情页用于演示内容型页面、Article JSON-LD 与 SWR routeRules。',
    notFound: '未找到这篇新闻'
  },
  error: {
    title: '页面不存在',
    message: '请检查访问地址，或返回首页继续浏览。'
  }
}
