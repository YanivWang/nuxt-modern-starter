<!--
  【登录页】

  路由：/sign-in、/en/sign-in
  Layout：default

  UI 区块：
  - 居中 auth-card：用户名输入框、密码输入框、提交按钮
  - 底部链接：跳转注册页

  用户流程：
  - 填写 username + password → 提交
  - 成功：message 提示 → 跳转 ?redirect= 指定路径，或默认 /workspace
  - 失败：展示 API 错误信息

  数据 / API：
  - useAuth().login() → app/api/auth（Bearer Token 鉴权）

  表单校验：
  - username、password 均为必填

  SEO / 边界：
  - noindex（不被搜索引擎收录）
  - auth 中间件拦截未登录访问产品区时，会重定向至此页并附带 redirect query
  - 注册成功后可能携带 ?username= 预填（由注册页跳转）
-->
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/lib/http/error'
import { resolveSafeRedirectPath } from '~/utils/safe-redirect'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()
const { login } = useAuth()

const form = reactive({
  username: typeof route.query.username === 'string' ? route.query.username : '',
  password: ''
})
const loading = ref(false)

usePageSeo({
  path: '/sign-in',
  locale: languageStore.currentLanguage,
  title: t('auth.login.title'),
  description: t('auth.login.title'),
  noindex: true
})

const redirectTarget = computed(() =>
  resolveSafeRedirectPath(
    typeof route.query.redirect === 'string' ? route.query.redirect : undefined,
    localePath('/workspace')
  )
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
        <h1 class="auth-card__title">{{ $t('auth.login.title') }}</h1>

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
