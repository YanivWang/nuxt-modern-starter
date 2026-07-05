# Enterprise API Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Nuxt starter request layer into a maintainable enterprise-grade foundation with shared core behavior and scenario-specific public, auth, and editor API entrypoints.

**Architecture:** Create a small `app/api-core` layer for common request policy, errors, headers, and typed clients. Keep public/SEO requests token-free and cache-friendly, keep auth token lifecycle isolated, and reserve editor APIs for authenticated CSR product workflows. Preserve existing routes, auth behavior, SEO behavior, and deployment assumptions.

**Tech Stack:** Nuxt 4, Vue 3, Pinia, TypeScript, `$fetch`/`useFetch`, Vitest, Ant Design Vue.

---

### Task 1: API Core Contract

**Files:**

- Create: `app/api-core/api-types.ts`
- Create: `app/api-core/api-error.ts`
- Create: `app/api-core/api-headers.ts`
- Create: `app/api-core/create-api-client.ts`
- Test: `tests/unit/api-core.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests for header redaction, auth header creation, base client fetch policy, and normalized error messages.

- [ ] **Step 2: Run red test**

Run: `corepack pnpm test tests/unit/api-core.test.ts`
Expected: fail because `app/api-core/*` files do not exist yet.

- [ ] **Step 3: Implement api-core**

Create focused modules:

- `api-types.ts`: `ApiResponse<T>`, `FlatApiResponse`, `NormalizedFlatApiResponse<T>`, `ApiClientKind`, `ApiClientOptions`, `ApiRequestOptions`.
- `api-error.ts`: `normalizeFlatApiResponse()`, `getApiErrorMessage()`, `createApiFailure()`, `isUnauthorizedError()`.
- `api-headers.ts`: `createHeaders()`, `createBearerHeaders()`, `sanitizeHeaders()`.
- `create-api-client.ts`: `createApiClient()` wrapper around `$fetch` with `baseURL`, headers, error normalization, and optional `onUnauthorized`.

- [ ] **Step 4: Run green test**

Run: `corepack pnpm test tests/unit/api-core.test.ts`
Expected: pass.

### Task 2: Scenario API Entrypoints

**Files:**

- Create: `app/composables/usePublicApi.ts`
- Create: `app/composables/useEditorApi.ts`
- Modify: `app/composables/useApi.ts`
- Test: `tests/unit/use-api.test.ts`

- [ ] **Step 1: Write failing tests**

Extend `tests/unit/use-api.test.ts` to verify:

- public headers do not include `authorization` by default.
- editor headers include bearer token when a token is present.
- API keys include scenario kind so public/editor calls do not collide.

- [ ] **Step 2: Run red test**

Run: `corepack pnpm test tests/unit/use-api.test.ts`
Expected: fail because public/editor composables and key helpers are not implemented.

- [ ] **Step 3: Implement scenario composables**

Keep `useApi` as a backward-compatible authenticated business request entry for now, but move shared key/header policy into exported helpers. Add:

- `usePublicApi<T>()`: no token, no refresh, SSR-friendly.
- `useEditorApi<T>()`: token-aware, authenticated, 401 refresh retry.

- [ ] **Step 4: Run green test**

Run: `corepack pnpm test tests/unit/use-api.test.ts`
Expected: pass.

### Task 3: Auth Adapter Migration

**Files:**

- Create: `app/apis/auth/index.ts`
- Modify: `app/stores/auth.ts`
- Test: `tests/unit/auth-store.test.ts`

- [ ] **Step 1: Write failing import-boundary test**

Add or update tests so the store imports from `app/apis/auth` barrel behavior and still logs in, refreshes, registers, and logs out.

- [ ] **Step 2: Run red/compatibility test**

Run: `corepack pnpm test tests/unit/auth-store.test.ts`
Expected: existing tests pass before migration or fail only when imports are changed.

- [ ] **Step 3: Move auth adapter behind folder barrel**

Move implementation to `app/apis/auth/index.ts`. The old single-file auth adapter cannot coexist with the new folder on the same filesystem, so keep the import path semantic (`../apis/auth`) through the folder barrel.

- [ ] **Step 4: Run green test**

Run: `corepack pnpm test tests/unit/auth-store.test.ts`
Expected: pass.

### Task 4: Public Content Boundary

**Files:**

- Create: `app/apis/public/content.ts`
- Create: `app/apis/public/index.ts`
- Modify: `app/apis/content.ts`
- Modify: `app/pages/[[language]]/help.vue`
- Modify: `app/pages/[[language]]/news/index.vue`
- Modify: `app/pages/[[language]]/news/[slug].vue`
- Test: `tests/unit/public-content-api.test.ts`

- [ ] **Step 1: Write failing public content test**

Test that content APIs return localized FAQ/news data and do not depend on auth/session helpers.

- [ ] **Step 2: Run red test**

Run: `corepack pnpm test tests/unit/public-content-api.test.ts`
Expected: fail because `app/apis/public/content.ts` does not exist.

- [ ] **Step 3: Move public content adapter**

Move content implementation into `app/apis/public/content.ts`, export from `app/apis/public/index.ts`, keep `app/apis/content.ts` as a compatibility re-export, and update page imports to the public adapter.

- [ ] **Step 4: Run green test**

Run: `corepack pnpm test tests/unit/public-content-api.test.ts`
Expected: pass.

### Task 5: Editor API Boundary

**Files:**

- Create: `app/apis/editor/document.ts`
- Create: `app/apis/editor/index.ts`
- Modify: `app/pages/[[language]]/editor.vue`
- Test: `tests/unit/editor-api.test.ts`

- [ ] **Step 1: Write failing editor API test**

Test that editor document API exposes stable save/read function signatures and delegates to the authenticated editor request entrypoint.

- [ ] **Step 2: Run red test**

Run: `corepack pnpm test tests/unit/editor-api.test.ts`
Expected: fail because editor API modules do not exist.

- [ ] **Step 3: Implement editor adapter skeleton**

Add typed `EditorDocument`, `SaveEditorDocumentPayload`, `saveEditorDocument()`, and `fetchEditorDocument()` functions that call `useEditorApi`. Do not wire real backend calls into the page yet; document page keeps local demo content.

- [ ] **Step 4: Run green test**

Run: `corepack pnpm test tests/unit/editor-api.test.ts`
Expected: pass.

### Task 6: Docs and Full Verification

**Files:**

- Modify: `docs/architecture.md`
- Modify: `docs/conventions.md`
- Modify: `docs/usage.md`
- Modify: `docs/decision-record.md`
- Modify: `docs/verification-record.md`

- [ ] **Step 1: Update docs**

Document the enterprise API layering:

- `api-core` owns low-level policy.
- `apis/public` owns SEO/content public data.
- `apis/auth` owns token lifecycle.
- `apis/editor` owns authenticated editor workflows.
- Page components call domain adapters, not raw URLs.

- [ ] **Step 2: Run focused tests**

Run: `corepack pnpm test tests/unit/api-core.test.ts tests/unit/use-api.test.ts tests/unit/public-content-api.test.ts tests/unit/editor-api.test.ts tests/unit/auth-store.test.ts`
Expected: pass.

- [ ] **Step 3: Run full verification**

Run: `corepack pnpm test`
Expected: pass.

Run: `corepack pnpm typecheck`
Expected: pass.

Run: `corepack pnpm build`
Expected: pass.
