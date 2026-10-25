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
- Commit/PR: (this commit)
