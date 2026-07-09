/*
  【文件职责】
    编辑器图片/视频上传：图片走 POST /uploads，视频走 large-upload 分片。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 EditorWorkspace 消费。

  【主要导出 / 路由】
    useEditorMediaUpload → handleUploadImage / handleUploadVideo

  【依赖关系】
    - 依赖：uploadImages、useLargeFileUpload、getApiErrorMessage、ant-design-vue message
    - 被引用：components/EditorWorkspace.vue

  【渲染 / 数据】
    CSR；返回绝对媒体 URL 供 YanivEditor 插入。
*/
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/lib/http/error'
import { uploadImages } from '../upload-api'
import { useLargeFileUpload } from '../upload/useLargeFileUpload'

export const useEditorMediaUpload = () => {
  const { t } = useI18n()
  const { uploadFile, phase, progress } = useLargeFileUpload()

  const resolveErrorMessage = (e: unknown, fallback: string) => {
    const fromApi = getApiErrorMessage(e, '')
    if (fromApi) return fromApi
    if (
      e &&
      typeof e === 'object' &&
      'message' in e &&
      typeof e.message === 'string' &&
      e.message
    ) {
      return e.message
    }
    return fallback
  }

  const handleUploadImage = async (file: File): Promise<string> => {
    try {
      const { urls } = await uploadImages([file])
      const url = urls[0]
      if (!url) throw new Error(t('editor.upload.imageFailed'))
      return url
    } catch (e) {
      const msg = resolveErrorMessage(e, t('editor.upload.imageFailed'))
      message.error(msg)
      throw e instanceof Error ? e : new Error(msg)
    }
  }

  const handleUploadVideo = async (file: File): Promise<string> => {
    if (!/^video\//i.test(file.type)) {
      const msg = t('editor.upload.videoTypeInvalid')
      message.error(msg)
      throw new Error(msg)
    }

    const hide = message.loading(t('editor.upload.videoUploading'), 0)

    try {
      const { url } = await uploadFile(file)
      message.success(t('editor.upload.videoSuccess'))
      return url
    } catch (e) {
      const msg = resolveErrorMessage(e, t('editor.upload.videoFailed'))
      message.error(msg)
      throw e instanceof Error ? e : new Error(msg)
    } finally {
      hide()
    }
  }

  return {
    handleUploadImage,
    handleUploadVideo,
    uploadPhase: phase,
    uploadProgress: progress
  }
}
