/*
  【文件职责】
    指针能力探测 composable：判断当前设备是否为粗指针 / 无 hover（触控）。
    hover 打开的浮层在触控设备上会「点一下就卡住」，需要退化成 click 切换。

  【架构位置】
    共享层 — app/composables，被 LanguageSwitcher、UserAccountMenu 消费。

  【主要导出 / 路由】
    useCoarsePointer — isCoarsePointer

  【依赖关系】
    - 依赖：无
    - 被引用：app/components/layout/LanguageSwitcher.vue、UserAccountMenu.vue

  【渲染 / 数据】
    仅客户端：SSR 期间恒为 false（等价于桌面 hover 行为），onMounted 后按 matchMedia 修正。

  【边界与注意】
    不在 SSR 阶段读 window；值只在 onMounted 后可信。
*/
export const useCoarsePointer = () => {
  // SSR 无法探测指针能力，先假设桌面；挂载后再按 matchMedia 修正
  const isCoarsePointer = ref(false)

  onMounted(() => {
    isCoarsePointer.value = window.matchMedia('(hover: none), (pointer: coarse)').matches
  })

  return { isCoarsePointer }
}
