# Archived planning documents

These files record historical refactoring and optimization plans. They are kept for context only.

**Current source of truth:**

- `docs/architecture.md` — directory layout and runtime flow
- `docs/conventions.md` — coding and import boundaries
- `docs/usage.md` — how to extend pages, features, and API adapters

**Path updates since these plans were written:**

| Old path                     | Current path                                    |
| ---------------------------- | ----------------------------------------------- |
| `app/api-core/*`             | `app/lib/http/*`                                |
| `app/apis/public/*`          | `app/api/public.ts` + `app/api/clients.ts`      |
| `app/apis/auth/*`            | `app/api/auth.ts` + `app/api/clients.ts`        |
| `app/apis/editor/*`          | `app/features/editor/api.ts`                    |
| `app/apis/product/client.ts` | `createProductApiClient()` in `app/api/auth.ts` |

Do not implement new work from the archived plans without cross-checking the live docs above.
