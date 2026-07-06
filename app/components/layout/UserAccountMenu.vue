<template>
  <a-dropdown trigger="click" placement="bottomRight">
    <button type="button" class="user-account-menu__trigger" :aria-label="displayName">
      <a-avatar v-if="avatarUrl" :src="avatarUrl" :size="32" />
      <a-avatar v-else :size="32">{{ initials }}</a-avatar>
    </button>
    <template #overlay>
      <a-menu class="user-account-menu">
        <a-sub-menu key="language" :title="$t('userMenu.language')">
          <a-menu-item
            v-for="language in languages"
            :key="language.locale"
            :class="{
              'user-account-menu__item--active': language.locale === currentLanguage
            }"
            @click="handleLanguageSelect(language.locale)"
          >
            {{ language.label }}
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="account">
          <NuxtLink class="user-account-menu__link" :to="localePath('/account')">
            {{ $t('userMenu.account') }}
          </NuxtLink>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="sign-out" @click="handleSignOut">
          {{ $t('userMenu.signOut') }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import type { SupportedLocale } from '../../../config/site'

const router = useRouter()
const { localePath } = useLocalePath()
const { logout } = useAuth()
const { displayName, avatarUrl, initials } = useUserAvatar()
const { switchLanguage, languages, currentLanguage } = useLanguageSwitch()

const handleLanguageSelect = async (locale: SupportedLocale) => {
  await switchLanguage(locale)
}

const handleSignOut = async () => {
  await logout()
  await router.push(localePath('/'))
}
</script>

<style scoped lang="scss">
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

.user-account-menu__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

:deep(.user-account-menu__item--active) {
  color: var(--app-color-primary);
  font-weight: 600;
}
</style>
