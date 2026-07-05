<script setup lang="ts">
import type { WorkspaceProject } from '../api'

defineProps<{
  project: WorkspaceProject
}>()

const { localePath } = useLocalePath()
</script>

<template>
  <section class="project-edit">
    <header class="project-edit__header">
      <div>
        <p class="page-eyebrow">{{ $t('workspace.editing') }}</p>
        <h1>{{ project.title }}</h1>
        <p class="project-edit__description">{{ project.description }}</p>
      </div>
      <div class="project-edit__actions">
        <NuxtLink :to="localePath(project.previewPath)">
          <a-button>{{ $t('workspace.preview') }}</a-button>
        </NuxtLink>
        <a-button type="primary">{{ $t('workspace.save') }}</a-button>
      </div>
    </header>

    <div class="project-edit__body">
      <aside class="project-edit__slides" aria-label="Slides">
        <button v-for="index in 5" :key="index" :class="{ 'is-active': index === 1 }">
          <span>{{ index }}</span>
          <strong>{{ $t('workspace.slide') }} {{ index }}</strong>
        </button>
      </aside>

      <main class="project-edit__canvas">
        <div class="project-edit__slide">
          <span class="project-edit__bar" />
          <h2>{{ project.title }}</h2>
          <p>{{ $t('workspace.editPlaceholder') }}</p>
        </div>
      </main>

      <aside class="project-edit__panel">
        <h2>{{ $t('workspace.properties') }}</h2>
        <a-form layout="vertical">
          <a-form-item :label="$t('workspace.projectName')">
            <a-input :value="project.title" />
          </a-form-item>
          <a-form-item :label="$t('workspace.slideCount')">
            <a-input-number :value="project.slideCount" :min="1" />
          </a-form-item>
        </a-form>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.project-edit {
  display: flex;
  min-height: calc(100vh - 96px);
  flex-direction: column;
  gap: 20px;
}

.project-edit__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  h1,
  p {
    margin: 0;
  }

  h1 {
    font-size: clamp(26px, 3vw, 36px);
    letter-spacing: -0.03em;
  }
}

.project-edit__description {
  margin-top: 10px;
  color: var(--app-color-muted);
}

.project-edit__actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.project-edit__body {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: 180px minmax(0, 1fr) 260px;
  gap: 18px;
}

.project-edit__slides,
.project-edit__canvas,
.project-edit__panel {
  border: 1px solid var(--app-color-border);
  border-radius: 18px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 5%);
}

.project-edit__slides {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 14px;

  button {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--app-color-text);
    cursor: pointer;
    text-align: left;
  }

  button.is-active {
    border-color: rgb(22 119 255 / 22%);
    background: rgb(22 119 255 / 8%);
  }

  span {
    display: grid;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--app-color-elevated);
    color: var(--app-color-muted);
    font-weight: 700;
    place-items: center;
  }

  strong {
    font-size: 13px;
  }
}

.project-edit__canvas {
  display: grid;
  min-width: 0;
  padding: clamp(18px, 3vw, 32px);
  place-items: center;
}

.project-edit__slide {
  display: grid;
  width: min(100%, 920px);
  aspect-ratio: 16 / 9;
  align-content: center;
  gap: 18px;
  padding: clamp(28px, 5vw, 64px);
  border: 1px solid var(--app-color-border);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgb(22 119 255 / 16%), transparent 56%),
    linear-gradient(180deg, #ffffff, #f7f9ff);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 80%);

  h2,
  p {
    max-width: 560px;
    margin: 0;
    color: #172033;
  }

  h2 {
    font-size: clamp(28px, 4vw, 54px);
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  p {
    color: rgb(23 32 51 / 62%);
    font-size: 17px;
    line-height: 1.7;
  }
}

.project-edit__bar {
  width: 120px;
  height: 8px;
  border-radius: 999px;
  background: var(--app-color-primary);
}

.project-edit__panel {
  padding: 18px;

  h2 {
    margin: 0 0 18px;
    font-size: 18px;
  }
}

@media (width <= 1180px) {
  .project-edit__body {
    grid-template-columns: 150px minmax(0, 1fr);
  }

  .project-edit__panel {
    grid-column: 1 / -1;
  }
}

@media (width <= 760px) {
  .project-edit__header,
  .project-edit__actions {
    flex-direction: column;
  }

  .project-edit__body {
    grid-template-columns: 1fr;
  }
}
</style>
