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
          <NuxtLink class="app-header__sign-in" :to="localePath('/login')">
            {{ $t('auth.header.signIn') }}
          </NuxtLink>
          <NuxtLink class="app-header__sign-up" :to="localePath('/register')">
            <span>{{ $t('auth.header.signUp') }}</span>
            <ArrowRightOutlined />
          </NuxtLink>
        </div>
        <a-dropdown v-else>
          <a-button type="text" class="app-header__account">
            {{ authStore.user?.nickname || authStore.user?.username }}
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="account">
                <NuxtLink :to="localePath('/app/account')">{{ $t('auth.account.title') }}</NuxtLink>
              </a-menu-item>
              <a-menu-item key="logout">
                <button class="app-header__menu-button" type="button" @click="handleLogout">
                  {{ $t('auth.logout.submit') }}
                </button>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </AppContainer>
  </header>
</template>

<script setup lang="ts">
import { ArrowRightOutlined } from '../../utils/antdIcon'
import { NAV_ITEMS } from '../../../config/site'

const router = useRouter()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()

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

const handleLogout = async () => {
  await logout()
  await router.push(localePath('/'))
}
</script>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
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
  font-size: 15px;
  font-weight: 500;
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
.app-header__sign-up {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: var(--app-header-control-size);
  padding-inline: var(--app-auth-btn-padding-inline);
  border-radius: var(--app-auth-btn-radius);
  font-size: 14px;
  font-weight: 500;
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

.app-header__sign-up {
  border: 1px solid transparent;
  background: var(--app-auth-sign-up-bg);
  color: var(--app-auth-sign-up-text);
  padding-inline-end: calc(var(--app-auth-btn-padding-inline) - 2px);

  :deep(.anticon) {
    font-size: 13px;
    line-height: 1;
  }

  &:hover {
    background: var(--app-auth-sign-up-bg-hover);
  }
}

.app-header__account {
  height: auto;
  min-height: var(--app-header-control-size);
  padding-inline: 8px;
  color: var(--app-color-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: var(--app-header-control-size);
  text-decoration: none;
}

.app-header__menu-button {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
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
