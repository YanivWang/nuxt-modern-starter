/*
  【文件职责】
    编辑器页面上下文：解析路由 id、加载项目元数据、维护 cachedProject 防闪烁。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 app/pages/docs/[id].vue 消费。
*/
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/lib/http/error'
import {
  fetchWorkspaceProject,
  getWorkspaceDocPath,
  getWorkspaceNewDocPath,
  isNewWorkspaceProjectId,
  type WorkspaceProject
} from '~/features/workspace'

export const useEditorPage = () => {
  const route = useRoute()
  const languageStore = useLanguageStore()
  const { t } = useI18n()

  const routeId = computed(() => {
    const id = route.params.id
    return String(Array.isArray(id) ? id[0] : id)
  })

  const isNewDraft = computed(() => isNewWorkspaceProjectId(routeId.value))

  const {
    data: project,
    error,
    pending
  } = useAsyncData(
    () => `workspace-project:${routeId.value}`,
    async () => {
      if (isNewWorkspaceProjectId(routeId.value)) {
        return null
      }

      const response = await fetchWorkspaceProject(routeId.value)
      const fetchedProject = response.data.project

      if (!fetchedProject.documentId) {
        throw createError({
          statusCode: 404,
          statusMessage: t('workspace.projectNotFound')
        })
      }

      return fetchedProject
    },
    { watch: [routeId] }
  )

  if (!isNewDraft.value && error.value) {
    const cause = error.value.cause ?? error.value
    const fetchError = cause as { statusCode?: number; response?: { status?: number } }

    throw createError({
      statusCode: fetchError.statusCode || fetchError.response?.status || 500,
      statusMessage: getApiErrorMessage(cause, t('workspace.projectNotFound'))
    })
  }

  const cachedProject = ref<WorkspaceProject | null>(null)

  // 路由 id 切换或刷新时保留上一份 project，避免 EditorWorkspace 标题/壳闪烁
  watch(project, (nextProject) => {
    if (nextProject) {
      cachedProject.value = nextProject
    }
  })

  const resolvedProject = computed(() => project.value ?? cachedProject.value)
  const editorDocumentId = computed(() => resolvedProject.value?.documentId ?? null)
  // /docs/new 无 project 拉取；已有 cachedProject 时不显示全页 loading
  const showLoading = computed(() => pending.value && !isNewDraft.value && !cachedProject.value)

  const onProjectCreated = (createdProject: WorkspaceProject) => {
    cachedProject.value = createdProject
  }

  const onProjectUpdated = (patch: Pick<WorkspaceProject, 'id' | 'title'>) => {
    if (cachedProject.value?.id === patch.id) {
      cachedProject.value = {
        ...cachedProject.value,
        title: patch.title
      }
    }
  }

  usePageSeo({
    path: isNewDraft.value ? getWorkspaceNewDocPath() : getWorkspaceDocPath(routeId.value),
    locale: languageStore.currentLanguage,
    title: isNewDraft.value
      ? `${t('workspace.defaultTitle')} · ${t('workspace.edit')}`
      : `${project.value?.title ?? t('workspace.defaultTitle')} · ${t('workspace.edit')}`,
    description: project.value?.description ?? project.value?.title ?? t('workspace.defaultTitle'),
    noindex: true
  })

  return {
    showLoading,
    editorDocumentId,
    resolvedProject,
    onProjectCreated,
    onProjectUpdated
  }
}
