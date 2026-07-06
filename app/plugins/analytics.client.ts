import { loadExternalScript } from '../utils/load-script'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  if (runtimeConfig.public.analyticsEnabled !== true) {
    return
  }

  const scriptSrc = runtimeConfig.public.analyticsScriptSrc?.trim()
  if (!scriptSrc) {
    return
  }

  loadExternalScript(scriptSrc, runtimeConfig.public.analyticsDeferMs).catch((error) => {
    console.warn('[analytics] Failed to load script:', error)
  })
})
