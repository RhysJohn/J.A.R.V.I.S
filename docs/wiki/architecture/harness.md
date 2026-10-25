---
title: Harness
type: architecture
status: planned
updated: 2026-10-25
sources: [docs/raw/2026-10-25-harness-goal.md, docs/decisions/0002-presentation-only-components-with-validation-hooks.md]
---

# Harness

The long-term goal is a **harness framework that sits around the application**: the structure that lets agents develop J.A.R.V.I.S reliably. The user will design two workflows on top of it:

- **Loop engineering (implementation):** the inner loop an agent runs to implement one change, for example act → verify → fix, repeated until it meets the definition of done.
- **Graph engineering (end-to-end cycle):** the outer development cycle as a graph of agent nodes, from request through plan, schema, implement, review, record and release, with the edges and conditions between them.

**The loop and graph designs are the user's to make, and aren't specified yet.** This page records what the harness already provides, so the design can build on it. When the designs exist, add them as raw sources and ingest them here.

## What exists now

| Harness part | Where | Role |
|---|---|---|
| Operating contract | [AGENTS.md](../../../AGENTS.md) | Rules every agent follows |
| Knowledge (memory) | `docs/wiki/` | Compiled, current project knowledge; read before acting, updated after |
| Inputs | `docs/raw/` | Immutable sources the wiki is compiled from |
| Decisions | `docs/decisions/` | ADRs |
| History | [log](../log.md) | Append-only record of every ingest, change and lint |
| Nodes | `.claude/agents/*.md` | Role subagents, each with an input/output contract and a definition of done |
| Validation hooks | [validation hooks](validation-hooks.md) (`.claude/hooks/`) | Run automatically: the presentation guard and related unit/component tests after each edit; the full suite before an agent stops |
| Verification gates | `npm test`, `npm run lint:presentation`, `npm run typecheck`, `npm run build`, `drizzle-kit generate` (no drift) | Machine-checkable "done" signals for loops |
| Interim workflow | [change workflow](../conventions/change-workflow.md) | The default sequence until the designed graph replaces it |

## Design notes for the loop and graph

- Every agent file declares **inputs**, **outputs** and **done when**, so it can be a node in a graph and its "done when" can serve as a loop's exit condition.
- Gates are commands with exit codes, so a loop can run them unattended. The validation hooks already run tests and the guard as a loop: edit → hook fails with exit 2 → fix → hook passes. The Stop hook is the exit condition, since an agent can't finish with red tests. Gaps today:
  - no server/API tests
  - typecheck has 4 known errors (in `seed.ts`), so the gate is "no new errors" rather than "zero errors"
  - typecheck and build aren't run by a hook
  - there's no end-to-end or browser check
  
  Closing these gives the loops stronger signals.
- The wiki and log are the shared state between nodes. A node reads the relevant pages and writes its results back, so a later node, or a fresh session, can pick up from the wiki alone.
- `cicd/` is reserved for running the harness in CI. Unit and component tests are colocated with the code (see [frontend architecture](../conventions/frontend-architecture.md)), so `tests/` is free for end-to-end tests later.

## Related

- [Change workflow](../conventions/change-workflow.md)
- [Roadmap](../roadmap.md)
- [AGENTS.md](../../../AGENTS.md)
