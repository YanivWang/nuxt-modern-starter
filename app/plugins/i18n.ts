import { i18n, loadLocaleMessages, matcheRouteLanguage } from '../../i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute()
  const locale = matcheRouteLanguage(route.params.language as string | undefined)

  await loadLocaleMessages(locale || 'zh-CN')
  nuxtApp.vueApp.use(i18n)
})
