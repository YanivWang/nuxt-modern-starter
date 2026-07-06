<!--
  【注册页】

  路由：/sign-up、/en/sign-up
  Layout：default

  UI 区块：
  - 居中 auth-card：用户名、密码、确认密码输入框、提交按钮
  - 底部链接：跳转登录页

  用户流程：
  - 填写表单 → 提交
  - 成功：message 提示 → 跳转 /sign-in?username=xxx（预填用户名）
  - 失败：展示 API 错误信息

  数据 / API：
  - useAuth().register() → app/api/auth

  表单校验：
  - username 必填
  - password 必填且最少 6 位
  - confirmPassword 必填且须与 password 一致（自定义 validator）

  SEO / 边界：
  - noindex
  - 首页 Hero/CTA、定价页 Starter/Custom 方案、AppHeader 均有入口
-->
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/lib/http/error'

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
  path: '/sign-up',
  locale: languageStore.currentLanguage,
  title: t('auth.register.title'),
  description: t('auth.register.title'),
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
      path: localePath('/sign-in'),
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
        <h1 class="auth-card__title">{{ $t('auth.register.title') }}</h1>

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
          <NuxtLink :to="localePath('/sign-in')">{{ $t('auth.login.title') }}</NuxtLink>
        </p>
      </a-card>
    </AppContainer>
  </div>
</template>
