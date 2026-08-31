<!--
  【文件职责】
    账户设置页 UI：展示 authStore 用户信息与 fetchProfileApi 扩展字段，提供退出按钮。
    handleLogout：await logout() 清 session 后经 pushSafely 跳回首页。

  【架构位置】
    登录产品区 — app/features/account，account layout + /account 薄页挂载。

  【主要导出 / 路由】
    AccountPage

  【依赖关系】
    - 依赖：~/api/auth fetchProfileApi、useAuth、useUserAvatar、~/utils/navigate-safely
    - 被引用：app/pages/account.vue、UserAccountMenu 入口

  【渲染 / 数据】
    CSR；GET adapter /me/profile（retryOnUnauthorized）。

  【边界与注意】
    authStore.logout() 不跳转；本组件负责跳回 localePath('/')。
    跳转走 pushSafely：handleLogout 由 click fire-and-forget 调用，
    直接 await router.push 会让路由 guard 抛出的错误变成没人接的 unhandled rejection。
-->
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { fetchProfileApi } from '~/api/auth'
import { pushSafely } from '~/utils/navigate-safely'
import { useAuthSession } from '~/utils/auth-session'

const router = useRouter()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { authStore, logout } = useAuth()
// 令牌读自会话模块；authStore 只提供 user 展示数据
const session = useAuthSession()
const { avatarUrl, initials } = useUserAvatar()

const {
  data: profile,
  pending,
  error,
  refresh
} = await useAsyncData('auth-profile', async () => {
  if (!session.accessToken.value) {
    return null
  }

  const response = await fetchProfileApi(session.accessToken.value)
  return response.data.profile
})

const profileEntries = computed(() => Object.entries(profile.value || {}))

const handleLogout = async () => {
  await logout()
  message.success(t('auth.logout.success'))
  // store 清 session；UI 层跳转公开首页。会话已经清掉了，跳转失败不该再抛出去
  await pushSafely(router, localePath('/'))
}
</script>

<template>
  <section class="account-settings">
    <a-card class="account-settings__card app-data-panel" :bordered="false" :loading="pending">
      <h1 class="account-settings__title app-data-panel__title">{{ $t('accountNav.settings') }}</h1>

      <a-alert
        v-if="error"
        type="error"
        show-icon
        :message="$t('common.loadFailed')"
        class="account-settings__alert app-data-panel__alert"
      >
        <template #action>
          <a-button size="small" @click="() => refresh()">{{ $t('common.retry') }}</a-button>
        </template>
      </a-alert>

      <div class="account-settings__rows app-data-panel__rows">
        <div class="account-settings__row app-data-row">
          <div class="account-settings__label app-data-row__label">
            {{ $t('auth.account.avatar') }}
          </div>
          <div class="account-settings__value app-data-row__value">
            <span
              v-if="avatarUrl"
              class="account-settings__avatar app-avatar-fallback app-avatar-fallback--md app-avatar-fallback--image"
            >
              <img :src="avatarUrl" alt="" />
            </span>
            <span
              v-else
              class="account-settings__avatar app-avatar-fallback app-avatar-fallback--md"
              >{{ initials }}</span
            >
          </div>
          <div class="account-settings__action app-data-row__action" aria-hidden="true" />
        </div>

        <div class="account-settings__row app-data-row">
          <div class="account-settings__label app-data-row__label">
            {{ $t('auth.account.nickname') }}
          </div>
          <div
            class="account-settings__value app-data-row__value"
            :class="{ 'app-data-row__value--empty': !authStore.user?.nickname }"
          >
            {{ authStore.user?.nickname || '-' }}
          </div>
          <div class="account-settings__action app-data-row__action" aria-hidden="true" />
        </div>

        <div class="account-settings__row app-data-row">
          <div class="account-settings__label app-data-row__label">
            {{ $t('auth.form.username') }}
          </div>
          <div class="account-settings__value app-data-row__value app-data-row__value--strong">
            {{ authStore.user?.username }}
          </div>
          <div class="account-settings__action app-data-row__action" aria-hidden="true" />
        </div>

        <template v-if="profileEntries.length">
          <div
            v-for="[key, value] in profileEntries"
            :key="key"
            class="account-settings__row app-data-row"
          >
            <div class="account-settings__label app-data-row__label">{{ key }}</div>
            <div class="account-settings__value app-data-row__value">{{ value ?? '-' }}</div>
            <div class="account-settings__action app-data-row__action" aria-hidden="true" />
          </div>
        </template>

        <div v-else-if="!pending" class="account-settings__row app-data-row">
          <div class="account-settings__label app-data-row__label">
            {{ $t('auth.account.profileTitle') }}
          </div>
          <div class="account-settings__value app-data-row__value app-data-row__value--muted">
            {{ $t('auth.account.emptyProfile') }}
          </div>
          <div class="account-settings__action app-data-row__action" aria-hidden="true" />
        </div>

        <div
          class="account-settings__row account-settings__row--last app-data-row app-data-row--last"
        >
          <div class="account-settings__label app-data-row__label">
            {{ $t('auth.account.sessionTitle') }}
          </div>
          <div class="account-settings__value app-data-row__value app-data-row__value--muted">
            {{ authStore.user?.username }}
          </div>
          <div class="account-settings__action app-data-row__action">
            <button
              type="button"
              class="account-settings__logout app-btn-danger-outline"
              @click="handleLogout"
            >
              {{ $t('auth.logout.submit') }}
            </button>
          </div>
        </div>
      </div>
    </a-card>
  </section>
</template>
