<!--
  【文件职责】
    公开 header 语言切换下拉：hover / click 打开面板，选择后 chooseLanguage + router.push。
    桌面 hover 打开，触控设备 click 切换。

  【架构位置】
    公开 SEO 区 — app/components/layout，AppHeader utilities 区使用。

  【主要导出 / 路由】
    LanguageSwitcher

  【依赖关系】
    - 依赖：useLanguageStore、useLocalePath（switchLocalePath）
    - 被引用：AppHeader

  【渲染 / 数据】
    公开页切换会改 URL（/ ↔ /en）；产品区语言切换见 UserAccountMenu。

  【边界与注意】
    与 UserAccountMenu 内嵌语言面板逻辑类似，但用于公开 header 场景。
-->
<template>
  <div class="language-switcher" @mouseenter="openPanel" @mouseleave="closePanel">
    <button
      type="button"
      class="language-switcher__trigger app-header__icon-button"
      :aria-label="$t('common.switchLanguage')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="handleTriggerClick"
    >
      <TranslationOutlined />
    </button>

    <Transition name="language-switcher-fade">
      <div
        v-show="isOpen"
        class="language-switcher__panel"
        role="menu"
        :aria-label="$t('common.switchLanguage')"
      >
        <button
          v-for="language in languageStore.languages"
          :key="language.locale"
          type="button"
          role="menuitem"
          class="language-switcher__item"
          :class="{
            'language-switcher__item--active': language.locale === languageStore.currentLanguage
          }"
          :aria-current="language.locale === languageStore.currentLanguage ? 'true' : undefined"
          @click="handleLanguageSelect(language.locale)"
        >
          <span class="language-switcher__label">{{ language.label }}</span>
          <span class="language-switcher__check-slot" aria-hidden="true">
            <CheckOutlined
              v-if="language.locale === languageStore.currentLanguage"
              class="language-switcher__check"
            />
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { CheckOutlined, TranslationOutlined } from '../../utils/antdIcon'
import { SUPPORTED_LOCALES, type SupportedLocale } from '../../../config/site'

const router = useRouter()
const languageStore = useLanguageStore()
const { switchLocalePath } = useLocalePath()

const isOpen = ref(false)
const isCoarsePointer = ref(false)

onMounted(() => {
  isCoarsePointer.value = window.matchMedia('(hover: none), (pointer: coarse)').matches
})

const openPanel = () => {
  if (!isCoarsePointer.value) {
    isOpen.value = true
  }
}

const closePanel = () => {
  if (!isCoarsePointer.value) {
    isOpen.value = false
  }
}

const handleTriggerClick = () => {
  if (isCoarsePointer.value) {
    isOpen.value = !isOpen.value
  }
}

const handleLanguageSelect = async (locale: SupportedLocale) => {
  if (!SUPPORTED_LOCALES.includes(locale) || locale === languageStore.currentLanguage) {
    isOpen.value = false
    return
  }

  await languageStore.chooseLanguage(locale)
  await router.push(switchLocalePath(locale))
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.language-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: var(--app-header-control-size);
}

.language-switcher__trigger {
  font: inherit;
}

.language-switcher__panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
  width: max-content;
  min-width: var(--app-lang-panel-min-width);
  padding: var(--app-lang-panel-padding);
  border: 1px solid var(--app-color-border);
  border-radius: 10px;
  background: var(--app-color-bg);
  box-shadow: var(--app-shadow-dropdown);

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 0;
    left: 0;
    height: 6px;
  }
}

.language-switcher__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: var(--app-lang-item-height);
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--app-color-text);
  cursor: pointer;
  font: inherit;
  font-size: var(--app-lang-item-font-size);
  line-height: 1.2;
  text-align: left;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover,
  &:focus-visible {
    background: var(--app-color-elevated);
  }
}

.language-switcher__item--active {
  background: var(--app-color-elevated);
  color: var(--app-color-primary);
  font-weight: 600;
}

.language-switcher__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.language-switcher__check-slot {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}

.language-switcher__check {
  color: var(--app-color-primary);
  font-size: 12px;
  line-height: 1;
}

.language-switcher-fade-enter-active,
.language-switcher-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.language-switcher-fade-enter-from,
.language-switcher-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
