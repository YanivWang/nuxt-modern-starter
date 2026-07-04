<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { register } = useAuth()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)

usePageSeo({
  path: '/register',
  locale: languageStore.currentLanguage,
  title: t('auth.register.title'),
  description: t('auth.register.lead'),
  noindex: true
})

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { data?: { msg?: string }; message?: string }
  return apiError.data?.msg || apiError.message || fallback
}

const validatePasswordConfirm = async (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject(t('auth.validation.confirmPasswordRequired'))
  }

  if (value !== form.password) {
    return Promise.reject(t('auth.validation.passwordMismatch'))
  }

  return Promise.resolve()
}

const handleSubmit = async () => {
  loading.value = true

  try {
    await register({
      username: form.username,
      password: form.password
    })
    message.success(t('auth.register.success'))
    await router.push({
      path: localePath('/login'),
      query: { username: form.username }
    })
  } catch (error) {
    message.error(errorMessage(error, t('auth.errors.registerFailed')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer>
    <div class="auth-page">
      <a-card class="auth-card">
        <p class="page-eyebrow">{{ $t('auth.register.eyebrow') }}</p>
        <h1 class="auth-card__title">{{ $t('auth.register.title') }}</h1>
        <p class="auth-card__lead">{{ $t('auth.register.lead') }}</p>

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
            :rules="[
              { required: true, message: $t('auth.validation.passwordRequired') },
              { min: 6, message: $t('auth.validation.passwordMin') }
            ]"
          >
            <a-input-password v-model:value="form.password" autocomplete="new-password" />
          </a-form-item>

          <a-form-item
            name="confirmPassword"
            :label="$t('auth.form.confirmPassword')"
            :rules="[{ validator: validatePasswordConfirm }]"
          >
            <a-input-password v-model:value="form.confirmPassword" autocomplete="new-password" />
          </a-form-item>

          <a-button type="primary" html-type="submit" block :loading="loading">
            {{ $t('auth.register.submit') }}
          </a-button>
        </a-form>

        <p class="auth-card__footer">
          {{ $t('auth.register.hasAccount') }}
          <NuxtLink :to="localePath('/login')">{{ $t('auth.login.title') }}</NuxtLink>
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
