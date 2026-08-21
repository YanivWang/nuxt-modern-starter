<!--
  【文件职责】
    公开站 sticky 顶栏：NAV_ITEMS 主导航、语言 / 主题切换、登录注册或进入工作台 CTA。
    滚动时添加半透明背景与 blur。

  【架构位置】
    公开 SEO 区 — app/components/layout，由 default layout 引用。

  【主要导出 / 路由】
    AppHeader

  【依赖关系】
    - 依赖：config/site.ts（NAV_ITEMS）、BaseLogo、LanguageSwitcher、ThemeSwitch、
      AppHeaderSignedOutActions、useAuth
    - 被引用：app/layouts/default.vue

  【渲染 / 数据】
    未登录显示 sign-in / sign-up；已登录显示 enterWorkspace → /workspace（localePath）。
    登录态分支包在 <ClientOnly> 内：本组件出现在 prerender / SWR 缓存的公开页上，
    SSR 输出必须对所有访客一致，否则登录用户的渲染结果会被缓存并发给匿名访客。

  【边界与注意】
    产品 layout 不使用 AppHeader；内部链接须 localePath。
    CTA 按钮样式（.app-header__auth / __sign-in / __sign-up / __workspace）为全局类，
    定义在 app/assets/styles/main.scss，与 AppHeaderSignedOutActions 共享，勿改回 scoped。
    新增依赖登录态的 UI 必须放进 <ClientOnly>，见 tests/unit/ssr-cache-safety.test.ts。
-->
<template>
  <header class="app-header" :class="{ 'app-header--scrolled': isScrolled }">
    <AppContainer class="app-header__inner">
      <BaseLogo />
      <nav class="app-nav" :aria-label="$t('nav.primary')">
        <NuxtLink v-for="item in NAV_ITEMS" :key="item.path" :to="localePath(item.path)">
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>
      <div class="app-header__actions">
        <div class="app-header__utilities">
          <LanguageSwitcher />
          <ThemeSwitch />
        </div>
        <!--
          登录态 UI 只在客户端渲染。公开页存在 prerender 与 SWR 缓存，而 Nitro 的缓存键
          只按 path、不区分 cookie：任何依赖登录态的 SSR 输出都会被缓存并发给其他访客。
          fallback 与未登录分支复用同一组件，保证 SSR HTML 始终是匿名形态。
        -->
        <ClientOnly>
          <NuxtLink
            v-if="authStore.isAuthenticated"
            class="app-header__workspace"
            :to="localePath('/workspace')"
          >
            <span>{{ $t('auth.header.enterWorkspace') }}</span>
            <ArrowRightOutlined />
          </NuxtLink>
          <AppHeaderSignedOutActions v-else />
          <template #fallback>
            <AppHeaderSignedOutActions />
          </template>
        </ClientOnly>
      </div>
    </AppContainer>
  </header>
</template>

<script setup lang="ts">
import { ArrowRightOutlined } from '../../utils/antdIcon'
import { NAV_ITEMS } from '../../../config/site'
const { localePath } = useLocalePath()
const { authStore } = useAuth()

// 滚动后添加半透明背景；公开 header 不用于 product layout
const isScrolled = ref(false)

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState)
})
</script>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--app-z-index-sticky);
  border-bottom: 1px solid var(--app-color-border);
  background: transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    backdrop-filter 0.2s ease;

  &--scrolled {
    border-bottom-color: var(--app-header-border-scrolled);
    background: var(--app-header-bg-scrolled);
    backdrop-filter: blur(var(--app-header-blur));
  }
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: var(--app-header-control-size);
  padding-block: 16px;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: var(--app-header-nav-gap);
  margin-inline: auto;
}

.app-nav a {
  color: var(--app-color-muted);
  font-size: var(--app-text-md);
  font-weight: var(--app-weight-medium);
  line-height: var(--app-header-control-size);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--app-color-text);
  }
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--app-header-actions-gap);
  flex-shrink: 0;
}

.app-header__utilities {
  display: flex;
  align-items: center;
  gap: var(--app-header-utility-gap);
}

.app-nav a.router-link-active {
  color: var(--app-color-primary);
}

@media (width <= 760px) {
  .app-header__inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-nav {
    margin-inline: 0;
    flex-wrap: wrap;
    gap: 20px 24px;
  }

  .app-header__actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
  }
}
</style>
