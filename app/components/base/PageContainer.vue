<template>
  <section class="page-container">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.page-container {
  width: min(1120px, calc(100% - 40px));
  margin-inline: auto;
  padding-block: clamp(56px, 10vw, 112px);
}
</style>
