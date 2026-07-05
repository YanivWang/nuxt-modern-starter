<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '../../api-core/api-error'

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
    message.error(getApiErrorMessage(error, t('auth.errors.registerFailed')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <AppContainer>
      <a-card class="auth-card" :bordered="false">
        <p class="page-eyebrow">{{ $t('auth.register.eyebrow') }}</p>
        <h1 class="auth-card__title">{{ $t('auth.register.title') }}</h1>
        <p class="auth-card__lead">{{ $t('auth.register.lead') }}</p>

        <a-form :model="form" layout="vertical" @finish="handleSubmit">
          <a-form-item
            name="username"
            :label="$t('auth.form.username')"
            :rules="[{ required: true, message: $t('auth.validation.usernameRequired') }]"
          >
            <a-input v-model:value="form.username" autocomplete="username" size="large" />
          </a-form-item>

          <a-form-item
            name="password"
            :label="$t('auth.form.password')"
            :rules="[
              { required: true, message: $t('auth.validation.passwordRequired') },
              { min: 6, message: $t('auth.validation.passwordMin') }
            ]"
          >
            <a-input-password
              v-model:value="form.password"
              autocomplete="new-password"
              size="large"
            />
          </a-form-item>

          <a-form-item
            name="confirmPassword"
            :label="$t('auth.form.confirmPassword')"
            :rules="[{ validator: validatePasswordConfirm }]"
          >
            <a-input-password
              v-model:value="form.confirmPassword"
              autocomplete="new-password"
              size="large"
            />
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
    </AppContainer>
  </div>
</template>
