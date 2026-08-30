## 改了什么

<!-- 一两句说明意图，而不是罗列 diff -->

## 为什么

<!-- 背景、触发这次改动的问题，或关联 issue -->

## 自检清单

- [ ] `pnpm quality` 本地通过（lint / format / stylelint / typecheck / i18n / depcruise / build / test）
- [ ] 改动涉及的源文件头注释（【文件职责】等）已同步，`pnpm docs:sync:check` 通过
- [ ] 新增或修改行为有对应测试；修 bug 的话，先有一个能复现的失败用例
- [ ] 改了 `config/`、`nuxt.config.ts`、`server/` 或路由规则时，已确认渲染策略（prerender / SWR / CSR）与 SEO 影响
- [ ] 改了鉴权、缓存或 SSR payload 相关代码时，已确认不违反 `tests/unit/ssr-cache-safety.test.ts` 的不变量
- [ ] 面向用户的文案已走 i18n，`pnpm i18n:check` 通过

## 影响面

<!-- 是否影响线上渲染 / SEO / 鉴权 / 缓存 / 部署配置？需要同步改环境变量或后端契约吗？ -->

## 验证方式

<!-- 审阅者怎么复现你的验证结果 -->
