/*
  【文件职责】
    当前用户扩展资料的共享领域类型：读取用的 UserProfile 实体与 PATCH 可写字段。
    与后端 UserProfile 契约一一对应。

  【架构位置】
    共享类型层 — app/types，不属于任一 feature。

  【主要导出 / 路由】
    UserProfile、UserProfileGender、WritableUserProfileFields

  【依赖关系】
    - 依赖：无
    - 被引用：app/api/auth.ts、account feature、tests/unit/api-contract.test.ts

  【渲染 / 数据】
    无

  【边界与注意】
    可空字段一律 `| null` 而不是可选：服务端把未填写的列统一归一化成 null 后下发，
    字段本身始终存在。写成可选会让消费方以为要区分「没这个字段」和「字段为空」两种情况。

    头像只存在后端 Users.avatar 一处，这里的 avatar 是它的投影而非独立字段。

    WritableUserProfileFields 不含 id / userId / createdAt / updatedAt：
    后端 PATCH body schema 是 strict 的，多一个键直接 400，不是被忽略。
*/
/** 与后端 PATCH body 的 gender 枚举同源 */
export type UserProfileGender = 'male' | 'female' | 'unknown'

export type UserProfile = {
  id: number
  userId: number
  nickname: string | null
  avatar: string | null
  gender: string | null
  birthday: string | null
  bio: string | null
  address: string | null
  company: string | null
  jobTitle: string | null
  isMarried: boolean | null
  mom: string | null
  father: string | null
  university: string | null
  createdAt: string
  updatedAt: string
}

/** PATCH /me/profile 允许写入的字段；至少要提供一个，否则后端返回 400 */
export type WritableUserProfileFields = {
  nickname: string | null
  avatar: string | null
  gender: UserProfileGender | null
  /** YYYY-MM-DD */
  birthday: string | null
  bio: string | null
  address: string | null
  company: string | null
  jobTitle: string | null
  isMarried: boolean | null
  mom: string | null
  father: string | null
  university: string | null
}
