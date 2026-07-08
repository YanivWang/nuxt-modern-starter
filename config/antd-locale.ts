/*
  【文件职责】
    Ant Design Vue locale 映射：将站点 SupportedLocale 转成 a-config-provider 使用的组件内置语言包。

  【架构位置】
    config 层 — app/app.vue 读取，保证业务文案与 AntD 内置文案同步切换。

  【边界与注意】
    Ant Design Vue 暂无 Filipino 语言包，ph-PH 回退 en_US；其余 locale 使用对应或最接近的官方包。
*/
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import ptPT from 'ant-design-vue/es/locale/pt_PT'
import ptBR from 'ant-design-vue/es/locale/pt_BR'
import esES from 'ant-design-vue/es/locale/es_ES'
import koKR from 'ant-design-vue/es/locale/ko_KR'
import thTH from 'ant-design-vue/es/locale/th_TH'
import msMY from 'ant-design-vue/es/locale/ms_MY'
import idID from 'ant-design-vue/es/locale/id_ID'
import jaJP from 'ant-design-vue/es/locale/ja_JP'
import deDE from 'ant-design-vue/es/locale/de_DE'
import frFR from 'ant-design-vue/es/locale/fr_FR'
import ruRU from 'ant-design-vue/es/locale/ru_RU'
import zhHK from 'ant-design-vue/es/locale/zh_HK'
import type { SupportedLocale } from './site'

const ANTD_LOCALE_MAP = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'pt-PT': ptPT,
  'es-ES': esES,
  'ko-KR': koKR,
  'th-TH': thTH,
  'ms-MY': msMY,
  'id-ID': idID,
  'ph-PH': enUS,
  'ja-JP': jaJP,
  'de-DE': deDE,
  'fr-FR': frFR,
  'ru-RU': ruRU,
  'zh-HK': zhHK,
  'pt-BR': ptBR
} as const satisfies Record<SupportedLocale, typeof enUS>

export const getAntdLocale = (locale: SupportedLocale) => ANTD_LOCALE_MAP[locale]
