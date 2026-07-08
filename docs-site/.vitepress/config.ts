import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nuxt Modern Starter',
  description: 'Nuxt 4 公开站点与轻量 SaaS 前台 starter 完整架构文档',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  head: [['meta', { name: 'theme-color', content: '#1677ff' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '架构', link: '/architecture/overview' },
      { text: '技术栈', link: '/tech-stack/overview' },
      { text: '开发', link: '/development/add-page' },
      { text: '部署', link: '/deployment/overview' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '文档首页', link: '/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '项目概览', link: '/guide/overview' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: '架构设计',
          items: [
            { text: '架构总览', link: '/architecture/overview' },
            { text: '目录结构', link: '/architecture/directory' },
            { text: '路由与渲染', link: '/architecture/routing' },
            { text: '请求与数据流', link: '/architecture/data-flow' },
            { text: '鉴权设计', link: '/architecture/auth' },
            { text: '国际化', link: '/architecture/i18n' },
            { text: 'SEO 设计', link: '/architecture/seo' }
          ]
        }
      ],
      '/tech-stack/': [
        {
          text: '技术栈',
          items: [
            { text: '技术栈总览', link: '/tech-stack/overview' },
            { text: 'Nuxt 4', link: '/tech-stack/nuxt' },
            { text: 'Pinia 状态管理', link: '/tech-stack/pinia' },
            { text: '样式体系', link: '/tech-stack/styles' },
            { text: 'Ant Design Vue', link: '/tech-stack/ant-design-vue' },
            { text: 'HTTP 请求层', link: '/tech-stack/http' }
          ]
        }
      ],
      '/development/': [
        {
          text: '开发指南',
          items: [
            { text: '添加公开页面', link: '/development/add-page' },
            { text: '添加功能模块', link: '/development/add-feature' },
            { text: '添加 API 请求', link: '/development/add-api' },
            { text: '添加 SEO', link: '/development/add-seo' },
            { text: '编码约定', link: '/development/conventions' },
            { text: '测试与质量', link: '/development/testing' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '部署概览', link: '/deployment/overview' },
            { text: '环境变量', link: '/deployment/env' },
            { text: 'Docker', link: '/deployment/docker' },
            { text: 'Nginx 网关', link: '/deployment/nginx' }
          ]
        }
      ],
      '/reference/': [
        {
          text: '参考',
          items: [
            { text: '脚本命令', link: '/reference/scripts' },
            { text: '配置文件', link: '/reference/config' }
          ]
        }
      ]
    },
    socialLinks: [],
    footer: {
      message: 'Nuxt Modern Starter 架构文档',
      copyright: 'MIT License'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    outline: { label: '本页目录' },
    search: {
      provider: 'local'
    }
  }
})
