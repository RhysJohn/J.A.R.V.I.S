---
title: Quality gates
type: architecture
status: active
updated: 2026-10-31
sources: [docs/decisions/0012-single-harness-check-for-hooks-and-ci.md]
---

# Quality gates

Every machine-checkable gate runs through **one command**, `npm run harness:check` (from `src/app`), which wraps `harness/check.mjs`. The Claude Code Stop hooks, CI and humans all run it, so a change passes or fails the same way everywhere. The decision is recorded in [ADR 0012](../../decisions/0012-single-harness-check-for-hooks-and-ci.md).

## Checks

| Check | What it verifies | Typical time | Profiles |
|---|---|---|---|
| `wiki` | Relative links and `#anchors` resolve across the docs, AGENTS.md, READMEs and agent files. Wiki pages have valid frontmatter whose `sources` exist, and every wiki page is in `index.md` | <1s | fast, full |
| `adrs` | ADR numbers are unique and sequential, titles and `Status` lines are valid, superseded ADRs point at existing ones, and both indexes list every ADR | <1s | fast, full |
| `presentation` | No business logic or data access in `.vue` files (see [frontend architecture](../conventions/frontend-architecture.md)) | <1s | fast, full |
| `schema` | The Drizzle schema matches the committed migrations. `drizzle-kit generate` runs against a scratch copy, so nothing is written and no database is needed | ~1s | fast, full |
| `tests` | All unit and component tests (Vitest, both projects) | ~10s | fast, full |
| `typecheck` | `vue-tsc` reports no errors beyond `harness/typecheck-baseline.json`, matched on file, code and message rather than line number | ~40s | full |
| `build` | `nuxt build` succeeds | ~60s | full |

## Usage

```
npm run harness:check                          # full profile (default)
npm run harness:check -- --profile fast        # what the Stop hooks run
npm run harness:check -- --only wiki,adrs      # just some checks
npm run harness:check -- --skip build
npm run harness:check -- --json                # machine-readable report on stdout
npm run harness:check -- --report out.json     # also write the report to a file
npm run harness:check -- --update-baseline     # rewrite the typecheck baseline (only to shrink it)
npm run harness:check -- --help
```

The exit code is 0 when every selected check passes and 1 otherwise. All checks run even after a failure, so one run reports everything.

The JSON report shape is `{ ok, profile, checks: [{ name, ok, summary, details[], durationMs }] }`. It's the structured result that hooks, CI and the planned workflow graph consume.

## Where each gate runs

| Where | What |
|---|---|
| After each edit (PostToolUse hook) | Presentation guard plus related tests for the edited file. See [validation hooks](validation-hooks.md) |
| Before an agent stops (Stop / SubagentStop hooks) | `--profile fast` when there are uncommitted changes; blocks once on failure |
| CI (`.github/workflows/harness.yml`) | `--profile full` on pushes to `main` and every pull request, with `harness-report.json` uploaded as an artifact |
| Humans, and before merging | `npm run harness:check` |

**To make CI blocking**, require the `harness / check` status check in GitHub branch protection for `main`. This is a repository setting, not something in the code.

## Adding a gate

1. Add `harness/checks/<name>.mjs`, exporting `{ name, description, run(ctx) }`, where `run` returns `{ ok, summary, details[] }`. Use plain Node, and run tools through `runNode` (no shell).
2. Register it in `harness/check.mjs` (`CHECKS`, ordered cheapest first) and choose its profiles. Keep `fast` under about 30s.
3. Prove it fails: break the thing it guards, run `--only <name>`, then restore.
4. Record the decision as an ADR, and update this page.

## The typecheck baseline

`harness/typecheck-baseline.json` lists the known errors (currently 4, all in `server/database/seed.ts`). A new error fails the gate. When a known error is fixed, the check says so: run `--update-baseline` to lock in the smaller list. Never grow the baseline to hide a new error.

## Related

- [Validation hooks](validation-hooks.md)
- [Harness](harness.md)
- [Change workflow](../conventions/change-workflow.md)
- [ADR 0012](../../decisions/0012-single-harness-check-for-hooks-and-ci.md)
