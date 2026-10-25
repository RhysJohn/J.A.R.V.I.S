---
title: Log
type: overview
status: active
updated: 2026-10-25
sources: []
---

# Log

Append-only history of the wiki and the project, newest at the bottom. Never edit past entries. The format is in [AGENTS.md](../../AGENTS.md#log-format).

## [2026-10-25] ingest | Finance tracker imported as the base app
- What: The standalone finance-tracker (Nuxt 4, Drizzle, Postgres; auth, household, budget done) was copied into the repo unchanged. The standalone repo is now considered the old version.
- Pages: (wiki not yet created)
- Commit/PR: 9101bb5

## [2026-10-25] decision | One Nuxt app, one layer per domain
- What: Restructured into `src/app` with `core` and `finance` layers. Each layer owns its tables, which are composed in `server/database/schema.ts`. Nav comes from each layer's `app.config`. Typecheck shows the same 7 errors as before, the build passes, and drizzle-kit reports no schema drift.
- Pages: (wiki not yet created); ADR 0001
- Commit/PR: 87f7240

## [2026-10-25] ingest | Wiki and agent harness created
- What: Set up the LLM-wiki structure. `AGENTS.md` is the schema (with `CLAUDE.md` importing it), `docs/raw/` holds immutable sources, and `docs/wiki/` holds the compiled pages. Role subagents are in `.claude/agents/`. The wiki was compiled from the original finance-tracker plan, the user's vision, the harness goal and the current code. The previous CLAUDE.md content was split into wiki pages.
- Pages: all pages in [index](index.md)
- Commit/PR: 352fd5f

## [2026-10-25] decision | Presentation-only frontend with validation hooks
- What: Moved business logic out of the budget components, the budget page and the layout into `app/logic` (finance budget: buckets, table, entryForm, chart; core: nav). Moved `$fetch` calls into composables (`useAuth`, `submitBudgetEntry`). Added Vitest unit and component projects (48 tests), the presentation guard, and Claude Code hooks: related tests after each edit, and the full suite before Stop/SubagentStop. The 3 typecheck errors in the budget modal were fixed along the way (4 remain, in `seed.ts`).
- Pages: architecture/validation-hooks.md (new), conventions/frontend-architecture.md (new), architecture/harness.md, architecture/stack.md, conventions/change-workflow.md, conventions/adding-a-layer.md, domains/finance.md, domains/core.md, roadmap.md; ADR 0002
- Commit/PR: (this commit)
