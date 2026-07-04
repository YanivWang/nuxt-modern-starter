<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { fetchProfileApi } from '../../apis/auth'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()

usePageSeo({
  path: '/account',
  locale: languageStore.currentLanguage,
  title: t('auth.account.title'),
  description: t('auth.account.lead'),
  noindex: true
})

const { data: profile, pending } = await useAsyncData('auth-profile', async () => {
  if (!authStore.accessToken) {
    return null
  }

  const response = await fetchProfileApi(authStore.accessToken)
  return response.profile
})

const profileEntries = computed(() => Object.entries(profile.value || {}))

const handleLogout = async () => {
  await logout()
  message.success(t('auth.logout.success'))
  await router.push(localePath('/'))
}
</script>

<template>
  <PageContainer>
    <section class="account-page">
      <div>
        <p class="page-eyebrow">{{ $t('auth.account.eyebrow') }}</p>
        <h1 class="page-title">{{ $t('auth.account.title') }}</h1>
        <p class="page-lead">{{ $t('auth.account.lead') }}</p>
      </div>

      <a-card class="account-card" :title="$t('auth.account.sessionTitle')">
        <a-descriptions bordered :column="1">
          <a-descriptions-item :label="$t('auth.account.userId')">
            {{ authStore.user?.id }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('auth.form.username')">
            {{ authStore.user?.username }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('auth.account.nickname')">
            {{ authStore.user?.nickname || '-' }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('auth.account.roles')">
            {{
              authStore.user?.roles.length
                ? authStore.user.roles.join(', ')
                : $t('auth.account.none')
            }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('auth.account.permissions')">
            {{
              authStore.user?.permissions.length
                ? authStore.user.permissions.join(', ')
                : $t('auth.account.none')
            }}
          </a-descriptions-item>
        </a-descriptions>

        <a-button class="account-card__logout" danger @click="handleLogout">
          {{ $t('auth.logout.submit') }}
        </a-button>
      </a-card>

      <a-card class="account-card" :title="$t('auth.account.profileTitle')" :loading="pending">
        <a-empty v-if="!profileEntries.length" :description="$t('auth.account.emptyProfile')" />
        <a-descriptions v-else bordered :column="1">
          <a-descriptions-item v-for="[key, value] in profileEntries" :key="key" :label="key">
            {{ value ?? '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.account-page {
  display: grid;
  gap: 28px;
  padding: clamp(48px, 8vw, 96px) 0;
}

.account-card {
  max-width: 860px;
}

.account-card__logout {
  margin-top: 24px;
}
</style>
