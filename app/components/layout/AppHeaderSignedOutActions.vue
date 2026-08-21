<!--
  【文件职责】
    公开站顶栏未登录 CTA：登录 / 注册两个入口。
    独立成组件是为了让 AppHeader 的 <ClientOnly> 默认内容与 #fallback 复用同一份标记。

  【架构位置】
    公开 SEO 区 — app/components/layout，仅被 AppHeader 使用。

  【主要导出 / 路由】
    AppHeaderSignedOutActions → /sign-in、/sign-up（localePath）

  【依赖关系】
    - 依赖：useLocalePath、utils/antdIcon
    - 被引用：app/components/layout/AppHeader.vue

  【渲染 / 数据】
    这是公开页 SSR / prerender / SWR 输出中唯一的顶栏 CTA 形态，
    对匿名访客与爬虫都可见，因此必须是真实链接而非占位。

  【边界与注意】
    样式类 .app-header__auth / __sign-in / __sign-up 定义在 app/assets/styles/main.scss，
    与 AppHeader 的 .app-header__workspace 共享按钮基线，勿改为 scoped。
-->
<template>
  <div class="app-header__auth">
    <NuxtLink class="app-header__sign-in" :to="localePath('/sign-in')">
      {{ $t('auth.header.signIn') }}
    </NuxtLink>
    <NuxtLink class="app-header__sign-up" :to="localePath('/sign-up')">
      <span>{{ $t('auth.header.signUp') }}</span>
      <ArrowRightOutlined />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightOutlined } from '../../utils/antdIcon'

// 未登录 CTA 不读任何会话状态，因此可以安全地出现在 SSR / 缓存的 HTML 里
const { localePath } = useLocalePath()
</script>
