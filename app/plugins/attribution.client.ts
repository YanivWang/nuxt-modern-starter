import { saveAttributionParams } from '../utils/attribution-params'

const captureFromQuery = (query: Record<string, unknown>) => saveAttributionParams(query)

export default defineNuxtPlugin(() => {
  const router = useRouter()
  captureFromQuery(router.currentRoute.value.query)
  router.afterEach((to) => captureFromQuery(to.query))
})
