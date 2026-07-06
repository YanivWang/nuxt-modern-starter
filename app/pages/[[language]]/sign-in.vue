<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '../../api-core/api-error'

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
  path: '/sign-in',
  locale: languageStore.currentLanguage,
  title: t('auth.login.title'),
  description: t('auth.login.lead'),
  noindex: true
})

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/workspace')
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
  <div class="auth-page">
    <AppContainer>
      <a-card class="auth-card" :bordered="false">
        <p class="page-eyebrow">{{ $t('auth.login.eyebrow') }}</p>
        <h1 class="auth-card__title">{{ $t('auth.login.title') }}</h1>
        <p class="auth-card__lead">{{ $t('auth.login.lead') }}</p>

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
            :rules="[{ required: true, message: $t('auth.validation.passwordRequired') }]"
          >
            <a-input-password
              v-model:value="form.password"
              autocomplete="current-password"
              size="large"
            />
          </a-form-item>

          <a-button type="primary" html-type="submit" block :loading="loading">
            {{ $t('auth.login.submit') }}
          </a-button>
        </a-form>

        <p class="auth-card__footer">
          {{ $t('auth.login.noAccount') }}
          <NuxtLink :to="localePath('/sign-up')">{{ $t('auth.register.title') }}</NuxtLink>
        </p>
      </a-card>
    </AppContainer>
  </div>
</template>
