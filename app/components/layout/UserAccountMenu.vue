<!--
  【文件职责】
    产品区用户菜单：头像、语言子面板、账户链接、退出登录。
    退出时 await logout() 后 router.push 回首页（store logout 本身不跳转）。

  【架构位置】
    登录产品区 — app/components/layout，AppShellHeader 默认 actions-after。

  【主要导出 / 路由】
    UserAccountMenu → /account、logout → localePath('/')

  【依赖关系】
    - 依赖：useAuth、useUserAvatar、useLanguageSwitch、useLocalePath、useCoarsePointer、
      LanguageOptionList
    - 被引用：AppShellHeader（产品区默认 actions-after）、AccountShell、EditorWorkspaceHeader
      （ProductShell 经 AppShellHeader 间接使用，不直接 import）

  【渲染 / 数据】
    CSR；产品区语言切换不改变 URL path，仅换 UI locale。

  【边界与注意】
    handleSignOut：先 closeMenu，再 logout，再 router.push — 与 auth store 职责分离。
    语言选项列表与公开站 LanguageSwitcher 共用 LanguageOptionList；本组件只负责子面板定位与开合。
-->
<template>
  <div ref="rootRef" class="user-account-menu">
    <button
      type="button"
      class="user-account-menu__trigger"
      :aria-label="displayName"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <span
        v-if="avatarUrl"
        class="user-account-menu__avatar app-avatar-fallback app-avatar-fallback--sm app-avatar-fallback--image"
      >
        <img :src="avatarUrl" alt="" />
      </span>
      <span v-else class="user-account-menu__avatar app-avatar-fallback app-avatar-fallback--sm">{{
        initials
      }}</span>
    </button>

    <Transition name="user-account-menu-pop">
      <div v-show="isOpen" class="user-account-menu__anchor">
        <div ref="flyoutRef" class="user-account-menu__flyout">
          <div class="user-account-menu__panel">
            <div class="user-account-menu__header">
              <span
                v-if="avatarUrl"
                class="user-account-menu__avatar app-avatar-fallback app-avatar-fallback--lg app-avatar-fallback--image"
              >
                <img :src="avatarUrl" alt="" />
              </span>
              <span
                v-else
                class="user-account-menu__avatar app-avatar-fallback app-avatar-fallback--lg"
                >{{ initials }}</span
              >
              <div class="user-account-menu__identity">
                <p class="user-account-menu__name">{{ displayName }}</p>
                <p v-if="username" class="user-account-menu__username">{{ username }}</p>
              </div>
            </div>

            <div class="user-account-menu__list">
              <div
                class="user-account-menu__item-wrap"
                :class="{ 'user-account-menu__item-wrap--open': isLanguageOpen }"
                @mouseenter="openLanguagePanel"
                @mouseleave="scheduleCloseLanguagePanel"
              >
                <button
                  ref="languageTriggerRef"
                  type="button"
                  class="user-account-menu__item"
                  :class="{ 'user-account-menu__item--active': isLanguageOpen }"
                  :aria-expanded="isLanguageOpen"
                  @click="toggleLanguagePanel"
                >
                  <GlobalOutlined class="user-account-menu__icon" aria-hidden="true" />
                  <span class="user-account-menu__label">{{ currentLanguageLabel }}</span>
                  <RightOutlined class="user-account-menu__chevron" aria-hidden="true" />
                </button>
              </div>

              <NuxtLink
                class="user-account-menu__item user-account-menu__item--link"
                :to="localePath('/account')"
                @click="closeMenu"
              >
                <UserOutlined class="user-account-menu__icon" aria-hidden="true" />
                <span class="user-account-menu__label">{{ $t('userMenu.account') }}</span>
              </NuxtLink>

              <div class="user-account-menu__divider" role="separator" />

              <button type="button" class="user-account-menu__item" @click="handleSignOut">
                <LogoutOutlined class="user-account-menu__icon" aria-hidden="true" />
                <span class="user-account-menu__label">{{ $t('userMenu.signOut') }}</span>
              </button>
            </div>
          </div>

          <Transition name="user-account-menu-fade">
            <LanguageOptionList
              v-show="isLanguageOpen"
              class="user-account-menu__language-panel"
              :style="languagePanelStyle"
              :languages="languages"
              :current-language="currentLanguage"
              :panel-label="$t('userMenu.language')"
              @select="handleLanguageSelect"
              @mouseenter="openLanguagePanel"
              @mouseleave="scheduleCloseLanguagePanel"
            />
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { GlobalOutlined, LogoutOutlined, RightOutlined, UserOutlined } from '../../utils/antdIcon'
import type { SupportedLocale } from '../../../config/site'

const router = useRouter()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()
const { displayName, avatarUrl, initials } = useUserAvatar()
const { switchLanguage, languages, currentLanguage } = useLanguageSwitch()
const { isCoarsePointer } = useCoarsePointer()

const isOpen = ref(false)
const isLanguageOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const flyoutRef = ref<HTMLElement | null>(null)
const languageTriggerRef = ref<HTMLElement | null>(null)
const languagePanelOffset = ref(0)
let languagePanelCloseTimer: ReturnType<typeof setTimeout> | null = null

