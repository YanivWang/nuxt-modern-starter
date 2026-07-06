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
      <span v-if="avatarUrl" class="user-account-menu__avatar user-account-menu__avatar--image">
        <img :src="avatarUrl" alt="" />
      </span>
      <span v-else class="user-account-menu__avatar">{{ initials }}</span>
    </button>

    <Transition name="user-account-menu-pop">
      <div v-show="isOpen" class="user-account-menu__anchor">
        <div ref="flyoutRef" class="user-account-menu__flyout">
          <div class="user-account-menu__panel">
            <div class="user-account-menu__header">
              <span
                v-if="avatarUrl"
                class="user-account-menu__avatar user-account-menu__avatar--image user-account-menu__avatar--lg"
              >
                <img :src="avatarUrl" alt="" />
              </span>
              <span v-else class="user-account-menu__avatar user-account-menu__avatar--lg">{{
                initials
              }}</span>
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
            <div
              v-show="isLanguageOpen"
              class="user-account-menu__language-panel"
              :style="languagePanelStyle"
              role="menu"
              :aria-label="$t('userMenu.language')"
              @mouseenter="openLanguagePanel"
              @mouseleave="scheduleCloseLanguagePanel"
            >
              <button
                v-for="language in languages"
                :key="language.locale"
                type="button"
                role="menuitem"
                class="user-account-menu__language-item"
                :class="{
                  'user-account-menu__language-item--active': language.locale === currentLanguage
                }"
                @click="handleLanguageSelect(language.locale)"
              >
                <span>{{ language.label }}</span>
                <CheckOutlined
                  v-if="language.locale === currentLanguage"
                  class="user-account-menu__language-check"
                  aria-hidden="true"
                />
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  CheckOutlined,
  GlobalOutlined,
  LogoutOutlined,
  RightOutlined,
  UserOutlined
} from '../../utils/antdIcon'
import type { SupportedLocale } from '../../../config/site'

const router = useRouter()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()
const { displayName, avatarUrl, initials } = useUserAvatar()
const { switchLanguage, languages, currentLanguage } = useLanguageSwitch()

const isOpen = ref(false)
const isLanguageOpen = ref(false)
const isCoarsePointer = ref(false)
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

onMounted(() => {
  isCoarsePointer.value = window.matchMedia('(hover: none), (pointer: coarse)').matches
})

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
  await switchLanguage(locale)
  closeMenu()
}

const handleSignOut = async () => {
  closeMenu()
  await logout()
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
  z-index: 1100;
}

.user-account-menu__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #22c55e;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  user-select: none;

  &--lg {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  &--image {
    overflow: hidden;
    background: transparent;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
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
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-account-menu__username {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--app-color-muted);
  font-size: 13px;
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
  font-size: 14px;
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
  font-size: 16px;
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
  font-size: 11px;
  line-height: 1;
}

.user-account-menu__divider {
  height: 1px;
  margin: 6px 0;
  background: var(--app-color-border);
}

.user-account-menu__language-panel {
  position: absolute;
  top: 0;
  right: calc(100% + 5px);
  z-index: 1;
  display: grid;
  gap: 2px;
  box-sizing: border-box;
  width: max-content;
  min-width: 120px;
  padding: 4px;
  border: 1px solid var(--app-color-border);
  border-radius: 10px;
  background: var(--app-color-bg);
  box-shadow: var(--app-shadow-dropdown);
}

.user-account-menu__language-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--app-color-text);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  line-height: 1.2;
  text-align: left;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover,
  &:focus-visible {
    background: var(--app-color-elevated);
  }
}

.user-account-menu__language-item--active {
  background: var(--app-color-elevated);
  color: var(--app-color-primary);
  font-weight: 600;
}

.user-account-menu__language-check {
  color: var(--app-color-primary);
  font-size: 12px;
  line-height: 1;
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
