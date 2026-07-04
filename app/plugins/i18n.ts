import { i18n, loadLocaleMessages, matchRouteLanguage } from '../../i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute()
  const locale = matchRouteLanguage(route.params.language as string | undefined)

  await loadLocaleMessages(locale || 'zh-CN')
  nuxtApp.vueApp.use(i18n)
})
