/*
  【文件职责】
    营销归因捕获插件（client-only）：首屏与每次路由切换后从 query 保存渠道参数。
    委托 app/utils/attribution-params.ts 做 localStorage 持久化。

  【架构位置】
    共享层 — app/plugins，.client 后缀仅客户端执行。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：app/utils/attribution-params.ts
    - 被引用：Nuxt 自动注册；registerApi 读取已存参数

  【渲染 / 数据】
    client-only；router.afterEach 监听 query 变化。

  【边界与注意】
    无 env 守卫，始终注册；无渠道 key 时不写 storage。
*/
import { saveAttributionParams } from '../utils/attribution-params'

/** 从 route.query 提取 utm_* / gclid 等渠道参数并按 key last-touch 写入 localStorage */
const captureFromQuery = (query: Record<string, unknown>) => saveAttributionParams(query)

export default defineNuxtPlugin(() => {
  const router = useRouter()
  // 首屏捕获当前 URL 渠道参数
  captureFromQuery(router.currentRoute.value.query)
  // 每次客户端导航后再次捕获（SPA 内跳转带新 query 时更新归因）
  router.afterEach((to) => captureFromQuery(to.query))
})
