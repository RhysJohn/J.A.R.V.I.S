---
title: Frontend architecture
type: convention
status: active
updated: 2026-10-25
sources: [docs/decisions/0002-presentation-only-components-with-validation-hooks.md]
---

# Frontend architecture

**No business logic in components.** Every layer's frontend is split three ways, and each part has its own kind of test. The split is enforced by the [presentation guard and validation hooks](../architecture/validation-hooks.md).

| Part | Where (per layer) | What goes here | May import | Tested by |
|---|---|---|---|---|
| **Logic** | `app/logic/<domain>/*.ts` | Business rules and calculations: totals, targets, status, validation, edit rules, view models, chart data | Other logic, `shared/` types. **No Vue, no Nuxt, no `$fetch`** | **Unit tests** (`unit` project, plain Node) |
| **Utils** | `app/utils/*.ts` | Small pure helpers and presentation constants: formatting, labels, colours | Logic types | **Unit tests** |
| **Composables** | `app/composables/*.ts` | Data access (`useFetch`/`$fetch`) and orchestration (create the category, then the entry) | Logic, utils, Nuxt | **Component tests** of the pages and components that use them |
| **Presentation** | `app/components/**/*.vue`, `app/pages/**/*.vue`, `app/layouts/*.vue` | Rendering props, emitting events, local UI state (open/closed, the cell being edited), toasts | Logic (explicit import), utils, composables | **Component tests** (`component` project, Nuxt runtime) |

Logic files are imported **explicitly**, e.g. `import { summariseBuckets } from '../../logic/budget/buckets'`, and are not auto-imported. That keeps the dependency visible, both to a reader and to `vitest related`, which the hooks use to pick tests.

## In a component, do / don't

- **Do:** `const summary = computed(() => summariseBuckets(props.totals))`, then render `summary.rows`.
- **Do:** call a logic function to decide what an interaction means, e.g. `resolveAmountEdit(value, entry.amount)`, then emit the result.
- **Don't:** `.reduce`, `.filter`, `.sort`, `Math.*`, or comparisons that encode a rule (`delta < 0.02`) in a component, page or layout. Move it to `app/logic` and unit test it.
- **Don't:** call `$fetch`, `useFetch` or `useAsyncData` from a `.vue` file. Wrap it in a composable.

The [presentation guard](../architecture/validation-hooks.md#presentation-guard) rejects those patterns. For a rare genuine exception, end the line with `// presentation-guard-ignore` and say why in the review.

## Tests

- Tests sit **next to the file they test**, as `<name>.test.ts`: `buckets.ts` → `buckets.test.ts`, `BudgetTable.vue` → `BudgetTable.test.ts`, `pages/budget/index.vue` → `pages/budget/index.test.ts`. Nuxt ignores `*.test.ts` when scanning components, pages and auto-imports.
- **Unit tests** (`app/logic`, `app/utils`, `shared`): plain Vitest, no Nuxt. Cover each rule's edge cases: zero totals, tolerance boundaries, joint vs person, invalid input.
- **Component tests** (`components`, `pages`): `mountSuspended` from `@nuxt/test-utils/runtime`. Assert what the user sees and which events are emitted, not how things are computed (the unit tests cover that). Patterns in use:
  - Use `data-testid` / `data-*` attributes as stable selectors.
  - Mock auto-imported composables with `mockNuxtImport` (see `BudgetEntryModal.test.ts`).
  - Fake API responses with `registerEndpoint` (see `pages/budget/index.test.ts`), and wait for un-awaited `useFetch` data with `vi.waitFor`.
  - Stub `vue-chartjs`; there is no canvas in tests.
  - `UModal` content is teleported to `document.body`, so query the document.
- Commands (from `src/app`): `npm test`, `npm run test:unit`, `npm run test:component`, `npm run lint:presentation`.

## Current modules

| Layer | Logic | Composables |
|---|---|---|
| core | `logic/nav.ts` (`sortNavLinks`) | `useHousehold`, `useAuth` (`loginRequest`, `logoutRequest`, `changePasswordRequest`) |
| finance | `logic/budget/buckets.ts` (50/30/20 totals, status), `table.ts` (table view model, inline-edit rule), `entryForm.ts` (form defaults, options, validation), `chart.ts` (donut data) | `useBudget` (fetching, CRUD, `submitBudgetEntry`) |

## Related

- [Validation hooks](../architecture/validation-hooks.md)
- [Change workflow](change-workflow.md)
- [ADR 0002](../../decisions/0002-presentation-only-components-with-validation-hooks.md)
