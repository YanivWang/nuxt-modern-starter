<!--
  【文件职责】
    公开 header 语言切换下拉：hover / click 打开面板，选择后 chooseLanguage + router.push。
    桌面 hover 打开，触控设备 click 切换。

  【架构位置】
    公开 SEO 区 — app/components/layout，AppHeader utilities 区使用。

  【主要导出 / 路由】
    LanguageSwitcher

  【依赖关系】
    - 依赖：useLanguageSwitch、useCoarsePointer、LanguageOptionList
    - 被引用：AppHeader

  【渲染 / 数据】
    公开页切换会改 URL（/ ↔ /en）；产品区语言切换见 UserAccountMenu。

  【边界与注意】
    选项列表与产品区 UserAccountMenu 共用 LanguageOptionList；本组件只负责触发器与浮层定位。
    切换逻辑统一走 useLanguageSwitch，勿在此重复实现 chooseLanguage + router.push。
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
      <LanguageOptionList
        v-show="isOpen"
        class="language-switcher__panel"
        :languages="languages"
        :current-language="currentLanguage"
        :panel-label="$t('common.switchLanguage')"
        @select="handleLanguageSelect"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { TranslationOutlined } from '../../utils/antdIcon'
import type { SupportedLocale } from '../../../config/site'

const { switchLanguage, languages, currentLanguage } = useLanguageSwitch()
const { isCoarsePointer } = useCoarsePointer()

const isOpen = ref(false)

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

// 触控设备没有 hover，改由点击触发器切换面板
const handleTriggerClick = () => {
  if (isCoarsePointer.value) {
    isOpen.value = !isOpen.value
  }
}

const handleLanguageSelect = async (locale: SupportedLocale) => {
  // 公开页切换语言会改 URL（/ ↔ /en）；产品区不改，差异封装在 switchLocalePath 里
  await switchLanguage(locale)
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

  // hover 打开时补一条不可见的桥接区，避免鼠标从触发器移到面板途中面板关闭
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 0;
    left: 0;
    height: 6px;
  }
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
