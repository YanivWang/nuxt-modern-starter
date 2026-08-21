<!--
  【文件职责】
    语言选项列表：渲染语言条目、选中态与勾选图标，select 事件交给调用方。
    面板浮层的定位由调用方样式决定，本组件只负责列表本身。

  【架构位置】
    共享层 — app/components/layout，被公开站 LanguageSwitcher 与产品区 UserAccountMenu 共用。

  【主要导出 / 路由】
    LanguageOptionList — props: languages / currentLanguage / panelLabel；emit: select

  【依赖关系】
    - 依赖：config/site.ts（SupportedLocale）、utils/antdIcon
    - 被引用：app/components/layout/LanguageSwitcher.vue、UserAccountMenu.vue

  【渲染 / 数据】
    纯展示；不读 store，也不导航 —— 公开页切换会改 URL、产品区不改，差异留在调用方。

  【边界与注意】
    根元素会继承调用方的 scoped 样式，浮层定位类（如 .language-switcher__panel）加在本组件标签上。
-->
<template>
  <div class="language-option-list" role="menu" :aria-label="panelLabel">
    <button
      v-for="language in languages"
      :key="language.locale"
      type="button"
      role="menuitem"
      class="language-option-list__item"
      :class="{ 'language-option-list__item--active': language.locale === currentLanguage }"
      :aria-current="language.locale === currentLanguage ? 'true' : undefined"
      @click="emit('select', language.locale)"
    >
      <span class="language-option-list__label">{{ language.label }}</span>
      <span class="language-option-list__check-slot" aria-hidden="true">
        <CheckOutlined
          v-if="language.locale === currentLanguage"
          class="language-option-list__check"
        />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckOutlined } from '../../utils/antdIcon'
import type { SupportedLocale } from '../../../config/site'

defineProps<{
  languages: readonly { locale: SupportedLocale; label: string }[]
  currentLanguage: SupportedLocale
  panelLabel: string
}>()

// 只上报选择，由调用方决定是否导航、是否关闭外层菜单
const emit = defineEmits<{ select: [locale: SupportedLocale] }>()
</script>

<style scoped lang="scss">
.language-option-list {
  z-index: var(--app-z-index-dropdown);
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
}

.language-option-list__item {
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

.language-option-list__item--active {
  background: var(--app-color-elevated);
  color: var(--app-color-primary);
  font-weight: var(--app-weight-semibold);
}

.language-option-list__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.language-option-list__check-slot {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}

.language-option-list__check {
  color: var(--app-color-primary);
  font-size: var(--app-text-xs);
  line-height: 1;
}
</style>