const username = computed(() => authStore.user?.username || '')

const currentLanguageLabel = computed(
  () => languages.value.find((language) => language.locale === currentLanguage.value)?.label || ''
)

const languagePanelStyle = computed(() => ({
  top: `${languagePanelOffset.value}px`
}))

const syncLanguagePanelOffset = () => {
  const flyout = flyoutRef.value
  const trigger = languageTriggerRef.value

  if (!flyout || !trigger) {
    return
  }

  languagePanelOffset.value =
    trigger.getBoundingClientRect().top - flyout.getBoundingClientRect().top
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!isOpen.value || !rootRef.value) {
    return
  }

  if (!rootRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

watch(isOpen, async (open) => {
  if (open) {
    document.addEventListener('mousedown', handleDocumentClick)
    await nextTick()
    syncLanguagePanelOffset()
    return
  }

  document.removeEventListener('mousedown', handleDocumentClick)
  isLanguageOpen.value = false
})

watch(isLanguageOpen, async (open) => {
  if (!open) {
    return
  }

  await nextTick()
  syncLanguagePanelOffset()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocumentClick)

  if (languagePanelCloseTimer) {
    clearTimeout(languagePanelCloseTimer)
  }
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
  isLanguageOpen.value = false
}

const openLanguagePanel = () => {
  if (languagePanelCloseTimer) {
    clearTimeout(languagePanelCloseTimer)
    languagePanelCloseTimer = null
  }

  // 桌面 hover 打开；触控设备仅 click（toggleLanguagePanel）切换
  if (!isCoarsePointer.value) {
    isLanguageOpen.value = true
  }
}

const scheduleCloseLanguagePanel = () => {
  if (isCoarsePointer.value) {
    return
  }

  if (languagePanelCloseTimer) {
    clearTimeout(languagePanelCloseTimer)
  }

  languagePanelCloseTimer = setTimeout(() => {
    isLanguageOpen.value = false
    languagePanelCloseTimer = null
  }, 120)
}

const toggleLanguagePanel = () => {
  isLanguageOpen.value = !isLanguageOpen.value
}

const handleLanguageSelect = async (locale: SupportedLocale) => {
  // 产品区 switchLanguage 不改 URL path，仅换 UI locale + cookie
  await switchLanguage(locale)
  closeMenu()
}

const handleSignOut = async () => {
  closeMenu()
  await logout()
  // store logout 不跳转；UI 层 push 回公开首页
  await router.push(localePath('/'))
}
</script>

<style scoped lang="scss">
.user-account-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.user-account-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  line-height: 0;
}

.user-account-menu__anchor {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: var(--app-z-index-dropdown);
}

.user-account-menu__avatar {
  user-select: none;
}

.user-account-menu__flyout {
  position: relative;
  width: max-content;
}

.user-account-menu__panel {
  box-sizing: border-box;
  width: max-content;
  max-width: 240px;
  padding: 12px;
  border: 1px solid var(--app-color-border);
  border-radius: 16px;
  background: var(--app-color-bg);
  box-shadow: var(--app-shadow-dropdown);
}

.user-account-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-inline: 3px;
}

.user-account-menu__identity {
  min-width: 0;
}

.user-account-menu__name {
  margin: 0;
  overflow: hidden;
  color: var(--app-color-text);
  font-size: var(--app-text-md);
  font-weight: var(--app-weight-bold);
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-account-menu__username {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--app-color-muted);
  font-size: var(--app-text-sm);
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-account-menu__list {
  display: grid;
  gap: 2px;
  width: 100%;
}

.user-account-menu__item-wrap {
  position: static;
  width: 100%;
}

.user-account-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  padding: 0 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--app-color-text);
  cursor: pointer;
  font: inherit;
  font-size: var(--app-text-base);
  line-height: 1.2;
  text-align: left;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover,
  &:focus-visible {
    background: var(--app-color-elevated);
  }
}

.user-account-menu__item--active,
.user-account-menu__item-wrap--open > .user-account-menu__item {
  background: var(--app-color-elevated);
}

.user-account-menu__icon {
  flex-shrink: 0;
  color: var(--app-color-muted);
  font-size: var(--app-text-lg);
  line-height: 1;
}

.user-account-menu__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.user-account-menu__chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--app-color-muted);
  font-size: var(--app-text-xs);
  line-height: 1;
}

.user-account-menu__divider {
  height: 1px;
  margin: 6px 0;
  background: var(--app-color-border);
}

.user-account-menu__language-panel {
  // 面板外观由 LanguageOptionList 提供；这里只把子面板定位到触发项左侧
  position: absolute;
  right: calc(100% + 5px);
}

.user-account-menu-pop-enter-active,
.user-account-menu-pop-leave-active,
.user-account-menu-fade-enter-active,
.user-account-menu-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.user-account-menu-pop-enter-from,
.user-account-menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.user-account-menu-fade-enter-from,
.user-account-menu-fade-leave-to {
  opacity: 0;
  transform: translateX(4px);
}
</style>
