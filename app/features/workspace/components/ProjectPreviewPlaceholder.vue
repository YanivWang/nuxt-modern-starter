<script setup lang="ts">
import type { WorkspaceProject } from '../data'

defineProps<{
  project: WorkspaceProject
}>()

const { localePath } = useLocalePath()
</script>

<template>
  <section class="project-preview">
    <header class="project-preview__header">
      <div>
        <p class="page-eyebrow">{{ $t('workspace.previewing') }}</p>
        <h1>{{ project.title }}</h1>
        <p class="project-preview__description">{{ project.description }}</p>
      </div>
      <NuxtLink :to="localePath(project.editPath)">
        <a-button type="primary">{{ $t('workspace.edit') }}</a-button>
      </NuxtLink>
    </header>

    <main class="project-preview__stage">
      <div class="project-preview__slide">
        <span />
        <h2>{{ project.title }}</h2>
        <p>{{ $t('workspace.previewPlaceholder') }}</p>
      </div>
    </main>

    <footer class="project-preview__footer">
      <span>{{ project.slideCount }} {{ $t('workspace.slides') }}</span>
      <NuxtLink :to="localePath('/app/workspace')">{{ $t('workspace.backToWorkspace') }}</NuxtLink>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.project-preview {
  display: grid;
  gap: 22px;
}

.project-preview__header,
.project-preview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.project-preview__header {
  h1,
  p {
    margin: 0;
  }

  h1 {
    font-size: clamp(28px, 4vw, 42px);
    letter-spacing: -0.03em;
  }
}

.project-preview__description {
  margin-top: 10px;
  color: var(--app-color-muted);
}

.project-preview__stage {
  display: grid;
  min-height: min(66vh, 720px);
  padding: clamp(18px, 4vw, 40px);
  border: 1px solid var(--app-color-border);
  border-radius: 22px;
  background: #151923;
  box-shadow: 0 20px 60px rgb(15 23 42 / 16%);
  place-items: center;
}

.project-preview__slide {
  display: grid;
  width: min(100%, 1080px);
  aspect-ratio: 16 / 9;
  align-content: center;
  gap: 18px;
  padding: clamp(32px, 6vw, 84px);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgb(22 119 255 / 18%), transparent 58%),
    linear-gradient(180deg, #ffffff, #f7f9ff);

  span {
    width: 132px;
    height: 8px;
    border-radius: 999px;
    background: var(--app-color-primary);
  }

  h2,
  p {
    max-width: 680px;
    margin: 0;
    color: #172033;
  }

  h2 {
    font-size: clamp(34px, 5vw, 64px);
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  p {
    color: rgb(23 32 51 / 62%);
    font-size: clamp(16px, 2vw, 22px);
    line-height: 1.7;
  }
}

.project-preview__footer {
  color: var(--app-color-muted);
  font-size: 14px;

  a {
    color: var(--app-color-primary);
    font-weight: 700;
    text-decoration: none;
  }
}

@media (width <= 760px) {
  .project-preview__header,
  .project-preview__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
