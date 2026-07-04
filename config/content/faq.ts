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
      'zh-CN': '如何启动项目？',
      'en-US': 'How do I start the project?'
    },
    answer: {
      'zh-CN': '启用 Corepack 后执行 pnpm install 和 pnpm dev。',
      'en-US': 'Enable Corepack, then run pnpm install and pnpm dev.'
    }
  },
  {
    key: 'i18n',
    question: {
      'zh-CN': '如何新增语言？',
      'en-US': 'How do I add a language?'
    },
    answer: {
      'zh-CN': '扩展 config/site.ts、i18n/<locale>/index.ts，并补充路由和 SEO 测试。',
      'en-US': 'Extend config/site.ts and i18n/<locale>/index.ts, then add routing and SEO tests.'
    }
  }
]
