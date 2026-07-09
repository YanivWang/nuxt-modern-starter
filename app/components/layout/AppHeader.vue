<!--
  【文件职责】
    公开站 sticky 顶栏：NAV_ITEMS 主导航、语言 / 主题切换、登录注册或进入工作台 CTA。
    滚动时添加半透明背景与 blur。

  【架构位置】
    公开 SEO 区 — app/components/layout，由 default layout 引用。

  【主要导出 / 路由】
    AppHeader

  【依赖关系】
    - 依赖：config/site.ts（NAV_ITEMS）、BaseLogo、LanguageSwitcher、ThemeSwitch、useAuth
    - 被引用：app/layouts/default.vue

  【渲染 / 数据】
    未登录显示 sign-in / sign-up；已登录显示 enterWorkspace → /workspace（localePath）。

  【边界与注意】
    产品 layout 不使用 AppHeader；内部链接须 localePath。
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
        <div v-if="!authStore.isAuthenticated" class="app-header__auth">
          <NuxtLink class="app-header__sign-in" :to="localePath('/sign-in')">
            {{ $t('auth.header.signIn') }}
          </NuxtLink>
          <NuxtLink class="app-header__sign-up" :to="localePath('/sign-up')">
            <span>{{ $t('auth.header.signUp') }}</span>
            <ArrowRightOutlined />
          </NuxtLink>
        </div>
        <NuxtLink v-else class="app-header__workspace" :to="localePath('/workspace')">
          <span>{{ $t('auth.header.enterWorkspace') }}</span>
          <ArrowRightOutlined />
        </NuxtLink>
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

.app-header__auth {
  display: flex;
  align-items: center;
  gap: var(--app-header-auth-gap);
}

.app-header__sign-in,
.app-header__sign-up,
.app-header__workspace {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: var(--app-header-control-size);
  padding-inline: var(--app-auth-btn-padding-inline);
  border-radius: var(--app-auth-btn-radius);
  font-size: var(--app-text-base);
  font-weight: var(--app-weight-medium);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.app-header__sign-in {
  border: 1px solid var(--app-auth-sign-in-border);
  background: var(--app-auth-sign-in-bg);
  color: var(--app-auth-sign-in-text);

  &:hover {
    border-color: var(--app-auth-sign-in-border-hover);
    background: var(--app-auth-sign-in-bg-hover);
  }
}

.app-header__sign-up,
.app-header__workspace {
  border: 1px solid transparent;
  background: var(--app-auth-sign-up-bg);
  color: var(--app-auth-sign-up-text);
  padding-inline-end: calc(var(--app-auth-btn-padding-inline) - 2px);

  :deep(.anticon) {
    font-size: var(--app-text-sm);
    line-height: 1;
  }

  &:hover {
    background: var(--app-auth-sign-up-bg-hover);
  }
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

  .app-header__auth {
    margin-inline-start: auto;
  }
}
</style>
