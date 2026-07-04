<template>
  <section class="page-container app-container">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.page-container {
  padding-block: clamp(56px, 10vw, 112px);
}
</style>
