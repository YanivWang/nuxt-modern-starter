<template>
  <a-extract-style>
    <a-config-provider :theme="antdTheme">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>

<script setup lang="ts">
const { antdTheme } = useTheme()
</script>
