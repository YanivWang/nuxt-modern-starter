/*
  【文件职责】
    Ant Design Vue locale 映射：将站点 SupportedLocale 转成 a-config-provider 使用的组件内置语言包。

  【架构位置】
    config 层 — app/app.vue 读取，按需加载当前语言包，保证业务文案与 AntD 内置文案同步切换。

  【边界与注意】
    Ant Design Vue 暂无 Filipino 语言包，ph-PH 回退 en_US；其余 locale 使用对应或最接近的官方包。
*/
import enUS from 'ant-design-vue/es/locale/en_US'
import type { SupportedLocale } from './site'

export type AntdLocale = typeof enUS

const resolveEnUSLocale = () => Promise.resolve(enUS)

const ANTD_LOCALE_LOADERS = {
  'zh-CN': () => import('ant-design-vue/es/locale/zh_CN').then((module) => module.default),
  'en-US': resolveEnUSLocale,
  'pt-PT': () => import('ant-design-vue/es/locale/pt_PT').then((module) => module.default),
  'es-ES': () => import('ant-design-vue/es/locale/es_ES').then((module) => module.default),
  'ko-KR': () => import('ant-design-vue/es/locale/ko_KR').then((module) => module.default),
  'th-TH': () => import('ant-design-vue/es/locale/th_TH').then((module) => module.default),
  'ms-MY': () => import('ant-design-vue/es/locale/ms_MY').then((module) => module.default),
  'id-ID': () => import('ant-design-vue/es/locale/id_ID').then((module) => module.default),
  // Ant Design 无 Filipino 官方包，ph-PH 回退 en_US
  'ph-PH': resolveEnUSLocale,
  'ja-JP': () => import('ant-design-vue/es/locale/ja_JP').then((module) => module.default),
  'de-DE': () => import('ant-design-vue/es/locale/de_DE').then((module) => module.default),
  'fr-FR': () => import('ant-design-vue/es/locale/fr_FR').then((module) => module.default),
  'ru-RU': () => import('ant-design-vue/es/locale/ru_RU').then((module) => module.default),
  'zh-HK': () => import('ant-design-vue/es/locale/zh_HK').then((module) => module.default),
  'pt-BR': () => import('ant-design-vue/es/locale/pt_BR').then((module) => module.default)
} as const satisfies Record<SupportedLocale, () => Promise<AntdLocale>>

export const loadAntdLocale = (locale: SupportedLocale) => ANTD_LOCALE_LOADERS[locale]()
