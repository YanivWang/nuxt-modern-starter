<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { fetchProfileApi } from '../../../apis/auth'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const router = useRouter()
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()

usePageSeo({
  path: '/app/account',
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
  return response.data.profile
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
    <p class="page-eyebrow">{{ $t('auth.account.eyebrow') }}</p>
    <h1 class="page-title">{{ $t('auth.account.title') }}</h1>
    <p class="page-lead">{{ $t('auth.account.lead') }}</p>

    <div class="page-grid page-grid--2 account-grid">
      <a-card class="page-surface-card account-card" :bordered="false">
        <h2 class="account-card__title">{{ $t('auth.account.sessionTitle') }}</h2>
        <a-descriptions bordered :column="1" size="middle">
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

        <div class="account-card__footer">
          <a-button danger size="large" @click="handleLogout">
            {{ $t('auth.logout.submit') }}
          </a-button>
        </div>
      </a-card>

      <a-card class="page-surface-card account-card" :bordered="false" :loading="pending">
        <h2 class="account-card__title">{{ $t('auth.account.profileTitle') }}</h2>
        <a-empty v-if="!profileEntries.length" :description="$t('auth.account.emptyProfile')" />
        <a-descriptions v-else bordered :column="1" size="middle">
          <a-descriptions-item v-for="[key, value] in profileEntries" :key="key" :label="key">
            {{ value ?? '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.account-grid {
  align-items: stretch;
}

.account-card {
  &:hover {
    transform: none;
  }
}

.account-card__title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.account-card__footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--app-color-border);

  .ant-btn {
    min-width: 140px;
    border-radius: 12px;
    font-weight: 600;
  }
}
</style>
