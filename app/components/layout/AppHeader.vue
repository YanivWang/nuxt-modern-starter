<template>
  <header class="app-header">
    <BaseLogo />
    <nav class="app-nav" aria-label="Primary navigation">
      <NuxtLink v-for="item in NAV_ITEMS" :key="item.path" :to="localePath(item.path)">
        {{ $t(item.labelKey) }}
      </NuxtLink>
    </nav>
    <div class="app-header__actions">
      <a-select
        :value="languageStore.currentLanguage"
        :aria-label="$t('common.switchLanguage')"
        class="app-header__language"
        @change="handleLanguageChange"
      >
        <a-select-option
          v-for="language in languageStore.languages"
          :key="language.locale"
          :value="language.locale"
        >
          {{ language.label }}
        </a-select-option>
      </a-select>
      <a-button :aria-label="$t('common.switchTheme')" @click="toggleTheme">
        {{ resolvedMode === 'dark' ? 'Light' : 'Dark' }}
      </a-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { NAV_ITEMS, SUPPORTED_LOCALES, type SupportedLocale } from '../../../config/site'

const router = useRouter()
const languageStore = useLanguageStore()
const { localePath, switchLocalePath } = useLocalePath()
const { resolvedMode, toggleTheme } = useTheme()

const handleLanguageChange = async (value: unknown) => {
  if (!SUPPORTED_LOCALES.includes(value as SupportedLocale)) {
    return
  }

  const locale = value as SupportedLocale

  await languageStore.chooseLanguage(locale)
  await router.push(switchLocalePath(locale))
}
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px clamp(20px, 6vw, 80px);
  border-bottom: 1px solid var(--app-color-border);
}

.app-nav,
.app-header__actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.app-nav a {
  color: var(--app-color-muted);
  text-decoration: none;
}

.app-nav a.router-link-active {
  color: var(--app-color-primary);
}

.app-header__language {
  min-width: 126px;
}

@media (width <= 760px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-nav {
    flex-wrap: wrap;
  }
}
</style>
