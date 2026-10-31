---
title: Log
type: overview
status: active
updated: 2026-10-31
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
- Commit/PR: 9f9ff6e

## [2026-10-25] decision | ADRs required by the workflow; earlier decisions backfilled
- What: ADRs are now a required output of the change workflow (ADR 0011). The planner lists decisions, the new decision-recorder agent writes the ADRs, and the reviewer and lint check them. Added `docs/decisions/README.md` with the criteria, rules, template and index. Backfilled decisions that previously lived only in prose or conversation: 0003 stack, 0004 seeded accounts, 0005 household scoping and joint records, 0006 Azure hosting, 0007 LLM wiki, 0008 role-based subagents, 0009 integrations (proposed), 0010 TypeScript 5 pin.
- Pages: conventions/change-workflow.md (new Decisions step, checklist), index.md, architecture/harness.md, and `sources:` on stack, auth-and-households, database, data-conventions, deployment, harness, change-workflow and the four integrations pages; AGENTS.md; agents change-planner, change-reviewer, layer-developer, wiki-librarian, decision-recorder (new)
- Commit/PR: 3d8e859

## [2026-10-31] decision | One harness check for hooks, CI and humans
- What: Following the principal-level harness review (finding 3), added `harness/check.mjs` (`npm run harness:check`) with checks for wiki, adrs, presentation, schema drift, tests, typecheck against a recorded baseline (4 known `seed.ts` errors) and build, in `fast` and `full` profiles with JSON reports. The Stop and SubagentStop hooks now run `--profile fast`, and GitHub Actions runs `--profile full` on pushes to main and on PRs. The wiki lint moved from a scratch script into the repo. Each check was proven to fail on a deliberate breakage (broken link, missing ADR index entry, unmigrated column, new type error).
- Pages: architecture/quality-gates.md (new), architecture/validation-hooks.md, architecture/harness.md, conventions/change-workflow.md, roadmap.md, index.md; AGENTS.md; agents layer-developer, change-reviewer, db-migrator, wiki-librarian; ADR 0012
- Commit/PR: c839ad1

## [2026-10-31] ingest | Threat model recorded
- What: Added the AI security threat model of the repo and harness as a raw source (14 findings, prioritised). Open findings are tracked in the roadmap's security backlog.
- Pages: roadmap.md (security backlog), architecture/agent-security.md
- Commit/PR: (this commit)

## [2026-10-31] decision | Harness self-protection and untrusted content
- What: Implemented threat model findings 1–3. Added a trust rule in AGENTS.md (only the user authorises actions; everything read is data); the PreToolUse guard hook (deny/ask by path, shell write and `.env` checks, git-bypass checks, maintenance mode); permission rules; the `integrity` harness check (raw immutability, no deleted tests, baseline not grown, injection scan); CODEOWNERS; and a read-only CI token with the PR base ref. The guard passed 28/28 pipe-test cases. These controls load in new sessions only: in the session that added them, a probe read of `src/app/.env` still succeeded, so the session secret and seed passwords should be rotated.
- Pages: architecture/agent-security.md (new), architecture/quality-gates.md, architecture/validation-hooks.md, architecture/harness.md, roadmap.md, index.md; AGENTS.md; agents wiki-librarian, change-reviewer, layer-developer; ADR 0013
- Commit/PR: (this commit)
