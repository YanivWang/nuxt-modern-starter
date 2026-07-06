<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { fetchProfileApi } from '~/api/auth'

const router = useRouter()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()
const { avatarUrl, initials } = useUserAvatar()

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
  <section class="account-settings">
    <a-card class="account-settings__card" :bordered="false" :loading="pending">
      <h1 class="account-settings__title">{{ $t('accountNav.settings') }}</h1>

      <div class="account-settings__rows">
        <div class="account-settings__row">
          <div class="account-settings__label">{{ $t('auth.account.avatar') }}</div>
          <div class="account-settings__value">
            <span v-if="avatarUrl" class="account-settings__avatar account-settings__avatar--image">
              <img :src="avatarUrl" alt="" />
            </span>
            <span v-else class="account-settings__avatar">{{ initials }}</span>
          </div>
          <div class="account-settings__action" aria-hidden="true" />
        </div>

        <div class="account-settings__row">
          <div class="account-settings__label">{{ $t('auth.account.nickname') }}</div>
          <div
            class="account-settings__value"
            :class="{ 'account-settings__value--empty': !authStore.user?.nickname }"
          >
            {{ authStore.user?.nickname || '-' }}
          </div>
          <div class="account-settings__action" aria-hidden="true" />
        </div>

        <div class="account-settings__row">
          <div class="account-settings__label">{{ $t('auth.form.username') }}</div>
          <div class="account-settings__value account-settings__value--strong">
            {{ authStore.user?.username }}
          </div>
          <div class="account-settings__action" aria-hidden="true" />
        </div>

        <template v-if="profileEntries.length">
          <div v-for="[key, value] in profileEntries" :key="key" class="account-settings__row">
            <div class="account-settings__label">{{ key }}</div>
            <div class="account-settings__value">{{ value ?? '-' }}</div>
            <div class="account-settings__action" aria-hidden="true" />
          </div>
        </template>

        <div v-else-if="!pending" class="account-settings__row">
          <div class="account-settings__label">{{ $t('auth.account.profileTitle') }}</div>
          <div class="account-settings__value account-settings__value--muted">
            {{ $t('auth.account.emptyProfile') }}
          </div>
          <div class="account-settings__action" aria-hidden="true" />
        </div>

        <div class="account-settings__row account-settings__row--last">
          <div class="account-settings__label">{{ $t('auth.account.sessionTitle') }}</div>
          <div class="account-settings__value account-settings__value--muted">
            {{ authStore.user?.username }}
          </div>
          <div class="account-settings__action">
            <button type="button" class="account-settings__logout" @click="handleLogout">
              {{ $t('auth.logout.submit') }}
            </button>
          </div>
        </div>
      </div>
    </a-card>
  </section>
</template>

<style scoped lang="scss">
.account-settings__card {
  overflow: hidden;
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);

  :deep(.ant-card-body) {
    padding: 28px 0 8px;
  }
}

.account-settings__title {
  margin: 0 0 8px;
  padding: 0 28px;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.account-settings__rows {
  display: grid;
}

.account-settings__row {
  position: relative;
  display: grid;
  align-items: center;
  gap: 16px 24px;
  min-height: 72px;
  padding: 18px 28px;
  grid-template-columns: minmax(120px, 160px) minmax(0, 1fr) auto;

  &::after {
    content: '';
    position: absolute;
    right: 28px;
    bottom: 0;
    left: 28px;
    height: 1px;
    background: rgb(15 23 42 / 8%);
  }
}

.account-settings__row--last::after {
  display: none;
}

.account-settings__label {
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
}

.account-settings__value {
  min-width: 0;
  color: #111827;
  font-size: 15px;
  line-height: 1.4;
  overflow-wrap: anywhere;

  &--strong {
    font-weight: 600;
  }

  &--empty,
  &--muted {
    color: #6b7280;
  }
}

.account-settings__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #22c55e;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;

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

.account-settings__action {
  display: flex;
  justify-content: flex-end;
  min-width: 96px;
}

.account-settings__logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 18px;
  border: 1px solid rgb(239 68 68 / 28%);
  border-radius: 8px;
  background: #ffffff;
  color: #ef4444;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: rgb(239 68 68 / 45%);
    background: rgb(239 68 68 / 4%);
  }

  &:focus-visible {
    outline: 2px solid rgb(239 68 68 / 28%);
    outline-offset: 2px;
  }
}

@media (width <= 760px) {
  .account-settings__title {
    padding: 0 20px;
    font-size: 22px;
  }

  .account-settings__row {
    gap: 10px 16px;
    min-height: auto;
    padding: 16px 20px;
    grid-template-columns: 1fr auto;

    &::after {
      right: 20px;
      left: 20px;
    }
  }

  .account-settings__label {
    grid-column: 1 / -1;
  }

  .account-settings__value {
    grid-column: 1;
  }

  .account-settings__action {
    grid-column: 2;
    grid-row: 2;
    min-width: 0;
  }
}
</style>
