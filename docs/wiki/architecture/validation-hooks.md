---
title: Validation hooks
type: architecture
status: active
updated: 2026-10-25
sources: [docs/decisions/0002-presentation-only-components-with-validation-hooks.md]
---

# Validation hooks

Claude Code hooks in `.claude/settings.json` validate changes automatically, both while an agent works and before it finishes. They're the harness's machine-checkable gates. A failing hook feeds the failure back to the agent, which is the signal an implementation loop runs on (see [harness](harness.md)).

## After every edit: `validate-change.mjs`

The `PostToolUse` hook on `Write|Edit|MultiEdit` classifies the changed file and runs only what's relevant:

| Changed file (under `src/app`) | What runs |
|---|---|
| `layers/*/app/logic/**`, `app/utils/**`, `shared/**` (`.ts`) | **Unit** tests related to the file (`vitest related <file> --project unit`) |
| `layers/*/app/{components,pages,layouts}/**/*.vue` | **Presentation guard** on the file, then **component** tests related to it |
| `layers/*/app/composables/**` | **Component** tests related to the file |
| `*.test.ts` | That test file |
| Anything else (server, config, docs) | Nothing |

"Related" means Vitest follows the import graph from the changed file to every test that reaches it, including through Nuxt auto-imports. Changing `useHousehold.ts`, for example, runs the budget page test.

**Outcomes:**
- **Pass:** a one-line note is added to the agent's context (`[harness] 16/16 unit tests related to … passed`).
- **No covering test:** a note asks the agent to add `<name>.test.ts`. This doesn't block.
- **Guard violation or test failure:** exit code 2. The agent sees the failing tests, with stack frames trimmed to app code, and must fix them.

Typical cost: about 5s for unit, and 10–20s for component (Nuxt start-up).

## Before finishing: `validate-stop.mjs`

The `Stop` and `SubagentStop` hooks run when there are uncommitted changes to testable files under `src/app`. They run the presentation guard over the changed `.vue` files, then the **full** unit and component suite.

If anything fails, the hook returns `decision: block` with the failures, and the agent continues to fix them. It never blocks twice in a row (`stop_hook_active`), so a stuck agent can still stop and report.

## Presentation guard

`src/app/scripts/check-presentation.mjs` (also `npm run lint:presentation`) scans `.vue` files for:
- **data access:** `$fetch(`, `useFetch(`, `useAsyncData(`. This belongs in composables.
- **calculations:** `.reduce(`, `.filter(`, `.sort(`, `Math.`. This belongs in `app/logic`.

These patterns enforce [frontend architecture](../conventions/frontend-architecture.md). End a line with `// presentation-guard-ignore` to exempt it.

## Files

- `.claude/settings.json`: hook registration (merged with the graphify hooks).
- `.claude/hooks/lib.mjs`: file classification, a Vitest runner using the JSON reporter, and failure formatting.
- `.claude/hooks/validate-change.mjs`, `.claude/hooks/validate-stop.mjs`
- `src/app/vitest.config.ts`: the `unit` (Node) and `component` (Nuxt) projects.

## Caveats

- **Loading:** hooks load when a session starts. A session that began before `.claude/settings.json` existed won't run them until it's restarted.
- **Not covered by these hooks:** typecheck (about 40s, plus the known `seed.ts` errors), build, server/API code (there are no server tests yet), and end-to-end browser tests. All are candidates for future gates.
- **Requirements:** the hooks need `node` on PATH and `npm install` run in `src/app`. They run through bash (Git Bash on Windows).
- **Graphify hooks:** the older graphify hooks in the same file use `python3`. They silently do nothing on machines without Python.

## Related

- [Frontend architecture](../conventions/frontend-architecture.md)
- [Harness](harness.md)
- [Change workflow](../conventions/change-workflow.md)
