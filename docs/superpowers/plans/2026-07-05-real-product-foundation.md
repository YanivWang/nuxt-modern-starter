# Real Product Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace frontend mock workspace/editor data with real authenticated API-backed project and document flows.

**Architecture:** Keep the backend as a mainstream modular Express monolith with `routes -> controller -> service -> model`, Zod validation, Sequelize migrations, OpenAPI generation, and integration tests. Keep the frontend as thin Nuxt pages plus feature-level API/composables/components.

**Tech Stack:** Express, Sequelize, Zod, OpenAPI, Vitest/Supertest, Nuxt 4, Pinia, Ant Design Vue, TypeScript.

---

### Task 1: Backend API Contract And Domain Model

**Files:**

- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/utils/response.ts`
- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/models/index.ts`
- Create: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/modules/workspace/*`
- Create: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/modules/document/*`
- Create: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/migrations/*create-workspaces-projects-documents.ts`
- Test: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter-api/src/product-foundation.integration.test.ts`

- [x] Write failing integration tests for `{ code, message, data }`, project creation/listing, document read/save, and user isolation.
- [x] Implement response envelope normalization.
- [x] Add Workspace, Project, and Document Sequelize models and migration.
- [x] Add Zod schemas, services, controllers, and routes.
- [x] Register routes and update OpenAPI generation.
- [x] Run backend integration tests and full backend check.

### Task 2: Frontend Real API Consumption

**Files:**

- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/app/api-core/*`
- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/app/features/workspace/*`
- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/app/features/editor/*`
- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/app/pages/app/workspace/*`
- Modify: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/app/pages/app/editor.vue`
- Test: `/Users/wangcheng/Documents/workSpace/frontEnd/nuxtProjects/nuxt-modern-starter/tests/unit/*`

- [x] Update tests to require real API boundary calls instead of static mock data.
- [x] Add project/document API modules under feature boundaries.
- [x] Change workspace dashboard to load and create projects through API.
- [x] Change editor workspace to load and save documents through API.
- [x] Run frontend unit tests, typecheck, and build.
