<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { fetchProfileApi } from '~/apis/auth'

const router = useRouter()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()

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
  <section class="account-page">
    <div class="account-page__hero">
      <p class="page-eyebrow">{{ $t('auth.account.eyebrow') }}</p>
      <h1 class="account-page__title">{{ $t('auth.account.title') }}</h1>
      <p class="account-page__lead">{{ $t('auth.account.lead') }}</p>
    </div>

    <div class="account-page__grid">
      <a-card class="page-surface-card account-page__card" :bordered="false">
        <h2 class="account-page__card-title">{{ $t('auth.account.sessionTitle') }}</h2>
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

        <div class="account-page__card-footer">
          <a-button danger size="large" @click="handleLogout">
            {{ $t('auth.logout.submit') }}
          </a-button>
        </div>
      </a-card>

      <a-card class="page-surface-card account-page__card" :bordered="false" :loading="pending">
        <h2 class="account-page__card-title">{{ $t('auth.account.profileTitle') }}</h2>
        <a-empty v-if="!profileEntries.length" :description="$t('auth.account.emptyProfile')" />
        <a-descriptions v-else bordered :column="1" size="middle">
          <a-descriptions-item v-for="[key, value] in profileEntries" :key="key" :label="key">
            {{ value ?? '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </section>
</template>

<style scoped lang="scss">
.account-page {
  display: grid;
  gap: 28px;
}

.account-page__title {
  max-width: 760px;
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.account-page__lead {
  max-width: 680px;
  margin: 14px 0 0;
  color: var(--app-color-muted);
  font-size: 16px;
  line-height: 1.7;
}

.account-page__grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
}

.account-page__card {
  &:hover {
    transform: none;
  }
}

.account-page__card-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.account-page__card-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--app-color-border);

  .ant-btn {
    min-width: 140px;
    border-radius: 12px;
    font-weight: 600;
  }
}

@media (width <= 900px) {
  .account-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
