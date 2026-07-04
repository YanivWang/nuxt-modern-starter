<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '../../utils/api-contract'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { login } = useAuth()

const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

usePageSeo({
  path: '/login',
  locale: languageStore.currentLanguage,
  title: t('auth.login.title'),
  description: t('auth.login.lead'),
  noindex: true
})

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/account')
)

const handleSubmit = async () => {
  loading.value = true

  try {
    await login(form)
    message.success(t('auth.login.success'))
    await router.push(redirectTarget.value)
  } catch (error) {
    message.error(getApiErrorMessage(error, t('auth.errors.loginFailed')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer>
    <div class="auth-page">
      <a-card class="auth-card">
        <p class="page-eyebrow">{{ $t('auth.login.eyebrow') }}</p>
        <h1 class="auth-card__title">{{ $t('auth.login.title') }}</h1>
        <p class="auth-card__lead">{{ $t('auth.login.lead') }}</p>

        <a-form :model="form" layout="vertical" @finish="handleSubmit">
          <a-form-item
            name="username"
            :label="$t('auth.form.username')"
            :rules="[{ required: true, message: $t('auth.validation.usernameRequired') }]"
          >
            <a-input v-model:value="form.username" autocomplete="username" />
          </a-form-item>

          <a-form-item
            name="password"
            :label="$t('auth.form.password')"
            :rules="[{ required: true, message: $t('auth.validation.passwordRequired') }]"
          >
            <a-input-password v-model:value="form.password" autocomplete="current-password" />
          </a-form-item>

          <a-button type="primary" html-type="submit" block :loading="loading">
            {{ $t('auth.login.submit') }}
          </a-button>
        </a-form>

        <p class="auth-card__footer">
          {{ $t('auth.login.noAccount') }}
          <NuxtLink :to="localePath('/register')">{{ $t('auth.register.title') }}</NuxtLink>
        </p>
      </a-card>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.auth-page {
  display: flex;
  justify-content: center;
  padding: clamp(48px, 8vw, 96px) 0;
}

.auth-card {
  width: min(100%, 440px);
}

.auth-card__title {
  margin: 0;
  font-size: 36px;
  letter-spacing: -0.03em;
}

.auth-card__lead,
.auth-card__footer {
  color: var(--app-color-muted);
}

.auth-card__lead {
  margin: 14px 0 28px;
  line-height: 1.7;
}

.auth-card__footer {
  margin: 20px 0 0;
  text-align: center;
}
</style>
