---
title: Change workflow
type: convention
status: active
updated: 2026-10-25
sources: [AGENTS.md]
---

# Change workflow

The procedure every agent (and human) follows to change the app. The subagents in `.claude/agents/` each own one or more steps.

> **Interim default.** The user is designing the real workflow: loop engineering for implementation and graph engineering for the end-to-end cycle (see [harness](../architecture/harness.md)). Until those designs are ingested, follow these steps. When the designed workflow replaces this page, rewrite it rather than keeping both.

## Steps

1. **Orient** *(change-planner)*
   - Read [index](../index.md), the relevant domain page, and the architecture and convention pages it links to.
   - Check the latest [log](../log.md) entries.
   - Confirm the facts against the code; the wiki can lag.
2. **Plan** *(change-planner)*
   - Write a short plan: the goal, the files to add or change (by layer), any table changes, API routes, pages, and how to verify.
   - List the **wiki pages that will need updating**.
   - Flag any decision that's really the user's to make.
3. **Schema** *(db-migrator, only if tables change)*
   - Edit the tables in the owning layer.
   - Run `npm run db:generate` and review the SQL.
   - Run `npm run db:migrate` locally if Postgres is running.
4. **Implement** *(layer-developer)*
   - Make the change inside the owning layer, following [data conventions](data-conventions.md), the [layer rules](../architecture/layers.md#dependency-rules) and [frontend architecture](frontend-architecture.md).
   - Business logic goes in `app/logic` with unit tests, and presentation in `.vue` files with component tests.
   - Match the style of the surrounding code: zod schema in `shared/schemas`, thin API handlers, composables wrapping `useFetch`/`$fetch`, `@nuxt/ui` components.
   - The [validation hooks](../architecture/validation-hooks.md) run the related tests after every edit. Treat their failures as part of the loop.
5. **Verify** *(layer-developer)* — from `src/app`:
   - `npm test` and `npm run lint:presentation` must pass. The Stop hook enforces both.
   - `npm run typecheck` must introduce no new errors (see [known issues](../roadmap.md#known-issues)).
   - `npm run build` must pass.
   - If Postgres is up, exercise the feature in the browser with `npm run dev`.
6. **Review** *(change-reviewer)*
   - Check the diff against the checklist below.
   - Fix what it finds, or send the issues back to step 4.
7. **Record** *(layer-developer or main agent)*
   - Update the wiki pages listed in the plan, bump their `updated:`, and add new pages to the index.
   - If an architectural choice was made, add an ADR in `docs/decisions/`.
   - Append to [log](../log.md).
8. **Commit** *(main agent, only when the user asks)*: one commit containing the code, wiki and log together.

## Review checklist

- Every new API handler calls `requireHouseholdSession` and filters every query with `householdScope`.
- Nothing in `layers/core` imports from a feature layer, and no feature layer imports from another.
- Drizzle schema files use relative imports, and new tables are exported via the layer's `index.ts`, which `server/database/schema.ts` includes.
- Money uses `numeric(12,2)` in number mode, and joint vs person-attributed records follow the nullable-`userId` rule.
- zod validation runs on every request body and query.
- No business logic or data access in `.vue` files (`npm run lint:presentation` passes). New logic has unit tests, and new or changed presentation has component tests.
- No secrets or personal financial data are committed.
- Wiki pages, the index and the log are updated, and links resolve.

## Related

- [AGENTS.md](../../../AGENTS.md)
- [Adding a layer](adding-a-layer.md)
- [Data conventions](data-conventions.md)
